# Phase 04 Discussion: Integration & Polish

## Goal
Connect the parsing, audio, and visualizer modules into a unified flow. Refine the aesthetic (minimalist dark theme with vibrant canvas colors). Verify performance and responsiveness.

## Requirements (from ROADMAP)
- **INTEGRATION-01**: End-to-end flow from file upload → parsing → playback → visualization
- **INTEGRATION-02**: Play/Pause/Stop controls affect both audio and visualizer in sync
- **INTEGRATION-03**: Minimalist dark theme with vibrant contrast colors for canvas
- **INTEGRATION-04**: Responsive design across different screen sizes
- **PERF-01**: Maintain 60fps during playback
- **PERF-02**: Smooth seeking/scrubbing through the timeline

## Open Questions

### 1. Playback Controls UI
Where should the transport controls (Play/Pause/Stop/Seek) be positioned? What additional controls are needed for MVP?

### 2. Speed Control Scope
Should playback speed control (0.25x - 2.0x) be included in MVP or deferred to Milestone 3?

### 3. Minimap/Overview
Is the minimap for navigation part of Phase 04 or should it wait for Milestone 2?

### 4. E2E Testing Strategy
What constitutes "Final E2E testing"? Should we add automated E2E tests or is manual UAT sufficient for MVP?

## Suggested Plans
1. **04-01**: UI Integration — Connect all modules, transport controls, layout
2. **04-02**: Visual Polish — Dark theme, color contrast, responsive refinements
3. **04-03-GAP**: Performance & E2E — 60fps verification, UAT, bug fixes

---

**Next:** After discussion, run `/gsd:plan-phase 04` to create executable plans.
