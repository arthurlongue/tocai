# Phase 04: Integration & Polish - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Source:** Discuss-phase workflow

---

<domain>
## Phase Boundary

**Goal:** Connect the parsing, audio, and visualizer modules into a unified, polished MVP experience.

**Delivers:**
- Dedicated transport bar with full-featured controls (PLAY/PAUSE/STOP, time display, seek bar, speed control, track selector, volume)
- Speed control (0.25x - 2.0x) for playback
- Minimap/overview canvas for timeline navigation
- Custom dark theme with Rocksmith vibrant accents
- Responsive design across all breakpoints (mobile, tablet, desktop)
- Hybrid E2E testing (manual UAT + automated smoke tests)

**Does NOT deliver:**
- Multi-track mixing UI (Milestone 2)
- Advanced technique indicators like bends/slides (Milestone 2)
- Score/accuracy tracking gamification (Milestone 3)

</domain>

<decisions>
## Implementation Decisions

### Transport Bar UI
- **Position:** Fixed bar below the visualizer (not sticky header/footer)
- **Layout:** Dedicated transport bar separate from song info card
- **Elements:** Full-featured including:
  - PLAY/PAUSE/STOP controls
  - Current time / duration display
  - Seek bar/scrubber for timeline navigation
  - Speed control toggle/slider (0.25x - 2.0x)
  - Track selector dropdown
  - Volume slider

### Speed Control
- **Scope:** Include in Phase 04 MVP
- **Range:** 0.25x to 2.0x playback speed
- **Implementation:** Time-stretching without pitch shift (Tone.js capability)
- **UI:** Slider or toggle in transport bar

### Minimap/Navigation
- **Scope:** Include in Phase 04 MVP
- **Type:** Overview canvas showing full song timeline
- **Interaction:** Click/drag to seek, highlight current position
- **Position:** Above or integrated with main visualizer

### Visual Polish & Theme
- **Theme:** Custom dark theme (not default Shadcn)
- **Color approach:** Dark grays (charcoal/slate) for backgrounds
- **Accent colors:** Rocksmith string colors (Purple, Green, Orange, Blue, Yellow, Red) as vibrant contrasts
- **Priority:** Canvas contrast is the focus, UI stays minimal

### Responsive Design
- **Strategy:** Balanced approach across all breakpoints
- **Breakpoints:** Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Layout:** Transport bar and visualizer adapt to screen width
- **Touch targets:** Accessible sizing on mobile

### E2E Testing
- **Strategy:** Hybrid approach
- **Manual:** UAT checklist for critical user flows
- **Automated:** Basic smoke tests for core functionality
- **Tool:** Playwright or similar for automated tests
- **Coverage:** Upload → Parse → Play → Visualize flow

### Architecture Decisions (Carried Forward)
- **Clean Architecture:** Maintain `domain/`, `engine/`, `components/` separation
- **Audio:** One Synth per String (6 instances)
- **Visual:** requestAnimationFrame polling Tone.Transport.seconds
- **HiDPI:** Mandatory canvas scaling by devicePixelRatio

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Foundation
- `.planning/PROJECT.md` — Vision, tech stack, core success criteria
- `.planning/REQUIREMENTS.md` — Milestone 1 functional requirements
- `.planning/STATE.md` — Current progress, key decisions log
- `.planning/ROADMAP.md` — Phase 04 scope and milestone structure

### Architecture & Patterns
- `docs/ai-specs/01-product-requirements.md` — Product requirements
- `docs/ai-specs/02-architecture.md` — System architecture
- `src/engine/AudioEngine.ts` — Audio engine singleton pattern
- `src/engine/Renderer.ts` — Canvas renderer implementation
- `src/components/Visualizer.tsx` — React canvas wrapper

### Domain Types
- `src/domain/types.ts` — PlaybackNote, Track, Song type definitions
- `src/engine/constants.ts` — Visual constants (PIXELS_PER_SECOND, HIT_LINE_X, STRING_COLORS)
- `src/engine/layout.ts` — Coordinate math utilities

### UI Components
- `src/App.tsx` — Current app layout and transport controls
- `src/components/FileUpload.tsx` — File upload component
- `src/components/ui/` — Shadcn/UI component library

</canonical_refs>

<specifics>
## Specific Ideas

### Transport Bar Layout
```
┌─────────────────────────────────────────────────────┐
│  [◄◄] [▶/❚❚] [■] ───●─── 2:34 / 4:12  [1.0x▼] [Gtr▼] [🔊──]  │
└─────────────────────────────────────────────────────┘
```
- Seek bar in the center with draggable handle
- Speed dropdown showing current multiplier
- Track selector showing current track name
- Volume slider on the right

### Minimap Integration
- Thin overview canvas above main visualizer (~40-60px height)
- Shows entire song timeline compressed
- Current position highlighted with vertical bar
- Click to seek, drag to scrub

### Dark Theme Tokens
- Background: `#1a1a1a` or `#1e1e1e` (charcoal)
- Surface: `#2a2a2a` or `#252525` (slightly lighter)
- Border: `#3a3a3a` (subtle definition)
- Canvas background: `#0a0a0a` (near-black for contrast)
- String colors: Rocksmith palette (unchanged from Phase 03)

### Responsive Behavior
- Desktop (1024px+): Full layout with all controls visible
- Tablet (768px-1023px): Compact transport, simplified minimap
- Mobile (320px-767px): Stacked layout, essential controls only, touch-optimized

</specifics>

<deferred>
## Deferred Ideas

**From original discussion (not selected for Phase 04):**
- None — all discussed features are included in MVP

**Roadmap items for future milestones:**
- Multi-track mixing UI with mute/solo (Milestone 2)
- Note tails for duration visualization (Milestone 2)
- Technique indicators (bends, slides, hammer-ons) (Milestone 2)
- Advanced audio effects (vibrato, pitch bends) (Milestone 2)
- Score/accuracy tracking gamification (Milestone 3)

**Todo items reviewed (not folded into this phase):**
- None identified during discussion

</deferred>

---

*Phase: 04-integration-polish*
*Context gathered: 2026-03-23 via discuss-phase workflow*
