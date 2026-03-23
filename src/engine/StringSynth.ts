import { Synth } from "tone";
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
    this.synths[stringIndex].triggerAttackRelease(freq, duration, time, velocity);
  }

  /**
   * Connect all synths to the destination (master output)
   */
  toDestination() {
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
