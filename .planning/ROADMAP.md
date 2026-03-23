# Project Roadmap: Tocaí

## Milestone 1: Core MVP (Current Focus)
**Goal**: Build a single-track player with synchronized audio and canvas.

- **Phase 1: Domain & Parsing Foundation**
  - Implement the internal song/track/measure/note data structures.
  - Integrate `guitarpro-parser` to load `.gp` files into the domain model.
  - Implement a basic file upload component and verify parsing success.
  - Implement persistent storage for uploaded files using `localforage`.

  **Plans:** 4 plans
  - [x] 01-01-PLAN.md — Domain & Flattening (TDD, Repeats)
  - [x] 01-02-PLAN.md — Worker Parsing & Transferables
  - [x] 01-03-PLAN.md — UI Upload Component
  - [x] 01-04-PLAN.md — IndexedDB Storage (localforage)

- **Phase 2: Basic Audio Engine**
  - Initialize the `Tone.js` audio context after user interaction.
  - Create a 6-string synthesizer (One Synth per String) for track playback.
  - Connect Play/Pause/Stop/Seek transport controls to the synthesis engine.
  - **Requirements**: [AUDIO-01, AUDIO-02, AUDIO-03, AUDIO-04, AUDIO-05]

  **Plans:** 2 plans
  - [x] 02-01-PLAN.md — Core Synthesis (6 strings)
  - [x] 02-02-PLAN.md — Scheduling & Transport Hooks

- **Phase 3: Core Visualizer (Canvas)**
  - Implement a 60fps canvas renderer with a horizontal scrolling timeline.
  - Synchronize rendering with `Tone.Transport.seconds`.
  - Implement dynamic lane rendering and note circles (fret numbers).
  - **Requirements**: [VISUAL-01, VISUAL-02, VISUAL-03, VISUAL-04, VISUAL-05]

  **Plans:** 2 plans
  - [ ] 03-01-PLAN.md — Rendering Logic & Core Engine
  - [ ] 03-02-PLAN.md — Visualizer Component & Integration

- **Phase 4: Integration & Polish**
  - Connect the parsing, audio, and visualizer modules into a unified flow.
  - Refine the aesthetic (minimalist dark theme with vibrant canvas colors).
  - Verify performance and responsiveness.
  - **Requirements**: [INTEGRATION-01, INTEGRATION-02, INTEGRATION-03, INTEGRATION-04, PERF-01, PERF-02]

  **Plans:** 3 plans
  - [ ] 04-01-PLAN.md — Transport Bar & Speed Control
  - [ ] 04-02-PLAN.md — Minimap & Visual Polish
  - [ ] 04-03-PLAN.md — E2E Testing & Integration

## Milestone 2: Enhanced Features & Library
- **Library Management**: Store and load songs using IndexedDB (`localforage`).
- **Multi-Track Support**: Add a mixer UI with track selection, mute, and solo.
- **Improved Visualization**: Add note tails for duration, technique indicators (bends, slides).
- **Audio Techniques**: Implement vibrato and pitch bends in the synthesis engine.

## Milestone 3: Advanced UX & Gamification
- **Speed Control**: Add time-stretching support (0.25x - 2x).
- **Minimap Navigation**: Implement a zoomable overview for rapid seeking.
- **Score/Accuracy Tracking**: Optional gamification layer (future consideration).
