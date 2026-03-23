# Audio Synthesis & Tab Parsing Strategy

This document outlines the specific implementation details for integrating `guitarpro-parser` and `Tone.js`. These are the core libraries powering the application and must be used exactly as described to ensure system stability.

---

## 1. Tab Parsing (`services/parser.ts`)

We use the [`guitarpro-parser`](https://github.com/imxeno/guitarpro-parser) library to read `.gp*` files.

### 1.1 Conversion to Absolute Time Pipeline
Guitar Pro models music hierarchically (Song -> Tracks -> Bars -> Beats -> Notes). To schedule audio and draw on a canvas easily, we must "flatten" this into absolute time in seconds.

**Process:**
1. Import the main parser:
   ```ts
   import { parseTabFile } from 'guitarpro-parser';
   ```
2. Parse the raw `Uint8Array` using `try/catch` to gracefully surface errors for corrupt or malformed files:
   ```ts
   let rawSong;
   try {
     rawSong = parseTabFile(fileData, fileName);
   } catch (error) {
     throw new Error(`Failed to parse Guitar Pro file: ${error.message}`);
   }
   ```
3. Flatten the structure:
   Initialize `currentTimeSeconds = 0.0`.
   Iterate sequentially through each `bar` and `beat`.
   Calculate the physical duration of the beat using its tempo and duration value.
   Apply `beat.duration` and increment `currentTimeSeconds`.
   
   *CRITICAL: Do not calculate complex music math manually!*
   ```ts
   import { beatDurationMs } from 'guitarpro-parser';
   
   // The library handles tuplets, dotted notes, and tempo automatically
   const durationSeconds = beatDurationMs(beat) / 1000.0;
   // Apply to notes, then increment currentTimeSeconds += durationSeconds
   ```
4. Map to Domain Types:
   Extract each `TabNote` and map it to a `PlaybackNote` containing:
   - `pitchMidi`: Raw MIDI number (calculated from the string's base tuning + fret + **`track.capoFret`**).
   - `startTime`: The absolute `currentTimeSeconds` when the beat starts.
   - `duration`: The calculated physical duration of the beat in seconds.
   - `string`: 0-based index of the string.
   - `fret`: Fret number.
   - `techniques`: Extracted bends, slides, etc.

---

## 2. Audio Engine (`services/audio.ts`)

We use `Tone.js` for audio scheduling and synthesis.

### 2.1 Initialization & State
Tone.js requires a user gesture to start the `AudioContext`.
```ts
import * as Tone from 'tone';

export async function initAudio() {
  await Tone.start(); // Must be called from a UI click handler (e.g., "Play" button)
}
```

### 2.2 Synthesizer Setup
Do **not** use a singular `Tone.PolySynth`. To properly emulate individual guitar strings pulling bends or slides without shifting the pitch of other ringing notes, instantiate an array of `Tone.Synth` mono-synths. The number of synths allocated equals `track.tuning.length` (one per string).
```ts
const stringSynths = track.tuning.map(() => 
  new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.5, sustain: 0.2, release: 1.2 }
  }).toDestination()
);
```

### 2.3 Scheduling Playback
Do not use `setTimeout` or raw JS timers for playback. Use `Tone.Transport` to guarantee sample-accurate scheduling.

After flattening the notes via the parser, schedule them using a `Tone.Part`:
```ts
const part = new Tone.Part((time, note) => {
  // `time` is the exact audio context time this note should fire.
  
  // Calculate frequency from MIDI note
  const freq = Tone.Frequency(note.pitchMidi, "midi").toNote();
  
  // Route to the specific string's synth to prevent voice stealing
  const stringSynth = stringSynths[note.string];
  stringSynth.triggerAttackRelease(freq, note.duration, time);
}, formattedPlaybackNotes).start(0);

// CRITICAL: When switching tracks or destroying the audio engine,
// you must run Tone.getTransport().cancel() and part.dispose() to prevent ghost notes.
```

### 2.4 Transport Controls
The UI `Controls.tsx` delegates to `audio.ts` which modifies the Transport directly.
- **Play:** `Tone.getTransport().start()`
- **Pause:** `Tone.getTransport().pause()`
- **Stop:** `Tone.getTransport().stop()`
- **Seek:** `Tone.getTransport().seconds = targetSeconds`
- **Speed:** `Tone.getTransport().bpm.value = originalBpm * speedMultiplier` (Note: adjust playback calculation if speed alters the transport schedule).

### 2.5 Technique Handling (Bends, Slides)
To implement dynamic pitch changes (bends, slides), you must manipulate the specific voice's `frequency` or `detune` signal over time using Tone's signal ramps (e.g., `synth.set({ detune: ... }, time)` or accessing the playing voices directly, though PolySynth abstraction makes this complex; alternative is mono synths per string). For MVP, focus on clean scheduling of standard notes, and use simple `rampTo` scheduled along the transport for slides.