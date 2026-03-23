# Project State: Tocaí

## Current Milestone
**Milestone 1**: Core MVP

## Active Phase
**Phase 4**: Integration & Polish

## Progress Tracking
- [ ] Milestone 1: Core MVP (80%)
  - [x] Phase 1: Domain & Parsing Foundation (100%)
  - [x] Phase 2: Basic Audio Engine (100%)
  - [x] Phase 3: Core Visualizer (Canvas) (100%)
  - [ ] Phase 4: Integration & Polish (50%)
    - [x] Plan 01: Transport Bar (pending verification)
    - [x] Plan 02: Minimap & Visual Polish (100%)

## Key Decisions
- **Architecture**: Separated into `domain/` (data logic), `engine/` (audio/visual logic), and `components/` (UI logic).
- **Tech Stack**: React 19 + Tone.js + `guitarpro-parser` + Canvas.
- **Audio Strategy**: "One Synth per String" (6 instances) for string-independent guitar techniques.
- **Visual Strategy**: High-performance Canvas renderer using `requestAnimationFrame` polling `Tone.Transport.seconds`.
- **HiDPI**: Mandatory canvas scaling based on `devicePixelRatio` for sharpness.
- **Color Standards**: Adoption of Rocksmith string colors for note visualization.
- **Dark Theme**: Charcoal backgrounds (#1a1a1a, #252525) with near-black canvas (#0a0a0a) and Rocksmith accent colors.
- **Minimap**: 48px height canvas with click-to-seek interaction for timeline navigation.

## Next Steps
- Complete Plan 03: Responsive Design & E2E Testing
- Verify Plan 01: Transport Bar functionality
- Final E2E testing of the Core MVP

## Session Log
- **2026-03-23**: Completed Plan 04-02: Minimap & Visual Polish
  - Created MinimapRenderer class for compressed timeline rendering
  - Implemented Minimap component with click-to-seek
  - Added dark theme CSS custom properties
  - Integrated Minimap into App.tsx
  - All 12 tests passing
