# Phase 04: Integration & Polish - Research

**Researched:** 2026-03-23
**Domain:** Audio/Visual Integration, UI Polish, E2E Testing
**Confidence:** HIGH

## Summary

Phase 04 connects the parsing, audio, and visualizer modules into a unified, polished MVP experience. The research reveals that Tone.js provides native tempo control via `Tone.Transport.bpm` which naturally preserves pitch for synthesized notes (since each note is generated in real-time at the correct frequency). The minimap pattern requires a secondary canvas rendering the full song timeline with click/drag seek interaction. Dark theme implementation leverages Tailwind CSS v4's CSS-native configuration with custom color tokens. Playwright provides component testing for React/Vite apps with screenshot-based canvas verification.

**Primary recommendation:** Implement transport controls as React state that drives `Tone.Transport` mutations, render minimap as compressed overview canvas above main visualizer, configure custom dark theme tokens in `index.css`, and set up Playwright for E2E smoke tests with screenshot comparisons.

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Transport bar:** Full-featured, below visualizer (PLAY/PAUSE/STOP, seek, speed 0.25x-2.0x, track selector, volume)
- **Speed control:** Time-stretching without pitch shift using Tone.js
- **Minimap:** Overview canvas above main visualizer, click/drag to seek
- **Theme:** Custom dark with charcoal backgrounds + Rocksmith vibrant accents
- **Responsive:** Balanced across mobile/tablet/desktop
- **E2E:** Hybrid (manual UAT + Playwright smoke tests)

### the agent's Discretion
- Specific UI component implementation details (slider libraries, icon choices)
- Exact color token values within charcoal/slate palette
- Playwright test coverage scope beyond smoke tests
- Minimap height and visual style details

### Deferred Ideas (OUT OF SCOPE)
- Multi-track mixing UI (Milestone 2)
- Advanced technique indicators like bends/slides (Milestone 2)
- Score/accuracy tracking gamification (Milestone 3)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INTEGRATION-01 | Transport bar with full controls | Tone.Transport APIs, React state patterns, Tailwind UI components |
| INTEGRATION-02 | Speed control 0.25x-2.0x | Tone.Transport.bpm for synthesized audio (pitch preserved) |
| INTEGRATION-03 | Minimap/overview canvas | Secondary canvas rendering, click-to-seek via `Tone.Transport.seconds` |
| INTEGRATION-04 | Dark theme polish | Tailwind CSS v4 CSS-native tokens, WCAG contrast guidelines |
| PERF-01 | Responsive design | Mobile-first breakpoints, touch-optimized controls |
| PERF-02 | E2E testing | Playwright component testing, screenshot verification |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Tone.js | 15.1.22 | Audio synthesis & transport | Already integrated, provides `Transport.bpm` for tempo control |
| React | 19.2.4 | UI framework | Project standard, use state for controls not animation |
| Tailwind CSS | 4.2.2 | Styling | Project standard, v4 uses CSS-native configuration |
| Playwright | Latest | E2E testing | Recommended for Vite/React, supports component testing |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `lucide-react` | 1.0.1 | Icons | Transport controls (play, pause, stop, volume icons) |
| `radix-ui` | 1.4.3 | UI primitives | Dropdown for track selector, sliders for volume/speed |
| `@playwright/experimental-ct-react` | Latest | Component testing | Testing React components in Vite context |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tone.Transport.bpm | Tone.GrainPlayer + PitchShift | GrainPlayer is for audio files; synthesized notes preserve pitch naturally |
| Custom canvas minimap | Third-party timeline library | Adds dependency; minimap is simple enough for custom implementation |
| Playwright E2E | Cypress, Vitest E2E | Playwright has better multi-browser support, component testing integration |

**Installation:**
```bash
# Playwright for component testing
pnpm create playwright --ct

# Verify Tone.js version (already installed)
pnpm list tone
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── TransportBar.tsx      # New: Full transport controls
│   ├── Minimap.tsx           # New: Overview canvas
│   ├── Visualizer.tsx        # Existing: Main visualizer
│   ├── FileUpload.tsx        # Existing
│   └── ui/                   # Shadcn/UI components
├── hooks/
│   ├── usePlayback.ts        # Existing: Extend with speed control
│   ├── useTransportStatus.ts # Existing
│   └── useMinimap.ts         # New: Minimap interaction logic
├── engine/
│   ├── AudioEngine.ts        # Existing: Add speed control method
│   ├── Renderer.ts           # Existing
│   └── MinimapRenderer.ts    # New: Minimap-specific rendering
└── domain/
    └── types.ts              # Existing
```

### Pattern 1: Transport State Management
**What:** React state for UI controls, Tone.Transport as single source of truth for playback time
**When to use:** All transport control implementations
**Example:**
```typescript
// Source: Existing usePlayback.ts pattern
export const usePlayback = () => {
  const engine = AudioEngine.getInstance();

  const play = useCallback(async () => {
    await Tone.start();
    Tone.getTransport().start();
  }, []);

  const seek = useCallback((seconds: number) => {
    Tone.getTransport().seconds = seconds;
  }, []);

  const setSpeed = useCallback((multiplier: number) => {
    // For synthesized notes, changing BPM preserves pitch
    const baseBpm = 120; // Or store original song tempo
    Tone.getTransport().bpm.value = baseBpm * multiplier;
  }, []);

  return { play, pause, stop, seek, setSpeed };
};
```

### Pattern 2: Minimap Canvas Rendering
**What:** Secondary canvas showing compressed full-song timeline with current position indicator
**When to use:** Timeline navigation for long audio/visual content
**Example:**
```typescript
// Source: Canvas API + existing Renderer.ts pattern
export class MinimapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private track: Track | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  setTrack(track: Track): void {
    this.track = track;
    this.draw();
  }

  draw(currentTime: number = 0): void {
    if (!this.track) return;

    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw compressed timeline
    const songDuration = this.track.notes.reduce(
      (max, note) => Math.max(max, note.startTime + note.duration),
      0
    );
    const pixelsPerSecond = width / songDuration;

    // Draw all notes as small rectangles
    this.track.notes.forEach((note) => {
      const x = note.startTime * pixelsPerSecond;
      const y = (note.string / 6) * height;
      this.ctx.fillStyle = STRING_COLORS[note.string];
      this.ctx.fillRect(x, y, note.duration * pixelsPerSecond, 2);
    });

    // Draw current position indicator
    const playheadX = currentTime * pixelsPerSecond;
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(playheadX, 0);
    this.ctx.lineTo(playheadX, height);
    this.ctx.stroke();
  }

  getTimeFromX(x: number): number {
    const dpr = window.devicePixelRatio || 1;
    const width = this.canvas.width / dpr;
    const songDuration = this.track!.notes.reduce(
      (max, note) => Math.max(max, note.startTime + note.duration),
      0
    );
    return (x / width) * songDuration;
  }
}
```

### Pattern 3: Dark Theme Token Architecture
**What:** CSS custom properties for theme colors, semantic naming
**When to use:** Custom dark theme implementation
**Example:**
```css
/* Source: Tailwind CSS v4 patterns + existing index.css */
:root {
  /* Dark theme tokens */
  --color-background: #1a1a1a;      /* Charcoal base */
  --color-surface: #252525;         /* Slightly lighter */
  --color-surface-elevated: #2a2a2a;
  --color-border: #3a3a3a;
  --color-text-primary: #f3f4f6;
  --color-text-secondary: #9ca3af;
  
  /* Rocksmith accent colors */
  --accent-red: #FF0000;
  --accent-yellow: #FFFF00;
  --accent-blue: #0000FF;
  --accent-orange: #FFA500;
  --accent-green: #00FF00;
  --accent-purple: #A020F0;
}

/* Apply to Tailwind via CSS variables */
.bg-background { background-color: var(--color-background); }
.bg-surface { background-color: var(--color-surface); }
.text-primary { color: var(--color-text-primary); }
```

### Anti-Patterns to Avoid
- **Storing playback time in React state:** Causes unnecessary re-renders and stuttering. Always poll `Tone.Transport.seconds` directly in animation loop.
- **Using `Tone.Player.playbackRate` for speed control:** This changes pitch. For synthesized notes, use `Tone.Transport.bpm` instead.
- **Hardcoding color values in components:** Use CSS custom properties for theme consistency.
- **Testing canvas with DOM assertions:** Use Playwright's screenshot comparison for visual verification.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time-stretching audio files | Custom granular synthesis algorithm | `Tone.GrainPlayer` (for samples) or `Tone.Transport.bpm` (for synths) | Complex DSP, edge cases with artifacts |
| Slider/Range input | Custom drag handlers | Radix UI Slider or native `<input type="range">` | Accessibility, touch handling, keyboard support |
| Screenshot testing | Custom canvas pixel comparison | Playwright `toHaveScreenshot()` | Cross-browser rendering differences, baseline management |
| Color contrast checking | Manual luminance calculation | WCAG guidelines (4.5:1 for normal text) | Accessibility compliance, legal requirements |

**Key insight:** Tone.js synthesized audio naturally preserves pitch when changing tempo because each note is generated at the correct frequency in real-time. Time-stretching is only needed for pre-recorded audio samples.

## Runtime State Inventory

*Not applicable for this phase — no rename/refactor/migration operations.*

## Common Pitfalls

### Pitfall 1: Speed Control Affects Pitch
**What goes wrong:** Using `Tone.Player.playbackRate` changes both tempo and pitch (like a tape recorder).
**Why it happens:** Confusion between audio file playback vs. synthesized note generation.
**How to avoid:** For synthesized notes (current architecture), change `Tone.Transport.bpm.value`. For audio files, use `Tone.GrainPlayer` with separate `pitch` control.
**Warning signs:** Audio sounds "chipmunk-like" at high speeds or "demonic" at low speeds.

### Pitfall 2: React State Drives Animation
**What goes wrong:** Storing `currentTime` in React state and re-rendering on every frame.
**Why it happens:** React-centric thinking; not understanding Tone.js timing architecture.
**How to avoid:** Canvas render loop polls `Tone.Transport.seconds` directly. React state only for UI controls (play/pause buttons, slider positions).
**Warning signs:** Stuttering animation, high CPU usage, 60fps not maintained.

### Pitfall 3: Minimap Click Seek Desync
**What goes wrong:** Clicking minimap seeks to wrong position or doesn't update main visualizer.
**Why it happens:** Not accounting for canvas scaling (DPR), or not triggering re-render after seek.
**How to avoid:** Use `getBoundingClientRect()` for accurate coordinates, call `Tone.Transport.seconds = newTime`, let existing sync architecture handle the rest.
**Warning signs:** Playhead jumps to unexpected position after minimap click.

### Pitfall 4: Insufficient Color Contrast
**What goes wrong:** Dark theme text is unreadable against background.
**Why it happens:** Using colors that look good but fail WCAG contrast requirements.
**How to avoid:** Test all text/background combinations with contrast checker. Minimum 4.5:1 for normal text, 3:1 for large text.
**Warning signs:** Text disappears or becomes hard to read in certain lighting conditions.

### Pitfall 5: Touch Targets Too Small on Mobile
**What goes wrong:** Transport controls are unclickable on mobile devices.
**Why it happens:** Designing for desktop first, not accounting for touch interaction.
**How to avoid:** Minimum 44x44px touch targets per WCAG. Use `pointer: coarse` media query to detect touch devices.
**Warning signs:** Users miss buttons, accidental adjacent button presses.

## Code Examples

### Transport Bar Component
```tsx
// Source: Existing App.tsx pattern + Radix UI
import { Slider } from "@radix-ui/react-slider";
import { usePlayback } from "../hooks/usePlayback";
import { useTransportStatus } from "../hooks/useTransportStatus";
import * as Tone from "tone";

export const TransportBar: React.FC<{ songDuration: number }> = ({ songDuration }) => {
  const { play, pause, stop, seek } = usePlayback();
  const status = useTransportStatus();
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  // Poll current time from Tone.Transport (not React state for animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Tone.getTransport().seconds);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSeek = (value: number[]) => {
    seek(value[0]);
    setCurrentTime(value[0]);
  };

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setSpeed(newSpeed);
    // Change BPM, not playbackRate (preserves pitch for synths)
    Tone.getTransport().bpm.value = 120 * newSpeed;
  };

  return (
    <div className="w-full bg-surface border-t border-border p-4">
      <div className="flex items-center gap-4">
        {/* Playback Controls */}
        <div className="flex gap-2">
          {status === "started" ? (
            <button onClick={pause}>PAUSE</button>
          ) : (
            <button onClick={play}>PLAY</button>
          )}
          <button onClick={stop}>STOP</button>
        </div>

        {/* Seek Bar */}
        <Slider
          value={[currentTime]}
          max={songDuration}
          step={0.1}
          onValueChange={handleSeek}
          className="flex-1"
        />

        {/* Time Display */}
        <span className="text-sm text-secondary">
          {formatTime(currentTime)} / {formatTime(songDuration)}
        </span>

        {/* Speed Control */}
        <Slider
          value={[speed]}
          min={0.25}
          max={2}
          step={0.25}
          onValueChange={handleSpeedChange}
          className="w-32"
        />
        <span className="text-sm w-12">{speed.toFixed(2)}x</span>
      </div>
    </div>
  );
};
```

### Minimap Component
```tsx
// Source: Existing Visualizer.tsx pattern
export const Minimap: React.FC<{ track: Track; onSeek: (time: number) => void }> = ({ 
  track, 
  onSeek 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MinimapRenderer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = 40 * dpr; // Fixed height

    const renderer = new MinimapRenderer(canvas);
    renderer.setTrack(track);
    rendererRef.current = renderer;

    // Animation loop for playhead
    const animate = () => {
      setCurrentTime(Tone.getTransport().seconds);
      renderer.draw(Tone.getTransport().seconds);
      requestAnimationFrame(animate);
    };
    animate();

    return () => rendererRef.current?.stop();
  }, [track]);

  // Handle click to seek
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = rendererRef.current!.getTimeFromX(x);
    onSeek(time);
  };

  return (
    <div className="w-full bg-surface border-b border-border">
      <canvas
        ref={canvasRef}
        className="w-full h-10 cursor-pointer"
        onClick={handleClick}
      />
    </div>
  );
};
```

### Playwright Smoke Test
```typescript
// Source: Playwright component testing patterns
import { test, expect } from '@playwright/experimental-ct-react';
import App from '../src/App';

test('should load and display file upload', async ({ mount }) => {
  const component = await mount(<App />);
  await expect(component.getByText('Tocaí')).toBeVisible();
  await expect(component.getByText('Upload')).toBeVisible();
});

test('should play song after upload', async ({ mount }) => {
  const component = await mount(<App />);
  
  // Upload test file
  await component.getByTestId('file-input').setInputFiles('test-song.gp5');
  
  // Wait for parsing
  await expect(component.getByText('Test Song Title')).toBeVisible();
  
  // Click play
  await component.getByRole('button', { name: 'PLAY' }).click();
  
  // Verify transport started
  await expect(component.getByText('Status: started')).toBeVisible();
});

test('canvas renders notes', async ({ mount }) => {
  const component = await mount(<App />);
  
  // Upload and play
  await component.getByTestId('file-input').setInputFiles('test-song.gp5');
  await component.getByRole('button', { name: 'PLAY' }).click();
  
  // Wait for rendering
  await component.waitForTimeout(1000);
  
  // Screenshot comparison for canvas
  const canvas = component.getByRole('canvas');
  await expect(canvas).toHaveScreenshot('canvas-with-notes.png');
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `Tone.Player.playbackRate` for tempo | `Tone.Transport.bpm` for synths | Always (for synthesized audio) | Pitch preserved automatically |
| React state for animation timing | Direct `Tone.Transport` polling | Best practice | 60fps maintained, no stuttering |
| PostCSS config for Tailwind | CSS-native `@theme` directive | Tailwind v4 (2024) | Simpler configuration, faster builds |
| Manual canvas pixel testing | Playwright `toHaveScreenshot()` | 2024+ | Cross-browser baseline management |

**Deprecated/outdated:**
- `ScriptProcessorNode`: Use `AudioWorklet` for custom audio processing (deprecated in Web Audio API)
- Tailwind v3 `tailwind.config.js`: Migrate to CSS-native `@theme` in v4
- Testing canvas with `getImageData()`: Use visual regression testing instead

## Open Questions

1. **What is the base BPM for speed control?**
   - What we know: `Tone.Transport.bpm` controls tempo for synthesized notes
   - What's unclear: Should we use a fixed base (120 BPM) or extract original song tempo from Guitar Pro file
   - Recommendation: Extract original tempo from parsed song metadata if available, otherwise use 120 BPM default

2. **How to handle speed change mid-playback?**
   - What we know: `Tone.Transport.bpm.rampTo()` provides smooth transitions
   - What's unclear: Should speed changes be instant or ramped
   - Recommendation: Instant changes for simplicity; add ramping if users report jarring transitions

3. **What minimap height works best?**
   - What we know: Research suggests 40-60px for overview timelines
   - What's unclear: Optimal height for touch vs. mouse interaction
   - Recommendation: Start with 48px (12px per string lane), adjust based on user testing

4. **How much E2E test coverage is needed?**
   - What we know: CONTEXT.md specifies "smoke tests"
   - What's unclear: Which flows constitute smoke vs. full regression
   - Recommendation: Test upload → parse → play → visualize flow only; manual UAT for edge cases

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Playwright, Vite | ✓ | 20.x+ | — |
| pnpm | Package management | ✓ | 8.x+ | npm |
| Playwright browsers | E2E testing | ✗ | — | Manual testing only |
| Tone.js | Audio synthesis | ✓ | 15.1.22 | — |

**Missing dependencies with no fallback:**
- Playwright browser binaries: Must run `pnpm exec playwright install` after setup

**Missing dependencies with fallback:**
- None identified

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 (unit), Playwright (E2E) |
| Config file | `vite.config.ts` (Vitest), `playwright-ct.config.ts` (Playwright) |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm test && pnpm exec playwright test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTEGRATION-01 | Transport controls function | Component | `playwright test transport.spec.ts` | ❌ Wave 0 |
| INTEGRATION-02 | Speed control preserves pitch | Manual UAT | N/A | ❌ Manual |
| INTEGRATION-03 | Minimap click seeks correctly | Component | `playwright test minimap.spec.ts` | ❌ Wave 0 |
| INTEGRATION-04 | Dark theme contrast passes WCAG | Manual/axe | N/A | ❌ Manual |
| PERF-01 | Responsive layout works on breakpoints | Visual | `playwright test responsive.spec.ts --update-snapshots` | ❌ Wave 0 |
| PERF-02 | Core flow works end-to-end | E2E smoke | `playwright test smoke.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm test` (Vitest unit tests)
- **Per wave merge:** `pnpm exec playwright test` (E2E suite)
- **Phase gate:** All E2E smoke tests green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `playwright-ct.config.ts` — Playwright component testing configuration
- [ ] `tests/e2e/smoke.spec.ts` — Core upload → play → visualize flow
- [ ] `tests/e2e/transport.spec.ts` — Transport control tests
- [ ] `tests/e2e/minimap.spec.ts` — Minimap seek tests
- [ ] Playwright browser install: `pnpm exec playwright install`

## Sources

### Primary (HIGH confidence)
- Tone.js Documentation — Transport, scheduling, synthesis APIs
- MDN Web Audio API — Time-stretching, AudioWorklet
- Playwright Documentation — Component testing, screenshot comparison
- WCAG 2.1 — Contrast requirements (4.5:1 minimum)
- Tailwind CSS v4 Documentation — CSS-native configuration

### Secondary (MEDIUM confidence)
- Existing project code (`AudioEngine.ts`, `Renderer.ts`, `usePlayback.ts`)
- Project AGENTS.md — Architecture mandates, Tone.js patterns
- Web.dev — Responsive design principles

### Tertiary (LOW confidence)
- CSS-Tricks articles (some URLs returned 404)
- Smashing Magazine articles (some URLs returned 404)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries already in use or well-documented
- Architecture: HIGH — Follows existing project patterns
- Pitfalls: MEDIUM — Based on general Tone.js/React knowledge, not Tocaí-specific

**Research date:** 2026-03-23
**Valid until:** 2026-06-23 (90 days — Tone.js and Playwright are stable)
