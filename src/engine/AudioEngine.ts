import * as Tone from "tone";
import type { PlaybackNote, Track } from "../domain/types";
import { StringSynth } from "./StringSynth";

/**
 * Event emitted by the audio engine for visual synchronization.
 */
export type AudioEngineEvent = {
	/** Event type identifier */
	type: "note-on";
	/** The note that started playing */
	note: PlaybackNote;
};

/** Per-track playback state held by the engine. */
interface TrackState {
	/** Unique identifier of the track */
	trackId: string;
	/** String synthesizer for this track */
	synth: StringSynth;
	/** Volume node for this track */
	volume: Tone.Volume;
	/** Tone.Part scheduling this track's notes */
	part: Tone.Part<{ time: number; note: PlaybackNote }>;
	/** Last explicitly set volume (0–1) — used to restore after un-mute. */
	userVolume: number;
	/** Whether this track is currently muted */
	muted: boolean;
}

/**
 * Singleton audio engine responsible for scheduling and playing back tablature notes.
 *
 * This engine uses Tone.js for sample-accurate scheduling and manages per-track
 * synthesizers for independent pitch manipulation (bends, slides, etc.).
 *
 * @example
 * ```ts
 * const engine = AudioEngine.getInstance();
 * await engine.start();
 * engine.loadSong(tracks);
 * Tone.getTransport().start();
 * ```
 */
export class AudioEngine {
	private static instance: AudioEngine;
	private tracks = new Map<string, TrackState>();
	private onNoteListeners: ((event: AudioEngineEvent) => void)[] = [];
	private baseBpm: number = 120;

	private constructor() {}

	/**
	 * Gets the singleton AudioEngine instance.
	 * @returns The shared AudioEngine instance
	 */
	public static getInstance(): AudioEngine {
		if (!AudioEngine.instance) {
			AudioEngine.instance = new AudioEngine();
		}
		return AudioEngine.instance;
	}

	/**
	 * Starts the audio context if it's suspended.
	 * Must be called from a user gesture (e.g., click) to enable audio playback.
	 * @returns Promise that resolves when the context is running
	 */
	public async start(): Promise<void> {
		if (Tone.getContext().state !== "running") {
			await Tone.start();
		}
	}

	/**
	 * Loads all tracks from a song into the transport for playback.
	 * Replaces any previously loaded tracks.
	 *
	 * @param tracks - Array of Track objects to load
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
	 * Triggers a single note on the track it belongs to.
	 *
	 * @param note - The note to play
	 * @param time - Absolute time (seconds) for scheduling
	 */
	public triggerNote(note: PlaybackNote, time: number): void {
		const state = this.tracks.get(note.trackId);
		if (state) {
			this._triggerNoteInternal(note, time, state.synth);
		}
	}

	/**
	 * Gets the StringSynth instance for a specific track.
	 * Primarily used for testing purposes.
	 *
	 * @param trackId - The ID of the track
	 * @returns The StringSynth for the track, or undefined if not found
	 */
	public getStringSynth(trackId: string): StringSynth | undefined {
		return this.tracks.get(trackId)?.synth;
	}

	/**
	 * Sets the volume for a specific track.
	 *
	 * @param trackId - The track ID
	 * @param volume - Gain value from 0 (silent) to 1 (full volume)
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
	 * Mutes or unmutes a specific track.
	 * Un-muting preserves the last set volume for restoration when unmuted.
	 *
	 * @param trackId - The track ID
	 * @param muted - Whether the track should be muted
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
	 * Pass `null` to clear solo and restore all tracks to their previous volumes.
	 *
	 * @param trackId - The track to solo, or null to clear solo
	 */
	public setSolo(trackId: string | null): void {
		for (const [id, state] of this.tracks) {
			if (trackId === null) {
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

	/**
	 * Stops all currently playing notes and halts the transport.
	 */
	public stopAll(): void {
		for (const state of this.tracks.values()) {
			state.synth.releaseAll();
		}
		Tone.getTransport().stop();
	}

	/**
	 * Resets playback state for a new song.
	 * Stops all notes, resets transport position to 0, and restores speed to 1x.
	 */
	public reset(): void {
		this.stopAll();
		Tone.getTransport().seconds = 0;
		Tone.getTransport().bpm.value = this.baseBpm;
	}

	/**
	 * Sets playback speed as a tempo multiplier.
	 * This changes the Tone.Transport BPM to preserve pitch for synthesized notes.
	 *
	 * @param multiplier - Speed multiplier (e.g., 0.5 = half speed, 2 = double speed)
	 */
	public setSpeed(multiplier: number): void {
		const newBpm = this.baseBpm * multiplier;
		Tone.getTransport().bpm.value = newBpm;
	}

	/**
	 * Sets the base BPM used for speed calculations.
	 * The effective BPM during playback is baseBpm × speedMultiplier.
	 *
	 * @param bpm - Base tempo in beats per minute
	 */
	public setBaseBpm(bpm: number): void {
		this.baseBpm = bpm;
	}

	/**
	 * Subscribes a listener to note-on events for visual synchronization.
	 *
	 * @param listener - Callback invoked when a note starts playing
	 * @returns Unsubscribe function to remove the listener
	 */
	public addNoteListener(
		listener: (event: AudioEngineEvent) => void,
	): () => void {
		this.onNoteListeners.push(listener);
		return () => {
			this.onNoteListeners = this.onNoteListeners.filter((l) => l !== listener);
		};
	}

	/**
	 * Disposes of all resources held by the audio engine.
	 * Call this when unmounting or before creating a new engine instance.
	 */
	public dispose(): void {
		this._disposeTracks();
		this.onNoteListeners = [];
	}

	// --------------------------------------------------------------------------
	// Private helpers
	// --------------------------------------------------------------------------

	/**
	 * Internally triggers a note with all its playing techniques.
	 */
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

	/** Disposes of all track resources. */
	private _disposeTracks(): void {
		for (const state of this.tracks.values()) {
			state.part.dispose();
			state.synth.dispose();
			state.volume.dispose();
		}
		this.tracks.clear();
	}

	/** Broadcasts an event to all registered listeners. */
	private emit(event: AudioEngineEvent): void {
		for (const listener of this.onNoteListeners) {
			listener(event);
		}
	}
}
