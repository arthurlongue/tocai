# Tocaí

Tocaí is a browser-based Guitar Pro player and visualizer built with React, TypeScript, and Tone.js. It parses `.gp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx` files in the browser, stores uploaded files in IndexedDB, renders a scrolling canvas timeline, and synthesizes playback with per-string voices.

## Current Product State

The current app flow is:

1. Upload a Guitar Pro file.
2. Persist the raw file locally with `localforage`/IndexedDB.
3. Parse and flatten the score into playback notes with absolute timing.
4. Load the first track into the audio engine.
5. Play, pause, stop, seek, adjust speed, and navigate with the minimap.

Implemented today:

- File upload for `.gp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx`
- IndexedDB-backed local storage with a library UI to browse and reload stored songs
- Flattening from Guitar Pro bars/beats into `PlaybackNote[]` with technique extraction (hammer-ons, pull-offs, slides, bends, vibrato)
- Tone.js transport controls and per-string synth playback with technique scheduling (detune ramps for bends, frequency ramps for slides)
- Multi-track audio: simultaneous playback, track selection, solo/mute, and per-track volume via `TrackMixer`
- Scrolling canvas visualizer with technique indicator rendering (H/P labels, slide lines, bend arrows, vibrato waves)
- Click-to-seek minimap
- Shared playback timeline sync layer for speed-adjusted seeking
- Unit/component tests with Vitest and browser E2E tests with Playwright

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui components
- Tone.js for playback scheduling and synthesis
- `guitarpro-parser` for Guitar Pro parsing
- `localforage` for IndexedDB persistence
- Vitest + Testing Library
- Playwright
- Biome for linting and formatting

## Architecture

The repo is organized by technical concern:

```text
src/
├── components/   React UI: upload, minimap, transport, visualizer
├── domain/       Pure TypeScript models and flattening logic
├── engine/       Audio engine, canvas renderer, layout math
├── hooks/        React bindings for playback, speed, and transport status
├── services/     Parser and storage integrations
└── main.tsx      App entry point
```

Key runtime flow:

- `src/components/FileUpload.tsx` saves the raw upload and parses it into the app's `Song` model.
- `src/components/Library.tsx` browses and reloads stored songs from IndexedDB.
- `src/domain/flattening.ts` converts Guitar Pro bars and beats into absolute-time notes, including technique extraction and repeat/tie handling.
- `src/App.tsx` loads the selected song into the singleton `AudioEngine`.
- `src/engine/AudioEngine.ts` schedules playback with `Tone.Part`, including bend detune ramps and slide frequency ramps.
- `src/engine/StringSynth.ts` uses one `Tone.Synth` per string so notes can ring independently with per-string pitch modulation.
- `src/components/TrackMixer.tsx` provides per-track volume, solo, and mute controls.
- `src/components/Visualizer.tsx` and `src/engine/Renderer.ts` render scrolling note lanes with technique indicators on a HiDPI-aware canvas.
- `src/components/Minimap.tsx` and `src/engine/MinimapRenderer.ts` provide an overview timeline with click-to-seek behavior.
- `src/engine/playbackTimeline.ts` provides a shared speed-adjusted timeline for renderer and minimap sync.

## Getting Started

### Prerequisites

- Node.js installed locally
- `pnpm` installed globally

The repository does not currently pin a Node.js version with `.nvmrc` or `.node-version`.

### Install

```bash
pnpm install
```

### Run The App

```bash
pnpm dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm test
pnpm test:e2e
pnpm test:e2e:ui
pnpm lint
```

Notes:

- `pnpm lint` runs `biome check --write --unsafe .`, so it can modify files.

## Testing

- Unit and component tests live alongside source files as `*.test.ts` and `*.test.tsx`.
- E2E coverage lives in `tests/e2e/`.
- Fixtures, including a generated sample Guitar Pro file, live in `tests/fixtures/`.

Run the main automated suites with:

```bash
pnpm test
pnpm test:e2e
```

## Project Docs

Reference material lives in:

- `docs/ai-specs/` for product and architecture specs
- `docs/guitarpro-parser/README.md` for parser notes
- `docs/tonejs/README.md` for Tone.js notes

## Known Gaps

- Audio and canvas rendering are hard-coded to six strings via `STRING_COUNT`.
- Speed control is shared through a module-level hook pattern rather than a dedicated state container.
