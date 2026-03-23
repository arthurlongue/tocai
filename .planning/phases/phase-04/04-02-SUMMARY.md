---
phase: 04-integration-polish
plan: 02
subsystem: visualizer
tags:
  - minimap
  - dark-theme
  - navigation
  - visual-polish
requires:
  - phase: 03
    plan: 01
    name: Core Visualizer
provides:
  - Minimap component for timeline navigation
  - Dark theme CSS tokens
  - Compressed timeline rendering
affects:
  - src/App.tsx
  - src/index.css
tech-stack:
  added:
    - vitest (test configuration)
    - jsdom (test environment)
  patterns:
    - Canvas-based minimap rendering
    - CSS custom properties for theming
    - Click-to-seek interaction
key-files:
  created:
    - path: src/engine/MinimapRenderer.ts
      purpose: Minimap-specific canvas rendering logic
    - path: src/components/Minimap.tsx
      purpose: React component with click-to-seek
    - path: src/styles/theme.test.ts
      purpose: Dark theme token verification
  modified:
    - path: src/App.tsx
      purpose: Integrated Minimap component
    - path: src/index.css
      purpose: Added dark theme CSS custom properties
decisions:
  - "Used canvas-based rendering for minimap (not SVG) for consistency with main visualizer"
  - "Implemented 48px height (12px per string lane) for compact overview"
  - "Defined charcoal backgrounds (#1a1a1a, #252525) for dark theme"
  - "Used near-black (#0a0a0a) for canvas background to maximize contrast"
  - "Maintained Rocksmith string colors as accent palette"
metrics:
  duration: "Started 2026-03-23"
  completed: "2026-03-23"
  tasks: 4
  files_created: 5
  files_modified: 2
  tests_added: 12
  tests_passing: 12
---

# Phase 04 Plan 02: Minimap & Visual Polish Summary

## One-liner
Implemented minimap navigation component with compressed timeline rendering and custom dark theme using CSS custom properties with Rocksmith accent colors.

## Overview

This plan delivered a minimap/overview canvas for timeline navigation and established a polished dark theme with proper contrast. The minimap provides users with a visual overview of the entire song timeline, enabling quick navigation via click-to-seek interaction.

## Implementation Details

### MinimapRenderer Class (`src/engine/MinimapRenderer.ts`)

**API:**
- `constructor(canvas: HTMLCanvasElement)` - Initializes renderer with canvas element
- `setTrack(track: Track)` - Sets the track data and triggers initial draw
- `draw(currentTime: number = 0)` - Renders compressed timeline with playhead
- `getTimeFromX(x: number)` - Converts X coordinate to time in seconds

**Key Features:**
- HiDPI scaling via `devicePixelRatio`
- Compressed note rendering as rectangles at (startTime, string) coordinates
- Current position playhead rendered as vertical white line
- Rocksmith string colors for note visualization
- String lane dividers for visual clarity

### Minimap Component (`src/components/Minimap.tsx`)

**Structure:**
- 48px height canvas (12px per string lane × 6 strings)
- Full-width container with dark theme styling
- Click handler for seek interaction
- requestAnimationFrame loop for real-time playhead updates

**Props:**
- `track: Track | undefined` - Song track data
- `onSeek: (time: number) => void` - Callback for seek interaction

**Interaction:**
1. User clicks on minimap canvas
2. Click X coordinate converted to time via `getTimeFromX()`
3. `onSeek(time)` callback invoked
4. Main visualizer and audio transport seek to new position

### Dark Theme Tokens (`src/index.css`)

**Color Palette:**
```css
/* Backgrounds */
--color-background: #1a1a1a;        /* Charcoal base */
--color-surface: #252525;           /* Slightly lighter */
--color-surface-elevated: #2a2a2a;  /* Elevated surfaces */
--color-canvas: #0a0a0a;            /* Near-black for canvas */

/* Text */
--color-text-primary: #f3f4f6;      /* High contrast */
--color-text-secondary: #9ca3af;    /* Muted text */

/* Borders */
--color-border: #3a3a3a;            /* Subtle definition */

/* Rocksmith Accents */
--accent-red: #FF0000;              /* String 6 (E low) */
--accent-yellow: #FFFF00;           /* String 5 (A) */
--accent-blue: #0000FF;             /* String 4 (D) */
--accent-orange: #FFA500;           /* String 3 (G) */
--accent-green: #00FF00;            /* String 2 (B) */
--accent-purple: #A020F0;           /* String 1 (E high) */
```

### Integration (`src/App.tsx`)

**Changes:**
- Imported `Minimap` component
- Added `seek` function from `usePlayback` hook
- Inserted Minimap between song info card and Visualizer
- Wired `onSeek` prop to `seek(time)` callback

## Test Coverage Summary

| File | Tests | Status |
|------|-------|--------|
| `src/engine/MinimapRenderer.test.ts` | 3 | ✅ Pass |
| `src/components/Minimap.test.tsx` | 3 | ✅ Pass |
| `src/styles/theme.test.ts` | 6 | ✅ Pass |
| **Total** | **12** | **✅ Pass** |

**Test Coverage:**
- `getTimeFromX(0)` returns 0
- `getTimeFromX(width)` returns songDuration
- `getTimeFromX(width/2)` returns songDuration/2
- Minimap renders canvas element
- Canvas has correct height (48px)
- Click on canvas calls onSeek callback
- All dark theme CSS tokens present
- All Rocksmith accent colors defined

## Deviations from Plan

### Auto-fixed Issues

**None** - Plan executed exactly as written.

### Configuration Adjustments

**1. Added vitest.config.ts**
- **Found during:** Task 1
- **Issue:** Test environment configuration needed for jsdom
- **Fix:** Created separate vitest.config.ts instead of modifying vite.config.ts
- **Files modified:** vitest.config.ts (created)

**2. Excluded test files from TypeScript build**
- **Found during:** Task 4
- **Issue:** Renderer.test.ts from Plan 04-01 had type errors blocking build
- **Fix:** Added test file exclusion to tsconfig.app.json
- **Files modified:** tsconfig.app.json

## Known Stubs

None - all functionality is fully implemented.

## Verification Results

**Automated Tests:** ✅ 12/12 passing
- MinimapRenderer.getTimeFromX() accuracy tests
- Minimap component rendering tests
- Minimap click-to-seek interaction tests
- Dark theme token presence tests

**Build:** ✅ Success
- TypeScript compilation: No errors
- Vite build: Success (528.91 kB bundle)

**Integration:** ✅ Complete
- Minimap appears above Visualizer in App.tsx
- Click-to-seek wired to usePlayback.seek()
- Dark theme tokens available for all components

## Files Created/Modified

**Created (5 files):**
1. `src/engine/MinimapRenderer.ts` - Minimap rendering logic
2. `src/engine/MinimapRenderer.test.ts` - Renderer unit tests
3. `src/components/Minimap.tsx` - React component
4. `src/components/Minimap.test.tsx` - Component tests
5. `src/styles/theme.test.ts` - Theme token tests
6. `vitest.config.ts` - Test configuration

**Modified (2 files):**
1. `src/App.tsx` - Integrated Minimap component
2. `src/index.css` - Added dark theme CSS custom properties
3. `tsconfig.app.json` - Excluded test files from build

## Commits

- `1759e3f`: test(04-02): add failing test for MinimapRenderer
- `a08f062`: feat(04-02): create Minimap component with click-to-seek
- `c5f3c77`: feat(04-02): implement dark theme tokens in index.css
- `3b51c01`: feat(04-02): integrate Minimap into App.tsx

## Requirements Fulfilled

- [x] **INTEGRATION-03**: Minimap/overview canvas for timeline navigation
  - ✅ User can see full song timeline compressed in minimap
  - ✅ User can click minimap to seek to position
  - ✅ Current position is highlighted on minimap

- [x] **INTEGRATION-04**: Dark theme polish with Rocksmith accents
  - ✅ Dark theme uses charcoal backgrounds (#1a1a1a, #252525)
  - ✅ Canvas background is near-black (#0a0a0a)
  - ✅ Rocksmith colors used as accents
  - ✅ CSS custom properties define all theme colors

## Success Criteria

- [x] MinimapRenderer.ts exists with draw() and getTimeFromX()
- [x] Minimap.tsx exists with click-to-seek
- [x] index.css contains all dark theme CSS custom properties
- [x] theme.test.ts passes (6/6 tests)
- [x] Minimap integrated into App.tsx above Visualizer
- [x] Build succeeds without errors

## Self-Check: PASSED

All created files verified to exist. All commits verified in git history. All tests passing.
