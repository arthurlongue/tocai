---
phase: 04-integration-polish
plan: 05-gap
type: execute
wave: 2
gap_closure: true
depends_on: ["04-gap"]
files_modified:
  - src/engine/constants.ts
  - src/engine/Renderer.ts
  - src/engine/layout.ts
  - src/index.css
  - src/App.tsx
autonomous: false
requirements:
  - INTEGRATION-03
  - INTEGRATION-04
  - PERF-01
---

<objective>
Complete visual redesign based on UAT feedback. New color palette, improved contrast, better spacing, note tails, and cleaner UI.

**UAT Issues to Address:**
1. String lanes too dark, no contrast with canvas
2. Canvas background (#0a0a0a) too dark
3. All colors too dark and similar
4. Note fret numbers hard to read (contrast + font size)
5. Blue notes completely unreadable
6. Remove white ring around notes
7. Abandon Rocksmith color palette
8. Add tails to long notes (duration indicators)
9. Increase fret number font size
10. Elements take too much vertical space
11. Remove bottom section ("About" and "What's Next?")
12. UI looks "very boring and ugly"

**Note:** This plan requires user input for design direction. See Task 1.
</objective>

<execution_context>
@$HOME/.gemini/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/phases/phase-04/UAT.md
@.planning/phases/phase-04/04-02-SUMMARY.md
@src/engine/constants.ts
@src/engine/Renderer.ts
@src/index.css
@src/App.tsx
</context>

<tasks>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 1: Define new visual design direction</name>
  <files>N/A - Discussion</files>
  <action>
    User discussion to establish new design direction:

    **Questions to answer:**

    1. **Color Palette:**
       - What overall feel do you want? (modern, vibrant, professional, playful, dark/moody, bright/energetic?)
       - Preferred background tones? (light gray, medium gray, keep dark but lighter?)
       - Any colors you definitely want or want to avoid?

    2. **Note Colors:**
       - Want distinct, high-contrast colors per string?
       - Prefer neon/bright colors or muted/pastel?
       - Should colors follow any system (guitar strings, music theory, arbitrary)?

    3. **Note Appearance:**
       - Note shape: circles, rounded rectangles, guitar-pick shaped?
       - Note tails: should extend to show duration (like Guitar Pro)?
       - Font: what style for fret numbers? (bold, thin, modern?)

    4. **Layout Priorities:**
       - What's most important? (compact, spacious, balanced?)
       - What should feel prominent vs minimal?

    5. **References:**
       - Any apps/websites you think look great? (for inspiration)
       - Any Guitar Pro / music software with UI you like?
  </action>
  <verify>
    <automated>echo "Design direction captured in notes below"</automated>
  </verify>
  <done>
    Design direction documented with:
    - Color palette decisions
    - Note appearance decisions
    - Layout/spaced decisions
    - Reference examples (if provided)
  </done>
  <what-built>
    Design direction document for visual redesign.
  </what-built>
  <how-to-verify>
    Review captured design decisions. Confirm they match your vision.
  </how-to-verify>
  <resume-signal>Type your design preferences, or "use your best judgment" for Claude to propose</resume-signal>
</task>

<task type="auto">
  <name>Task 2: Create new color palette and theme tokens</name>
  <files>src/index.css, src/engine/constants.ts</files>
  <read_first>
    - src/index.css (current theme tokens)
    - src/engine/constants.ts (STRING_COLORS)
    - Task 1 notes (user's design direction)
  </read_first>
  <action>
    Based on Task 1 decisions, update color system:

    1. In src/index.css, update theme tokens:
       ```css
       :root {
         /* New background colors */
         --color-background: [value from Task 1];
         --color-surface: [value];
         --color-canvas: [value - lighter than current #0a0a0a];
         
         /* New string lane colors */
         --string-lane-color: [value - better contrast];
         
         /* New note colors (6 strings) */
         --note-color-0: [value];
         --note-color-1: [value];
         --note-color-2: [value];
         --note-color-3: [value];
         --note-color-4: [value];
         --note-color-5: [value];
         
         /* Text colors */
         --note-text-color: [value - high contrast];
       }
       ```

    2. In src/engine/constants.ts, update STRING_COLORS:
       ```typescript
       export const STRING_COLORS = [
         '#[color-0]', // String 0 (high E)
         '#[color-1]', // String 1 (B)
         '#[color-2]', // String 2 (G)
         '#[color-3]', // String 3 (D)
         '#[color-4]', // String 4 (A)
         '#[color-5]', // String 5 (low E)
       ];
       ```

    3. Ensure all note colors have:
       - Minimum 4.5:1 contrast ratio against canvas background
       - Distinct, easily distinguishable hues
       - No blue that's hard to read
  </action>
  <verify>
    <automated>pnpm test --run src/styles/theme.test.ts</automated>
  </verify>
  <done>
    New color palette applied. All colors have good contrast.
  </done>
</task>

<task type="auto">
  <name>Task 3: Improve note rendering (tails, font, remove ring)</name>
  <files>src/engine/Renderer.ts, src/engine/constants.ts</files>
  <read_first>
    - src/engine/Renderer.ts (drawNote method)
    - src/engine/constants.ts (add FONT_SIZE constant)
    - Task 1 notes (note appearance decisions)
  </read_first>
  <action>
    Modify note rendering in src/engine/Renderer.ts:

    1. **Remove white ring:**
       Find and remove the stroke/border code:
       ```typescript
       // REMOVE or comment out:
       // this.ctx.strokeStyle = "#fff";
       // this.ctx.lineWidth = 2;
       // this.ctx.stroke();
       ```

    2. **Increase font size:**
       Change font declaration:
       ```typescript
       // Old: "bold 12px sans-serif"
       this.ctx.font = "bold 16px sans-serif"; // or larger per Task 1
       ```

    3. **Add note tails for duration:**
       Modify drawNote() to draw rectangle with tail for long notes:
       ```typescript
       private drawNote(note: PlaybackNote, currentTime: number, laneHeight: number): void {
         const x = getNoteX(note.startTime, currentTime);
         const y = getNoteY(note.string, laneHeight);
         const color = STRING_COLORS[note.string] || "#fff";
         
         // Calculate tail length based on duration
         const tailLength = note.duration * PIXELS_PER_SECOND;
         const isLongNote = note.duration > 0.3; // Threshold for showing tail
         
         if (isLongNote) {
           // Draw rounded rectangle with tail
           this.ctx.fillStyle = color;
           this.ctx.beginPath();
           this.ctx.roundRect(x - NOTE_RADIUS, y - NOTE_RADIUS, 
                              tailLength + NOTE_RADIUS * 2, NOTE_RADIUS * 2, 
                              NOTE_RADIUS);
           this.ctx.fill();
         } else {
           // Draw circle for short notes
           this.ctx.fillStyle = color;
           this.ctx.beginPath();
           this.ctx.arc(x, y, NOTE_RADIUS, 0, Math.PI * 2);
           this.ctx.fill();
         }
         
         // Draw fret number (centered for circles, left-aligned for tails)
         this.ctx.fillStyle = "#000"; // or contrasting color
         this.ctx.font = "bold 16px sans-serif";
         this.ctx.textAlign = isLongNote ? "left" : "center";
         this.ctx.textBaseline = "middle";
         this.ctx.fillText(
           note.fret.toString(), 
           isLongNote ? x + 4 : x, 
           y
         );
       }
       ```
  </action>
  <verify>
    <automated>pnpm run build</automated>
  </verify>
  <done>
    Notes render with:
    - No white ring
    - Larger, readable font
    - Tails for long notes showing duration
  </done>
</task>

<task type="auto">
  <name>Task 4: Improve string lane visibility</name>
  <files>src/engine/Renderer.ts</files>
  <read_first>
    - src/engine/Renderer.ts (draw string lanes code)
    - src/index.css (new string lane color)
  </read_first>
  <action>
    Modify string lane rendering for better contrast:

    1. In Renderer.render(), find string lane drawing:
       ```typescript
       // Old:
       this.ctx.strokeStyle = "#333";
       this.ctx.lineWidth = 1;
       ```

    2. Update to use lighter color and/or thicker lines:
       ```typescript
       // New - higher contrast:
       this.ctx.strokeStyle = "#555"; // or CSS variable
       this.ctx.lineWidth = 1.5;
       ```

    3. Optional: Add subtle background fill to lanes:
       ```typescript
       // Add alternating lane backgrounds for clarity
       for (let i = 0; i < STRING_COUNT; i++) {
         const y = Math.floor(getNoteY(i, laneHeight));
         
         // Fill lane background
         this.ctx.fillStyle = i % 2 === 0 ? '#1a1a1a' : '#1e1e1e';
         this.ctx.fillRect(0, y - laneHeight/2, width, laneHeight);
         
         // Draw lane divider
         this.ctx.strokeStyle = "#555";
         this.ctx.lineWidth = 1.5;
         this.ctx.beginPath();
         this.ctx.moveTo(0, y);
         this.ctx.lineTo(width, y);
         this.ctx.stroke();
       }
       ```
  </action>
  <verify>
    <automated>pnpm run build</automated>
  </verify>
  <done>
    String lanes are clearly visible with good contrast against canvas.
  </done>
</task>

<task type="auto">
  <name>Task 5: Improve layout spacing and remove bottom section</name>
  <files>src/App.tsx, src/index.css</files>
  <read_first>
    - src/App.tsx (current layout structure)
    - Task 1 notes (layout priorities)
  </read_first>
  <action>
    Improve layout efficiency:

    1. In src/App.tsx, remove bottom section:
       ```typescript
       // REMOVE entire <section id="next-steps"> block:
       // <section id="next-steps">
       //   <div id="docs">...</div>
       //   <div id="social">...</div>
       // </section>
       ```

    2. Reduce vertical spacing:
       ```typescript
       // Change gap values:
       // Old: gap-8 (32px)
       // New: gap-4 (16px) or gap-6 (24px)
       
       <div className="w-full flex flex-col items-stretch gap-4">
       ```

    3. Optimize song info card:
       ```typescript
       // Reduce padding:
       // Old: p-6 (24px)
       // New: p-4 (16px)
       
       <div className="w-full max-w-md mx-auto p-4 bg-card...">
       ```

    4. Make visualizer height responsive:
       ```typescript
       // Old: h-[400px]
       // New: h-[300px] or use viewport units
       
       <div className="w-full h-[300px] md:h-[400px]">
         <Visualizer ... />
       </div>
       ```

    5. In src/index.css, reduce default font-size for more compact layout:
       ```css
       :root {
         /* Old: 18px */
         font: 16px / 145% var(--sans);
       }
       ```
  </action>
  <verify>
    <automated>pnpm run build</automated>
  </verify>
  <done>
    Layout is more compact. Bottom section removed. Better space efficiency.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 6: Verify visual redesign</name>
  <files>All modified files</files>
  <action>
    User verification of complete visual redesign:

    **Checklist:**
    1. Colors match the design direction from Task 1
    2. Note colors are distinct and readable (especially blue)
    3. Fret numbers are easy to read
    4. No white ring around notes
    5. Long notes have tails showing duration
    6. String lanes are visible with good contrast
    7. Layout feels less "tall" and wasteful
    8. Bottom section is removed
    9. Overall UI looks better (not "fucking ugly")

    **Test:**
    1. Load a song with varied note lengths
    2. Observe note colors, readability, tails
    3. Check string lane visibility
    4. Review overall layout and spacing
  </action>
  <verify>
    <automated>echo "Manual verification required"</automated>
  </verify>
  <done>
    Visual redesign complete and approved by user.
    All UAT visual issues resolved.
  </done>
  <what-built>
    Complete visual redesign with new colors, note rendering, and layout.
  </what-built>
  <how-to-verify>
    Review all visual changes against Task 1 design direction.
    Confirm all 9 checklist items pass.
  </how-to-verify>
  <resume-signal>Type "approved" if redesign looks good, or list what still needs work</resume-signal>
</task>

</tasks>

<verification>
Visual redesign addresses all UAT feedback:
- New color palette (not Rocksmith)
- Better contrast throughout
- Readable note colors and fret numbers
- Note tails for duration
- No white rings
- Improved spacing
- Bottom section removed
</verification>

<success_criteria>
- User approves new design direction (Task 1)
- All colors have good contrast ratios
- Notes are readable at all positions
- Long notes show duration tails
- Layout feels efficient, not wasteful
- UI looks "not fucking ugly" (user quote)
</success_criteria>

<output>
After completion, create `.planning/phases/phase-04/04-05-GAP-SUMMARY.md`
</output>
