# Product Requirements: Tocaí (v2)

## Overview
Tocaí is a web-based Guitar Pro tablature player and visualizer. It runs entirely in the browser, parsing `.gp`, `.gp3`, `.gp5`, and `.gpx` files, rendering them on a scrolling canvas (similar to Rocksmith or Synthesia), and synthesizing audio playback.

## Target Audience & Goal
Designed for guitarists and bassists who want a clean, responsive, and immediate tool to practice songs. The goal is to provide a zero-install, gamified tab-reading experience where visual notes flow across the screen in sync with synthetic audio.

## Core Features

### 1. File Parsing & Library
- **Format Support:** Autodetects and parses all standard Guitar Pro formats (`.gp`, `.gp3`, `.gp5`, and `.gpx`).
- **Local Storage:** Parsed songs are saved to IndexedDB (via `localforage`) for instant loading on return visits.
- **Library UI:** A sidebar to manage (upload, list, delete) the user's local song library.

### 2. Audio Synthesis
- **Sound Generation:** Synthesizes track playback using Tone.js (PolySynth).
- **Transport Controls:** Play, pause, stop, and seek.
- **Playback Speed:** Adjustable speed (0.25x to 2.0x) without altering pitch.
- **Mixer:** Per-track mute and solo toggles.
- **Techniques:** Renders essential guitar techniques (bends, slides, vibrato, palm mutes) as pitch glides and frequency oscillations.

### 3. Visual Rendering (Canvas)
- **Scrolling Timeline:** Notes move horizontally (right-to-left) toward a fixed vertical "hit-line" at the current time.
- **Dynamic Lanes:** Renders horizontal string lanes dynamically based on the track's tuning (e.g., 4 lanes for bass, 6 for standard guitar, 7+ for extended range).
- **Note Visualization:** Notes are drawn as colored circles (color-coded by string) containing the fret number, with semi-transparent "tails" indicating duration.
- **Technique Indicators:** Visual markers for bends, slides, hammer-ons, pull-offs, etc.
- **Minimap/Overview:** A zoomed-out view of the entire track showing the current viewport position and enabling click-to-seek navigation.
- **HiDPI Support:** Proper scaling for Retina/high-resolution displays using `devicePixelRatio`.

## Non-Functional Requirements
- **Performance:** Canvas rendering must run at 60fps even for complex, note-dense tracks.
- **Clean Architecture:** Strict separation between UI (React), Audio Engine (Tone.js), and pure domain logic (TypeScript).
- **Responsiveness:** UI adapts to window size, handling window resize events to keep the canvas centered and accurately scaled.