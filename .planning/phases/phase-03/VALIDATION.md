# Phase 03 Validation: Core Visualizer (Canvas)

## Goal
The goal of this phase is to establish the high-performance visual layer that scrolls guitar notes in synchronization with the audio engine.

## Key Observable Truths
- [ ] User can see horizontal lines representing guitar strings.
- [ ] A vertical playhead (Hit-Line) indicates the current playback point.
- [ ] Notes (circles with fret numbers) scroll from right to left.
- [ ] Notes cross the Hit-Line in sync with the corresponding sound (audio sync).
- [ ] The visualizer is sharp on high-resolution (HiDPI/Retina) screens.
- [ ] The visualizer resizes correctly when the browser window is adjusted.

## Automated Verification
| Component | Command | Purpose |
|-----------|---------|---------|
| Layout | `npm test src/engine/layout.test.ts` | Verify coordinate and culling math |
| Renderer | `npm test src/engine/Renderer.test.ts` | Verify basic loop lifecycle and state |

## Critical Path (UAT)
- **UAT-3.1: Visual Sync**
  - GIVEN: A song is loaded and `Visualizer` is visible.
  - WHEN: Clicking "Play".
  - THEN: Notes should move across the screen and hit the playhead at the exact moment their audio triggers.
  - THEN: Animation should be smooth (60fps).

- **UAT-3.2: Responsive Design**
  - GIVEN: `Visualizer` is rendering.
  - WHEN: Resizing the browser window.
  - THEN: The canvas should expand or shrink to fill the allocated space without distorting the layout.
  - THEN: HiDPI sharpness should be maintained.

- **UAT-3.3: Data Binding**
  - GIVEN: The user uploads a new song.
  - WHEN: The song is parsed and loaded.
  - THEN: The `Visualizer` should immediately update its state to render the notes and lanes for the first track of the new song.

## Status Tracking
- Plan 03-01: [ ]
- Plan 03-02: [ ]
- Final Validation: [ ]
