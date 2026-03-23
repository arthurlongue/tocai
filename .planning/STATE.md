# Project State: Tocaí

## Current Milestone
**Milestone 1**: Core MVP

## Active Phase
**Phase 4**: Integration & Polish

## Progress Tracking
- [ ] Milestone 1: Core MVP (75%)
  - [x] Phase 1: Domain & Parsing Foundation (100%)
  - [x] Phase 2: Basic Audio Engine (100%)
  - [x] Phase 3: Core Visualizer (Canvas) (100%)
  - [ ] Phase 4: Integration & Polish (0%)

## Key Decisions
- **Architecture**: Separated into `domain/` (data logic), `engine/` (audio/visual logic), and `components/` (UI logic).
- **Tech Stack**: React 19 + Tone.js + `guitarpro-parser` + Canvas.
- **Audio Strategy**: "One Synth per String" (6 instances) for string-independent guitar techniques.
- **Visual Strategy**: High-performance Canvas renderer using `requestAnimationFrame` polling `Tone.Transport.seconds`.
- **HiDPI**: Mandatory canvas scaling based on `devicePixelRatio` for sharpness.
- **Color Standards**: Adoption of Rocksmith string colors for note visualization.

## Next Steps
- Implement Minimap/Overview for navigation.
- Add playback speed controls (0.25x - 2.0x).
- Refine UI aesthetics and responsiveness.
- Final E2E testing of the Core MVP.
