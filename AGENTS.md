# Tocaí (v2) Project Context

## Project Overview
Tocaí is a web-based Guitar Pro tablature player and visualizer. It runs entirely in the browser, parsing `.gp`, `.gp3`, `.gp5`, and `.gpx` files, rendering them on a scrolling canvas (similar to Rocksmith or Synthesia), and synthesizing audio playback.

## Core Technologies
- **Package Manager**: pnpm.
- **UI Framework**: React with TypeScript.
- **Styling**: Tailwind CSS (with Shadcn/UI components).
- **Tooling**: BiomeJS for linting and formatting.
- **Audio Engine**: [Tone.js](docs/tonejs/README.md).
- **Tab Parsing**: [`guitarpro-parser`](docs/guitarpro-parser/README.md).
- **Persistence**: IndexedDB (via `localforage`) for local song storage.
- **Rendering**: HTML5 Canvas (60fps scrolling timeline).
- **Testing**: Vitest + Testing Library.

## Technical Architecture
The project follows **Clean Architecture** principles to maintain strict module boundaries:

- `src/domain/`: Pure TypeScript logic (types, MIDI-to-frequency math, timing/tempo conversions). Zero external dependencies.
- `src/services/`: Integrations with external libraries.
    - `parser.ts`: Converts hierarchical GP data into a flat array of `PlaybackNote` objects.
    - `audio.ts`: Orchestrates Tone.js (Transport, synths, and scheduling).
    - `storage.ts`: Handles IndexedDB operations.
- `src/engine/`: Canvas rendering logic.
    - `renderer.ts`: Main `requestAnimationFrame` drawing loop.
    - `layout.ts`: Coordinate math for note positioning (X = time, Y = string).
- `src/components/`: React UI components.
- `src/hooks/`: React lifecycle glue (e.g., `useEngine`, `usePlayback`, `useResize`).

## Key Implementation Mandates

### 1. Timing & Synchronization
- **Single Source of Truth**: `Tone.getTransport().seconds` is the absolute time reference.
- **No React State for Animation**: The canvas render loop must poll `Tone.Transport` directly. Never store playback progress in React state to drive the canvas (to prevent stuttering).

### 2. Audio Synthesis
- **String Isolation**: Use an array of `Tone.Synth` (one per string) to allow independent pitch glides (bends/slides) without affecting other ringing notes.
- **Sample-Accurate Scheduling**: Use `Tone.Part` for all playback. Do not use standard JS timers.
- **User Gesture**: Audio must be started via `Tone.start()` in response to a user click.

### 3. Visual Rendering
- **HiDPI Scaling**: Scale the canvas by `window.devicePixelRatio` to prevent blurriness.
- **Canvas Best Practices**: Use `ctx.save()` and `ctx.restore()` to encapsulate draw styles. Cull notes that are outside the viewport bounds.

## Directory Overview
- `docs/ai-specs/`: Comprehensive design documents (Requirements, Architecture, Audio/Parsing, UI/Canvas).
- `docs/guitarpro-parser/`: API reference for the parsing library.
- `docs/tonejs/`: Documentation and examples for the audio framework.

## CONTINUITY.md (REQUIRED)

Maintain a single continuity file for the current workspace: `.agents/CONTINUITY.md`.

- `.agents/CONTINUITY.md` is a living document and canonical briefing designed to survive compaction; do not rely on earlier chat/tool output unless it's reflected there.

- At the start of each assistant turn: read `.agents/CONTINUITY.md` before acting.

### File Format

Update `.agents/CONTINUITY.md` only when there is a meaningful delta in:

  - `[PLANS]`: "Plans Log" is a guide for the next contributor as much as checklists for you.
  - `[DECISIONS]`: "Decisions Log" is used to record all decisions made.
  - `[PROGRESS]`: "Progress Log" is used to record course changes mid-implementation, documenting why and reflecting upon the implications.
  - `[DISCOVERIES]`: "Discoveries Log" is for when when you discover optimizer behavior, performance tradeoffs, unexpected bugs, or inverse/unapply semantics that shaped your approach, capture those observations with short evidence snippets (test output is ideal.
  - `[OUTCOMES]`: "Outcomes Log" is used at completion of a major task or the full plan, summarizing what was achieved, what remains, and lessons learned.

### Anti-drift / anti-bloat rules

- Facts only, no transcripts, no raw logs.
- Every entry must include:
  - a date in ISO timestamp (e.g., `2026-01-13T09:42Z`)
  - a provenance tag: `[USER]`, `[CODE]`, `[TOOL]`, `[ASSUMPTION]`
  - If unknown, write `UNCONFIRMED` (never guess). If something changes, supersede it explicitly (don't silently rewrite history).
- Keep the file bounded, short and high-signal (anti-bloat). 
- If sections begin to become bloated, compress older items into milestone (`[MILESTONE]`) bullets.
