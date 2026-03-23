# Milestone 1: Core MVP Requirements

## Overview
The goal of this milestone is to establish the end-to-end pipeline: file parsing -> domain model -> audio synthesis -> synchronized canvas rendering for a single track.

## Functional Requirements

### Tab Parsing (PARSER)
- **PARSER-01**: File Upload - A basic upload interface to accept `.gp`, `.gp3`, `.gp4`, `.gp5`, and `.gpx` files.
- **PARSER-02**: Tab Parsing - Utilize `guitarpro-parser` to convert the uploaded file into a domain-specific song model.

### Basic Audio Engine (AUDIO)
- **AUDIO-01**: **Context Initialization** - Initialize `Tone.js` context only after a user gesture (awaited `Tone.start()`).
- **AUDIO-02**: **String-Specific Synthesis** - Implement a "One Synth per String" architecture for 6-string guitar simulation.
- **AUDIO-03**: **Note Scheduling** - Efficiently schedule a sequence of notes using `Tone.Part` based on the domain model.
- **AUDIO-04**: **Transport Controls** - Implement basic Play, Pause, Stop, and Seek functionality.
- **AUDIO-05**: **UI Synchronization** - Synchronize UI events and visualizer updates using `Tone.Draw` for sample-accurate visual feedback.

### Core Visualizer (VISUAL)
- **VISUAL-01**: Horizontal scrolling canvas (right-to-left).
- **VISUAL-02**: Dynamic lane rendering based on the track's tuning.
- **VISUAL-03**: Note visualization as fret numbers on the corresponding string lane.
- **VISUAL-04**: Fixed "hit-line" representing the current playback position.
- **VISUAL-05**: **Sync Logic** - Ensure the visualizer stays perfectly in sync with the `Tone.Transport` time.

## Non-Functional Requirements
- **Clean Architecture**: Strictly separate `engine/` (Tone.js), `domain/` (pure logic), and `components/` (React UI).
- **Performance**: Maintain 60fps on the canvas.
- **Responsiveness**: The canvas should resize dynamically with the window.

## Success Criteria
- [ ] User can upload a `.gp5` file.
- [ ] Clicking "Play" starts audio and visual scrolling.
- [ ] Notes move across the hit-line in sync with the sound.
- [ ] Basic "Stop" and "Pause" functionality works correctly.
