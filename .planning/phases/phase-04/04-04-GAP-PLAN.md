---
phase: 04-integration-polish
plan: 04-gap
type: execute
wave: 1
gap_closure: true
depends_on: []
files_modified:
  - src/engine/Renderer.ts
  - src/hooks/useSpeedControl.ts
  - src/engine/AudioEngine.ts
autonomous: true
requirements:
  - PERF-01
---

<objective>
Fix canvas synchronization with speed control. When user changes playback speed (0.25x - 2.0x), the canvas scrolling speed must match the audio tempo change.

**Root cause hypothesis:** Renderer polls `Tone.Transport.seconds` which returns absolute time, not adjusted for tempo changes. Need to use `Tone.Transport.position` or apply speed multiplier to the visual time calculation.
</objective>

<execution_context>
@$HOME/.gemini/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/phases/phase-04/UAT.md
@.planning/phases/phase-04/04-01-SUMMARY.md
@src/engine/Renderer.ts
@src/hooks/useSpeedControl.ts
@src/engine/AudioEngine.ts
@src/engine/layout.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Diagnose canvas sync issue with speed control</name>
  <files>src/engine/Renderer.ts, src/hooks/useSpeedControl.ts</files>
  <read_first>
    - src/engine/Renderer.ts (current time polling implementation)
    - src/hooks/useSpeedControl.ts (speed state management)
    - src/engine/AudioEngine.ts (setSpeed implementation)
  </read_first>
  <action>
    1. Review Renderer.render() method - find where `currentTime` is calculated
    2. Check if `Tone.Transport.seconds` accounts for BPM changes
    3. Test: Set speed to 0.5x, observe if `Tone.Transport.seconds` slows down
    4. Identify the correct API to use for tempo-adjusted time
    
    **Expected finding:** `Tone.Transport.seconds` returns wall-clock time, not musical time.
    Need to either:
    - Use `Tone.Transport.position` (returns beats, affected by tempo)
    - Or manually apply speed multiplier: `visualTime = Tone.Transport.seconds * speed`
  </action>
  <verify>
    <automated>console.log test: "Tone.Transport.seconds at 0.5x speed = [value]"</automated>
  </verify>
  <done>
    Root cause identified and documented.
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix Renderer to account for speed multiplier</name>
  <files>src/engine/Renderer.ts</files>
  <read_first>
    - src/engine/Renderer.ts (file being modified)
    - src/engine/AudioEngine.ts (get current speed from engine)
    - src/engine/layout.ts (calculateVisibleNotes uses currentTime)
  </read_first>
  <action>
    Modify src/engine/Renderer.ts render() method:

    1. Import or access current speed value:
       - Option A: Import AudioEngine.getInstance().getSpeed()
       - Option B: Pass speed as parameter to render()
       - Option C: Store speed as class property, update via setSpeed() method

    2. Apply speed to time calculation:
       ```typescript
       const rawTime = Tone.getTransport().seconds;
       const speed = this.speed || 1.0; // Get from somewhere
       const adjustedTime = rawTime * speed;
       ```
       
       OR use Tone.Transport.position if it accounts for tempo:
       ```typescript
       const position = Tone.getTransport().position; // Returns beats
       const tempo = Tone.getTransport().bpm.value;
       const time = (position / tempo) * 60; // Convert to seconds
       ```

    3. Use `adjustedTime` instead of `rawTime` for:
       - calculateVisibleNotes() call
       - drawNote() positions
       - Playhead position

    4. Add method to update speed:
       ```typescript
       setSpeed(speed: number): void {
         this.speed = speed;
       }
       ```
  </action>
  <verify>
    <automated>pnpm run build</automated>
  </verify>
  <done>
    Renderer accounts for speed multiplier in time calculations.
  </done>
</task>

<task type="auto">
  <name>Task 3: Wire speed updates to Renderer</name>
  <files>src/components/Visualizer.tsx, src/hooks/useSpeedControl.ts</files>
  <read_first>
    - src/components/Visualizer.tsx (Renderer instantiation)
    - src/hooks/useSpeedControl.ts (speed changes)
    - src/engine/Renderer.ts (new setSpeed method)
  </read_first>
  <action>
    1. In Visualizer.tsx:
       - Get current speed from useSpeedControl hook
       - Pass speed to Renderer via ref or prop
       - Or call renderer.setSpeed() when speed changes

    2. In useSpeedControl.ts:
       - Add callback option: when speed changes, notify Renderer
       - Or expose speed value for Visualizer to read

    3. Integration pattern:
       ```typescript
       // In Visualizer.tsx
       const { speed } = useSpeedControl();
       
       useEffect(() => {
         if (rendererRef.current) {
           rendererRef.current.setSpeed(speed);
         }
       }, [speed]);
       ```
  </action>
  <verify>
    <automated>pnpm run build</automated>
  </verify>
  <done>
    Renderer receives speed updates when user changes tempo.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: Verify canvas sync at all speeds</name>
  <files>src/engine/Renderer.ts</files>
  <action>
    User verification of canvas sync fix:

    1. Load a song
    2. Set speed to 0.5x - notes should scroll at half speed, matching audio
    3. Set speed to 1.0x - normal speed
    4. Set speed to 1.5x - notes scroll 1.5x faster
    5. Set speed to 2.0x - notes scroll 2x faster
    6. Verify notes cross hit-line exactly when you hear the sound at ALL speeds
  </action>
  <verify>
    <automated>echo "Manual verification required"</automated>
  </verify>
  <done>
    Canvas scrolling speed matches audio tempo at all speed settings (0.25x - 2.0x).
    Notes cross hit-line in sync with audio at all speeds.
  </done>
  <what-built>
    Canvas synchronization with speed control.
  </what-built>
  <how-to-verify>
    1. Load song, start playback
    2. Change speed slider through full range (0.25x to 2.0x)
    3. Watch notes cross the white hit-line
    4. Listen for audio sync at each speed
    5. Confirm visual and audio are synchronized at all tempos
  </how-to-verify>
  <resume-signal>Type "approved" if sync works at all speeds, or describe what's still off</resume-signal>
</task>

</tasks>

<verification>
Canvas scroll speed matches audio tempo across full speed range (0.25x - 2.0x).
Notes cross hit-line in perfect sync with audio at all speeds.
</verification>

<success_criteria>
- Renderer accounts for speed multiplier in time calculations
- Speed changes are wired to Renderer
- Visual sync matches audio at 0.25x, 0.5x, 1.0x, 1.5x, 2.0x
- No stuttering or jumping when speed changes
</success_criteria>

<output>
After completion, create `.planning/phases/phase-04/04-04-GAP-SUMMARY.md`
</output>
