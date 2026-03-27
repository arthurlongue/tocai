import { Synth, type Volume } from "tone";
import { DEFAULT_SYNTH_SETTINGS, STRING_COUNT } from "./constants";

export class StringSynth {
	private synths: Synth[];

	constructor() {
		this.synths = Array.from({ length: STRING_COUNT }, () => {
			return new Synth(DEFAULT_SYNTH_SETTINGS);
		});
	}

	/**
	 * Trigger a note on a specific string
	 * @param stringIndex - The 0-based index of the string
	 * @param freq - Frequency in Hz or Tone.Frequency format
	 * @param duration - Duration of the note
	 * @param time - Time to trigger the note
	 * @param velocity - Velocity (0-1)
	 */
	triggerAttackRelease(
		stringIndex: number,
		freq: string | number,
		duration: string | number,
		time: number,
		velocity?: number,
	) {
		if (stringIndex < 0 || stringIndex >= this.synths.length) {
			console.warn(`String index ${stringIndex} out of range`);
			return;
		}
		// Reset detune before triggering a new note
		this.synths[stringIndex].detune.setValueAtTime(0, time);
		this.synths[stringIndex].triggerAttackRelease(
			freq,
			duration,
			time,
			velocity,
		);
	}

	/**
	 * Ramp the frequency of a string (for slides)
	 */
	frequencyRamp(
		stringIndex: number,
		targetFreq: number,
		duration: number,
		time: number,
	) {
		if (stringIndex < 0 || stringIndex >= this.synths.length) return;
		this.synths[stringIndex].frequency.rampTo(targetFreq, duration, time);
	}

	/**
	 * Set the detune of a string (for bends)
	 * @param semitones - Relative pitch change in semitones (1.0 = 100 cents)
	 */
	setDetune(stringIndex: number, semitones: number, time: number) {
		if (stringIndex < 0 || stringIndex >= this.synths.length) return;
		this.synths[stringIndex].detune.setValueAtTime(semitones * 100, time);
	}

	/**
	 * Ramp the detune of a string (for smooth bends)
	 */
	detuneRamp(
		stringIndex: number,
		semitones: number,
		duration: number,
		time: number,
	) {
		if (stringIndex < 0 || stringIndex >= this.synths.length) return;
		this.synths[stringIndex].detune.rampTo(semitones * 100, duration, time);
	}

	/**
	 * Connect all synths to a Tone node (e.g. a Volume node for per-track routing).
	 */
	connect(node: Volume): this {
		for (const synth of this.synths) {
			synth.connect(node);
		}
		return this;
	}

	/**
	 * Connect all synths to the destination (master output).
	 * Kept for backwards compatibility.
	 */
	toDestination(): this {
		for (const synth of this.synths) {
			synth.toDestination();
		}
		return this;
	}

	/**
	 * Release all currently playing notes
	 * @param time - Optional time to release
	 */
	releaseAll(time?: number) {
		for (const synth of this.synths) {
			synth.triggerRelease(time);
		}
	}

	/**
	 * Clean up resources
	 */
	dispose() {
		for (const synth of this.synths) {
			synth.dispose();
		}
		this.synths = [];
	}
}
