# Phase 02: Basic Audio Engine - Research

**Researched:** 2025-05-22
**Domain:** Audio Synthesis & Scheduling (Tone.js)
**Confidence:** HIGH

## Summary

This phase focuses on building a robust, synchronized audio engine using `Tone.js`. The research confirms that for a guitar-centric application, a "One Synth per String" architecture is superior to a generic `PolySynth` because it allows independent control over slides, bends, and vibrato for each of the six strings. Scheduling should leverage `Tone.Part` for batch processing of pre-calculated notes, and React synchronization should be handled via a combination of event listeners for status and controlled polling for playback position.

**Primary recommendation:** Use an array of 6 `Tone.Synth` (or `FMSynth`) instances managed by a single coordinator, rather than a single `Tone.PolySynth`, to enable authentic guitar techniques.

## User Constraints (from CONTEXT.md)
*No CONTEXT.md found for this phase. Research follows ROADMAP.md and REQUIREMENTS.md.*

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `tone` | ^15.1.22 | Web Audio framework | Industry standard for timing-critical web audio. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `lucide-react` | ^1.0.1 | Transport Icons | Standard UI icons for Play/Pause/Stop. |

**Installation:**
```bash
npm install tone
```

## Architecture Patterns

### Recommended Project Structure
```
src/
└── engine/
    ├── AudioEngine.ts     # Main coordinator (Singleton/Context)
    ├── StringSynth.ts      # Wrapper for a single string synth
    ├── TransportHook.ts    # React hooks for syncing state
    └── constants.ts        # Audio configuration (latency, synth settings)
```

### Pattern 1: One Synth per String
**What:** Instead of `new Tone.PolySynth()`, maintain an array of 6 `Tone.Synth` objects.
**When to use:** Required for guitar techniques (slides/vibrato on specific strings).
**Example:**
```typescript
// Source: Community Best Practices for Guitar Tab Players
const strings = [0, 1, 2, 3, 4, 5].map(() => new Tone.Synth().toDestination());

function playNote(stringIndex: number, freq: number, time: number, duration: number) {
  strings[stringIndex].triggerAttackRelease(freq, duration, time);
}

function slide(stringIndex: number, targetFreq: number, time: number, rampTime: number) {
  strings[stringIndex].frequency.exponentialRampTo(targetFreq, rampTime, time);
}
```

### Pattern 2: Tone.Part for Scheduling
**What:** Use `Tone.Part` to schedule a large array of `PlaybackNote` objects.
**When to use:** Whenever a song is loaded or the "flattened" playback data changes.
**Example:**
```typescript
const part = new Tone.Part((time, note) => {
  engine.playNote(note.string, note.pitch, time, note.duration);
}, playbackNotes);
part.start(0);
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Precision Timing | `setInterval` or `setTimeout` | `Tone.Transport` | Browser timers drift; Tone.js uses the AudioContext clock. |
| Pitch Ramping | Manual value updates | `param.rampTo()` | Built-in sample-accurate linear/exponential interpolation. |
| UI Sync | Direct state updates from audio | `Tone.Draw` | Prevents UI updates from blocking the audio thread or being out of sync. |

## Common Pitfalls

### Pitfall 1: AudioContext Suspension
**What goes wrong:** Audio doesn't play because the browser blocks the AudioContext until a user gesture.
**How to avoid:** Call `await Tone.start()` inside a `onClick` handler (e.g., the "Play" button or an initial "Enable Audio" overlay).

### Pitfall 2: React State Over-rendering
**What goes wrong:** Updating a `currentTime` state on every frame causes the entire app to re-render 60 times a second, leading to lag.
**How to avoid:** Use a ref for the current time or a specialized hook that uses `requestAnimationFrame` and only triggers state updates when necessary for the UI (e.g., progress bar).

## Code Examples

### React 19 Transport Sync Hook
```typescript
// Source: Adapted from Tone.js React patterns
export function useTransportStatus() {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const startId = Tone.Transport.on("start", () => setIsPlaying(true));
    const stopId = Tone.Transport.on("stop", () => setIsPlaying(false));
    const pauseId = Tone.Transport.on("pause", () => setIsPlaying(false));

    return () => {
      Tone.Transport.off("start", startId);
      Tone.Transport.off("stop", stopId);
      Tone.Transport.off("pause", pauseId);
    };
  }, []);

  return isPlaying;
}
```

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Web Audio API | Tone.js | ✓ | — | None (Required) |
| LocalForage | Phase 1 storage | ✓ | 1.10.0 | — |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| AUDIO-01 | Tone.js Context Initialization | unit | `vitest engine/AudioEngine.test.ts` |
| AUDIO-02 | Note Scheduling Accuracy | integration | `vitest engine/Scheduling.test.ts` |
| AUDIO-03 | Transport Controls (Play/Pause) | unit | `vitest hooks/useTransport.test.ts` |

## Sources

### Primary (HIGH confidence)
- [Tone.js Official Documentation](https://tonejs.github.io/docs/)
- [Web Audio API Resume Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices#autoplays_and_user_gestures)

### Secondary (MEDIUM confidence)
- Community patterns for React + Tone.js (Draw/Transport synchronization).

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH (One-synth-per-string is a proven model for guitar)
- Pitfalls: HIGH

**Research date:** 2025-05-22
**Valid until:** 2025-06-21
