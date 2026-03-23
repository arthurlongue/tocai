---
phase: phase-03
plan: 03-gap
type: execute
wave: 3
gap_closure: true
depends_on: []
files_modified: [src/components/Visualizer.tsx, src/engine/layout.ts, src/engine/Renderer.ts]
autonomous: true
---

<objective>
Fix visualizer bugs found during UAT Test 3:
1. Increase canvas container height to provide more vertical space.
2. Invert string layout so string 0 (high E, thinnest string) is at the top of the canvas.
3. Compensate for Web Audio output latency to perfectly sync the visual hit-line with the audible playback.
4. Fix logical width/height in the Renderer to account for devicePixelRatio.
</objective>

<execution_context>
@$HOME/.gemini/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/components/Visualizer.tsx
@src/engine/layout.ts
@src/engine/Renderer.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Increase Canvas Size and Fix Logical Dimensions</name>
  <files>src/components/Visualizer.tsx, src/engine/Renderer.ts</files>
  <action>
    1. In `src/components/Visualizer.tsx`, change the container class from `h-[300px]` to `h-[400px]` (or more if needed).
    2. In `src/engine/Renderer.ts`, the `render()` method currently uses `this.canvas.width` and `this.canvas.height` which are physical pixels (scaled by devicePixelRatio). Change this to use logical pixels:
       `const dpr = window.devicePixelRatio || 1;`
       `const width = this.canvas.width / dpr;`
       `const height = this.canvas.height / dpr;`
       Ensure `clearRect` uses the physical dimensions: `this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);` but layout logic uses `width` and `height`.
  </action>
  <verify>
    <automated>pnpm tsc -b</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 2: Fix String Inversion and Layout Tests</name>
  <files>src/engine/layout.ts, src/engine/layout.test.ts</files>
  <action>
    1. In `src/engine/layout.ts`, update `getNoteY` to place string 0 at the top:
       `return stringIndex * LANE_HEIGHT + (LANE_HEIGHT / 2);`
    2. Update the corresponding tests in `src/engine/layout.test.ts` to expect the new Y coordinates.
  </action>
  <verify>
    <automated>npx vitest --run src/engine/layout.test.ts</automated>
  </verify>
</task>

<task type="auto">
  <name>Task 3: Add Latency Compensation</name>
  <files>src/engine/Renderer.ts</files>
  <action>
    In `src/engine/Renderer.ts`, inside the `render()` loop, adjust the `currentTime` to account for audio context output latency.
    Change `const currentTime = Tone.getTransport().seconds;` to:
    `const context = Tone.getContext();`
    `const latency = (context.rawContext as AudioContext).outputLatency || 0;`
    `const lookAhead = context.lookAhead || 0;`
    `const currentTime = Math.max(0, Tone.getTransport().seconds - latency);`
    *Note: Subtracting latency ensures the visualizer is slightly "behind", meaning the note hits the line exactly when the audio buffer reaches the speakers.*
  </action>
  <verify>
    <automated>pnpm tsc -b</automated>
  </verify>
</task>

</tasks>
