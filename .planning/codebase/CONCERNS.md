# Codebase Concerns

## Structural Concerns
- **Boilerplate State**: The project is currently in a boilerplate state (Vite + React template). Most functional directories like `src/domain` and `src/engine` are empty.
- **Missing Core Logic**: Despite having `guitarpro-parser` and `tone` as dependencies, no integration or core logic has been implemented yet.

## Technical Debt
- **Unused Boilerplate**: `App.tsx` and `App.css` still contain template code that needs to be replaced with the actual application UI.
- **Documentation Alignment**: The `docs/ai-specs/` are very detailed, but the current implementation (or lack thereof) does not reflect any of the architectural or functional requirements yet.

## Performance Risks
- **Audio Processing**: Real-time audio scheduling with Tone.js can be resource-intensive and requires careful management of the audio context.
- **Canvas Rendering**: High-performance music notation rendering on Canvas will require optimization to ensure smooth scrolling and playback updates.

## Testing Gaps
- **Zero Coverage**: There are currently no tests in the codebase, posing a risk as the core domain and engine logic are implemented.
