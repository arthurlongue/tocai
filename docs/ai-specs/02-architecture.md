# Technical Architecture

## Principles
1. **Clean Architecture:** Pure domain logic has zero dependencies on React or Tone.js.
2. **Single Source of Truth:** `Tone.getTransport().seconds` is the absolute time reference for both audio playback and canvas positioning.
3. **No Hidden State:** Services (audio, parser, storage) expose explicit APIs rather than mutating shared global variables.
4. **Testing Strategy:** Uses Vitest + Testing Library. Tests must be colocated with source files as `*.test.ts` or `*.test.tsx` (e.g., `services/parser.test.ts`).
5. **Tooling:** Use pnpm for dependency management and BiomeJS for linting/formatting.

## Directory Structure
The application is organized by technical concern to maintain strict module boundaries.

```text
src/
├── main.tsx                         # Entry point
├── App.tsx                          # Root layout + route state
├── index.css                        # Global styles (Tailwind + theme)
│
├── domain/                          # PURE typescript logic, zero external deps
│   ├── types.ts                     # Core models (PlaybackNote, SongTrack, Metadata)
│   ├── pitch.ts                     # MIDI-to-frequency math, string normalization
│   ├── timing.ts                    # Tempo/beat-to-seconds conversions
│   └── techniques.ts                # Data structures for bends, slides, vibrato
│
├── services/                        # Integrations to the outside world
│   ├── parser.ts                    # Wrapper around `guitarpro-parser` -> domain types
│   ├── storage.ts                   # `localforage` wrapper for DB ops
│   └── audio.ts                     # `Tone.js` orchestrator (Transport, synths, fx)
│
├── engine/                          # Canvas rendering loop and math
│   ├── constants.ts                 # Visual constants (colors, lane heights, PPS)
│   ├── renderer.ts                  # Main `requestAnimationFrame` drawing loop
│   ├── primitives.ts                # Low-level canvas ops (ctx.save/restore wrapped)
│   ├── overview.ts                  # Minimap rendering logic
│   └── layout.ts                    # Coordinate math (string Y-pos, note X-pos)
│
├── components/                      # React UI
│   ├── Library.tsx                  # Sidebar list & file upload
│   ├── Player.tsx                   # Main layout container
│   ├── PlayerCanvas.tsx             # The actual `<canvas>` element
│   ├── Controls.tsx                 # Transport buttons (Play, Pause, Speed)
│   └── TrackMixer.tsx               # Mute/Solo switches per track
│
└── hooks/                           # React glue to services/engine
    ├── useEngine.ts                 # Binds canvas ref to engine/renderer.ts
    ├── usePlayback.ts               # Polls `audio.ts` for current play state
    └── useResize.ts                 # Handles `ResizeObserver` and HiDPI scaling
```

## State & Data Flow
0. **React State:** Keep it simple. Avoid Redux/Zustand for now. Lift the `currentSong` and `activeTrack` state to `App.tsx` or `Player.tsx` and pass them down as standard React props. Wrap the main application component inside a top-level `ErrorBoundary` to gracefully catch and display file parsing or UI crashes.
1. **Load:** User selects a `.gp` file.
2. **Parse:** `services/parser.ts` reads the file via `guitarpro-parser` and converts hierarchical bars/beats/notes into a flat array of `PlaybackNote` objects with absolute `startTime` (in seconds).
3. **Store:** The normalized data is persisted via `services/storage.ts`.
4. **Schedule:** `services/audio.ts` loads the track, loops through `PlaybackNotes`, and schedules them onto `Tone.Transport` using `Tone.Part` or explicit triggers.
5. **Render:** `engine/renderer.ts` runs a `requestAnimationFrame` loop. It asks `Tone.getTransport().seconds` for the current time, calculating note X-coordinates based on `(note.startTime - currentTime) * PIXELS_PER_SECOND`.