# Project State: Tocaí

## Current Milestone
**Milestone 1**: Core MVP

## Active Phase
**Phase 3**: Core Visualizer (Canvas)

## Progress Tracking
- [ ] Milestone 1: Core MVP (50%)
  - [x] Phase 1: Domain & Parsing Foundation (100%)
  - [x] Phase 2: Basic Audio Engine (100%)
  - [ ] Phase 3: Core Visualizer (Canvas) (0%)
  - [ ] Phase 4: Integration & Polish (0%)

## Key Decisions
- **Architecture**: Separated into `domain/` (data logic), `engine/` (audio logic), and `components/` (UI logic).
- **Tech Stack**: React 19 + Tone.js + `guitarpro-parser` + Canvas.
- **Audio Strategy**: "One Synth per String" (6 instances) for string-independent guitar techniques.
- **Scheduling**: Used `Tone.Part` for note scheduling and `Tone.Draw` for visual sync.
- **UI Sync**: Audio engine emits `note-on` events via `Tone.Draw` to ensure visual alignment with audio.
- **Rendering**: Dedicated `Renderer` class using `requestAnimationFrame` polling `Tone.Transport.seconds`.

## Next Steps
- Implement high-performance Canvas renderer (`03-01-PLAN.md`).
- Synchronize horizontal scrolling with `Tone.Transport` (`03-02-PLAN.md`).
