import * as Tone from "tone";
import { StringSynth } from "./StringSynth";
import type { PlaybackNote } from "../domain/types";

export type AudioEngineEvent = {
  type: "note-on";
  note: PlaybackNote;
};

export class AudioEngine {
  private static instance: AudioEngine;
  private stringSynth: StringSynth;
  private currentPart: Tone.Part<PlaybackNote> | null = null;
  private onNoteListeners: ((event: AudioEngineEvent) => void)[] = [];

  private constructor() {
    this.stringSynth = new StringSynth();
    this.stringSynth.toDestination();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Start the audio context if it's suspended
   */
  public async start(): Promise<void> {
    if (Tone.getContext().state !== "running") {
      await Tone.start();
    }
  }

  /**
   * Load a song's notes into the transport for playback
   * @param notes - Array of PlaybackNote objects
   */
  public loadSong(notes: PlaybackNote[]): void {
    // Dispose of existing part if any
    if (this.currentPart) {
      this.currentPart.dispose();
      this.currentPart = null;
    }

    // Create a new Tone.Part for the notes
    // We map startTime to time property for Tone.Part
    const partEvents = notes.map((note) => ({
      time: note.startTime,
      note,
    }));

    this.currentPart = new Tone.Part<{ time: number; note: PlaybackNote }>(
      (time, event) => {
        // 1. Trigger audio synthesis
        this.triggerNote(event.note, time);

        // 2. Schedule visual synchronization
        Tone.Draw.schedule(() => {
          this.emit({ type: "note-on", note: event.note });
        }, time);
      },
      partEvents
    );

    // Start the part at the beginning of the transport
    this.currentPart.start(0);
  }

  /**
   * Trigger a note based on a PlaybackNote object
   * @param note - The note to play
   * @param time - Relative or absolute time in seconds for scheduling
   */
  public triggerNote(note: PlaybackNote, time: number): void {
    const freq = Tone.Frequency(note.pitch, "midi").toFrequency();
    this.stringSynth.triggerAttackRelease(
      note.string,
      freq,
      note.duration,
      time
    );
  }

  /**
   * Release all currently playing notes
   */
  public stopAll(): void {
    this.stringSynth.releaseAll();
    Tone.getTransport().stop();
  }

  /**
   * Get the underlying StringSynth instance for more direct control
   */
  public getStringSynth(): StringSynth {
    return this.stringSynth;
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    if (this.currentPart) {
      this.currentPart.dispose();
    }
    this.stringSynth.dispose();
    this.onNoteListeners = [];
  }

  /**
   * Visual event subscription
   */
  public addNoteListener(
    listener: (event: AudioEngineEvent) => void
  ): () => void {
    this.onNoteListeners.push(listener);
    return () => {
      this.onNoteListeners = this.onNoteListeners.filter((l) => l !== listener);
    };
  }

  private emit(event: AudioEngineEvent): void {
    for (const listener of this.onNoteListeners) {
      listener(event);
    }
  }
}
