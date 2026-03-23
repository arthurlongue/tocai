# Milestone 1: Core MVP Requirements

## Overview
The goal of this milestone is to establish the end-to-end pipeline: file parsing -> domain model -> audio synthesis -> synchronized canvas rendering for a single track.

## Functional Requirements
- **File Upload**: A basic upload interface to accept `.gp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx` files.
- **Tab Parsing**: Utilize `guitarpro-parser` to convert the uploaded file into a domain-specific song model.
- **Basic Audio Engine**:
  - Initialize `Tone.js` PolySynth.
  - Implement basic transport controls (Play, Pause, Stop).
  - Synchronize audio playback with the current time (transport).
- **Core Visualizer**:
  - Horizontal scrolling canvas (right-to-left).
  - Dynamic lane rendering based on the track's tuning.
  - Note visualization as fret numbers on the corresponding string lane.
  - Fixed "hit-line" representing the current playback position.
- **Sync Logic**: Ensure the visualizer stays perfectly in sync with the `Tone.Transport` time.

## Non-Functional Requirements
- **Clean Architecture**: Strictly separate `engine/` (Tone.js), `domain/` (pure logic), and `components/` (React UI).
- **Performance**: Maintain 60fps on the canvas.
- **Responsiveness**: The canvas should resize dynamically with the window.

## Success Criteria
- [ ] User can upload a `.gp5` file.
- [ ] Clicking "Play" starts audio and visual scrolling.
- [ ] Notes move across the hit-line in sync with the sound.
- [ ] Basic "Stop" and "Pause" functionality works correctly.
