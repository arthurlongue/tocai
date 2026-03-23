# UI and Canvas Rendering Strategy

This document guides the construction of the visual engine and the surrounding React UI components.

## 1. Canvas Rendering (`engine/renderer.ts`)

The core visual experience is a fast, smooth scrolling timeline. To achieve this without React re-render overhead, the canvas is managed natively.

### 1.1 The Render Loop
- Use standard `requestAnimationFrame`.
- The loop constantly polls `Tone.getTransport().seconds` to determine the current viewport.
- **NEVER** store playback progress in React state to drive the canvas animation (it will stutter).

```ts
function renderLoop() {
  const currentTime = Tone.getTransport().seconds;
  
  ctx.clearRect(0, 0, width, height);
  drawLanes(ctx, trackInfo);
  drawHitLine(ctx);
  drawNotes(ctx, notes, currentTime);
  
  requestAnimationFrame(renderLoop);
}
```

### 1.2 Coordinate Math (`engine/layout.ts`)
The X-axis represents time.
X Coordinate of a note:
```ts
const x = HIT_LINE_X_OFFSET + (note.startTime - currentTime) * PIXELS_PER_SECOND;
```
If `x < 0`, the note has passed the screen and can be culled.
If `x > canvas.width`, the note is off-screen to the right and can be culled.

The Y-axis represents physical guitar strings.
Y Coordinate of a note:
```ts
const laneHeight = canvas.height / numberOfStrings;
const y = (note.string + 0.5) * laneHeight; // center it in the lane
```

### 1.3 Canvas Best Practices (`engine/primitives.ts`)
- **HiDPI Scaling:** Always scale the canvas by `window.devicePixelRatio`. **CRITICAL:** You must update the actual HTML `<canvas width={physicalWidth} height={physicalHeight}>` attributes, not just the CSS width/height, and then call `ctx.scale(dpr, dpr)` to prevent blurry rendering.
- **State Leakage:** Wrap every distinct drawn element (e.g., a single note, a specific bend line) in `ctx.save()` and `ctx.restore()` to prevent styling attributes (colors, line widths, dashes) from bleeding into subsequent draw calls.
- **Color Coding:** Standardize a color palette for strings (e.g., String 1 = Red, String 2 = Yellow, etc.) defined centrally in `engine/constants.ts`.

## 2. React UI Components (`components/`)

### 2.1 Hooks (`hooks/useEngine.ts`)
Connect the React lifecycle to the vanilla canvas.
```tsx
export function PlayerCanvas({ track }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    let animationFrameId: number;
    // ... setup and start requestAnimationFrame
    
    // CRITICAL: Prevent memory leaks / double render speedups 
    return () => cancelAnimationFrame(animationFrameId); 
  }, [track]);
  
  return <canvas ref={canvasRef} className="w-full h-full" />;
}
```

### 2.2 Shadcn/UI integration
Use provided UI primitives (Tailwind-styled Radix components) to build the interface.
- **`Controls.tsx`**: Uses `Button` objects for Play/Pause, `Slider` for the seek bar (polling `Tone.Transport.seconds` at ~10hz for the UI, distinct from the canvas).
- **`TrackMixer.tsx`**: Uses `Button` and `Select` elements to choose the primary active track to render, and map mute/solo states to the Tone.js audio graph.
- **`Library.tsx`**: Uses `Card` and list elements to display localforage entries. Drag-and-drop file upload target covering the component.

### 2.3 Layout Structure
```text
+------------------------------------------+
| Sidebar        | Main Content Area       |
| (Library.tsx)  |                         |
| - Song 1       |   +-------------------+ |
| - Song 2       |   |                   | |
| [ Upload BTN ] |   | PlayerCanvas.tsx  | |
|                |   |                   | |
|                |   +-------------------+ |
|                |                         |
|                | Bottom Bar (Controls)   |
|                | [Play] [Stop] [==|====] |
+------------------------------------------+
```