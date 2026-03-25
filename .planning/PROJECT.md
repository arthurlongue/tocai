# Project: Tocaí

## Vision
Tocaí is a web-based Guitar Pro tablature player and visualizer. It provides a clean, responsive, and immediate tool for guitarists and bassists to practice songs by rendering notes on a scrolling canvas in sync with synthesized audio.

## Context
- **Product Requirements**: See `docs/ai-specs/01-product-requirements.md`
- **Architecture**: See `docs/ai-specs/02-architecture.md`
- **Tech Stack**: React 19, Vite, TypeScript, Tone.js, GuitarPro-Parser, Biome, Tailwind CSS.

## Configuration
- **Workflow Focus**: MVP Focus
- **Aesthetic**: Minimalist clean design with dark colors and vibrant contrast colors for the canvas.
- **Milestone 1 Goal**: Core MVP (Single track playback with basic visualization).

## Technical Decisions
- **Audio Strategy**: "One Synth per String" (6 instances) for string-independent guitar techniques.
- **Visual Strategy**: High-performance Canvas renderer using `requestAnimationFrame` polling `Tone.Transport.seconds`.
- **HiDPI**: Mandatory canvas scaling based on `devicePixelRatio` for sharpness.
- **Color Standards**: Adoption of Rocksmith string colors for note visualization.
- **Dark Theme**: Charcoal backgrounds (#1a1a1a, #252525) with near-black canvas (#0a0a0a) and Rocksmith accent colors.
- **Minimap**: 48px height canvas with click-to-seek interaction for timeline navigation.
- **Speed Control**: Use `Tone.Transport.bpm` for tempo changes (preserves pitch for synthesized notes).
- **Transport Bar**: Full-featured controls below visualizer (PLAY/PAUSE/STOP, seek, speed 0.25x-2.0x, volume).

## Core Success Criteria
- [ ] Successfully parse and load a Guitar Pro file.
- [ ] Synthesize audio playback using Tone.js.
- [ ] Render a scrolling canvas synchronized with the audio.
- [ ] Maintain 60fps performance during playback.
