import * as Tone from "tone";
import type { PlaybackNote, Track } from "../domain/types";
import { StringSynth } from "./StringSynth";

export type AudioEngineEvent = {
	type: "note-on";
	note: PlaybackNote;
};

/** Per-track playback state held by the engine. */
interface TrackState {
	trackId: string;
	synth: StringSynth;
	volume: Tone.Volume;
	part: Tone.Part<{ time: number; note: PlaybackNote }>;
	/** Last explicitly set volume (0–1) — used to restore after un-mute. */
	userVolume: number;
	muted: boolean;
}

export class AudioEngine {
	private static instance: AudioEngine;
	private tracks = new Map<string, TrackState>();
	private onNoteListeners: ((event: AudioEngineEvent) => void)[] = [];
	private baseBpm: number = 120;

	// biome-ignore lint/complexity/noUselessConstructor: singleton pattern requires private constructor
	private constructor() {}

	public static getInstance(): AudioEngine {
		if (!AudioEngine.instance) {
			AudioEngine.instance = new AudioEngine();
		}
		return AudioEngine.instance;
	}

	/** Start the audio context if it's suspended. */
	public async start(): Promise<void> {
		if (Tone.getContext().state !== "running") {
			await Tone.start();
		}
	}

	/**
	 * Load all tracks from a song into the transport.
	 * Replaces any previously loaded tracks.
	 */
	public loadSong(tracks: Track[]): void {
		this._disposeTracks();

		for (const track of tracks) {
			const synth = new StringSynth();
			const vol = new Tone.Volume(0);
			synth.connect(vol);
			vol.toDestination();

			const partEvents = track.notes.map((note) => ({
				time: note.startTime,
				note,
			}));
			const part = new Tone.Part<{ time: number; note: PlaybackNote }>(
				(time, event) => {
					this._triggerNoteInternal(event.note, time, synth);
					Tone.Draw.schedule(() => {
						this.emit({ type: "note-on", note: event.note });
					}, time);
				},
				partEvents,
			);
			part.start(0);

			this.tracks.set(track.id, {
				trackId: track.id,
				synth,
				volume: vol,
				part,
				userVolume: 1,
				muted: false,
			});
		}
	}

	/**
	 * Trigger a note on the track it belongs to.
	 * @param note - The note to play
	 * @param time - Absolute time (seconds) for scheduling
	 */
	public triggerNote(note: PlaybackNote, time: number): void {
		const state = this.tracks.get(note.trackId);
		if (state) {
			this._triggerNoteInternal(note, time, state.synth);
		}
	}

	/** Get the StringSynth for a specific track (for testing). */
	public getStringSynth(trackId: string): StringSynth | undefined {
		return this.tracks.get(trackId)?.synth;
	}

	/**
	 * Set the volume for a specific track.
	 * @param trackId - The track ID
	 * @param volume - Gain value (0–1)
	 */
	public setTrackVolume(trackId: string, volume: number): void {
		const state = this.tracks.get(trackId);
		if (!state) return;
		state.userVolume = volume;
		if (!state.muted) {
			state.volume.volume.value = Tone.gainToDb(volume);
		}
	}

	/**
	 * Mute or un-mute a specific track.
	 * Un-muting restores the last set volume.
	 */
	public setTrackMute(trackId: string, muted: boolean): void {
		const state = this.tracks.get(trackId);
		if (!state) return;
		state.muted = muted;
		state.volume.volume.value = muted
			? Tone.gainToDb(0)
			: Tone.gainToDb(state.userVolume);
	}

	/**
	 * Solo a track: unmutes the given track and mutes all others.
	 * Pass `null` to clear solo (restore all to their user volumes).
	 */
	public setSolo(trackId: string | null): void {
		for (const [id, state] of this.tracks) {
			if (trackId === null) {
				// Restore every track
				state.muted = false;
				state.volume.volume.value = Tone.gainToDb(state.userVolume);
			} else {
				const shouldMute = id !== trackId;
				state.muted = shouldMute;
				state.volume.volume.value = shouldMute
					? Tone.gainToDb(0)
					: Tone.gainToDb(state.userVolume);
			}
		}
	}

	/** Stop all notes and the transport. */
	public stopAll(): void {
		for (const state of this.tracks.values()) {
			state.synth.releaseAll();
		}
		Tone.getTransport().stop();
	}

	/**
	 * Reset playback state for a new song.
	 * Resets transport position to 0 and speed to 1x.
	 */
	public reset(): void {
		this.stopAll();
		Tone.getTransport().seconds = 0;
		Tone.getTransport().bpm.value = this.baseBpm;
	}

	/**
	 * Set playback speed (tempo multiplier).
	 * Changes Tone.Transport.bpm to preserve pitch for synthesized notes.
	 */
	public setSpeed(multiplier: number): void {
		const newBpm = this.baseBpm * multiplier;
		Tone.getTransport().bpm.value = newBpm;
	}

	/** Set the base BPM for speed calculations. */
	public setBaseBpm(bpm: number): void {
		this.baseBpm = bpm;
	}

	/** Visual event subscription. */
	public addNoteListener(
		listener: (event: AudioEngineEvent) => void,
	): () => void {
		this.onNoteListeners.push(listener);
		return () => {
			this.onNoteListeners = this.onNoteListeners.filter((l) => l !== listener);
		};
	}

	/** Dispose of all resources. */
	public dispose(): void {
		this._disposeTracks();
		this.onNoteListeners = [];
	}

	// --------------------------------------------------------------------------
	// Private helpers
	// --------------------------------------------------------------------------

	private _triggerNoteInternal(
		note: PlaybackNote,
		time: number,
		synth: StringSynth,
	): void {
		const freq = Tone.Frequency(note.pitch, "midi").toFrequency();
		synth.triggerAttackRelease(note.string, freq, note.duration, time);

		if (note.techniques?.bend) {
			synth.detuneRamp(
				note.string,
				note.techniques.bend.value,
				note.duration / 2,
				time,
			);
		}

		if (note.techniques?.slide) {
			const offset =
				note.techniques.slide.type === "up"
					? 2
					: note.techniques.slide.type === "down"
						? -2
						: 0;
			if (offset !== 0) {
				const targetFreq = Tone.Frequency(
					note.pitch + offset,
					"midi",
				).toFrequency();
				synth.frequencyRamp(
					note.string,
					targetFreq,
					note.duration * 0.8,
					time + note.duration * 0.2,
				);
			}
		}
	}

	private _disposeTracks(): void {
		for (const state of this.tracks.values()) {
			state.part.dispose();
			state.synth.dispose();
			state.volume.dispose();
		}
		this.tracks.clear();
	}

	private emit(event: AudioEngineEvent): void {
		for (const listener of this.onNoteListeners) {
			listener(event);
		}
	}
}
