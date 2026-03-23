# Phase 03: Core Visualizer (Canvas) - Research

**Researched:** 2025-05-22
**Domain:** HTML5 Canvas Rendering & Audio Synchronization
**Confidence:** HIGH

## Summary
The Core Visualizer for Tocaí requires a high-performance, synchronized rendering engine that maps the temporal data of a guitar track to a spatial horizontal timeline. By leveraging a vanilla `requestAnimationFrame` loop and polling the `Tone.Transport` state, we can achieve 60fps smoothness without React's reconciliation overhead.

**Primary recommendation:** Use a dedicated "Renderer" class that operates independently of React's render cycle, using a ref-captured canvas and polling `Tone.Transport.seconds` for absolute temporal positioning.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| HTML5 Canvas | Native | 2D Rendering | Highest performance for frequent updates. |
| Tone.js | 15.1.22 | Transport & Timing | Industry standard for web audio; provides sample-accurate timing. |
| React | 19.2.4 | Lifecycle management | Used only to mount/unmount and resize the canvas. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── engine/
│   ├── renderer.ts     # Main Render Loop
│   ├── layout.ts       # Coordinate math & culling logic
│   ├── constants.ts    # Colors, dimensions, PPS
│   └── primitives.ts   # Reusable drawing functions (notes, lanes)
```

### Pattern 1: The "Hit-Line" Polling Loop
Instead of pushing updates from the audio engine to the UI, the visualizer pulls the current time from the transport.
```typescript
const PIXELS_PER_SECOND = 200;
const HIT_LINE_X = 100;

function render() {
  const currentTime = Tone.getTransport().seconds;
  ctx.clearRect(0, 0, width, height);
  
  // Calculate x for each note
  // x = HIT_LINE_X + (note.startTime - currentTime) * PIXELS_PER_SECOND
  
  requestAnimationFrame(render);
}
```

### Pattern 2: HiDPI/Retina Support
To prevent blurriness on modern displays, the canvas backing store must be scaled.
```typescript
function resizeCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UI Timing | `setInterval` | `Tone.Transport` | Drifts significantly; not sample-accurate. |
| Syncing | React State | `requestAnimationFrame` | React's diffing is too slow for 60fps animation. |

## Common Pitfalls

### Pitfall 1: Sub-pixel Rendering
**What goes wrong:** Lines and notes look blurry or "shimmer" as they move.
**How to avoid:** Use `Math.floor()` or `| 0` on coordinates to align with the pixel grid, especially for thin lines like strings.

### Pitfall 2: Memory Leaks
**What goes wrong:** Adding new `requestAnimationFrame` loops on every React re-render.
**How to avoid:** Ensure the loop is cancelled in the `useEffect` cleanup return.

## Code Examples

### Efficient Note Culling
```typescript
const viewportStart = currentTime - (HIT_LINE_X / PIXELS_PER_SECOND);
const viewportEnd = viewportStart + (canvasWidth / PIXELS_PER_SECOND);

const visibleNotes = notes.filter(n => 
  n.startTime + n.duration > viewportStart && n.startTime < viewportEnd
);
```

### Rocksmith-Standard String Colors (engine/constants.ts)
```typescript
export const STRING_COLORS = [
  '#BF00FF', // String 1 (High E) - Purple
  '#00FF00', // String 2 (B)      - Green
  '#FF8000', // String 3 (G)      - Orange
  '#00FFFF', // String 4 (D)      - Blue/Cyan
  '#FFFF00', // String 5 (A)      - Yellow
  '#FF0000', // String 6 (Low E)  - Red
];
```

## Open Questions
1. **Vertical Scaling:** How should the visualizer handle 7 or 8-string tracks? (Recommendation: Calculate lane height dynamically: `height / tuning.length`).
2. **Note Techniques:** How to represent bends/slides? (Initial thought: Linear interpolation of Y-coordinate for slides; bezier curves for bends).

## Sources
- MDN: Canvas 2D Optimization
- Tone.js Documentation (Transport Section)
- Rocksmith Community Color Standards
