# Phase 1: Domain & Parsing Foundation - Research

**Researched:** 2024-05-24
**Domain:** Guitar Pro Parsing & Audio/Visual Sync
**Confidence:** HIGH

## Summary

This research focuses on the foundation for Tocaí: parsing Guitar Pro files, designing a clean internal domain model, and efficiently handling binary files. The core strategy is to use `guitarpro-parser` (v1.2.0) to extract hierarchical data and "flatten" it into a linear timeline of `PlaybackNote` objects. This separation ensures the UI and Audio Engine remain agnostic of the original file format complexities.

**Primary recommendation:** Use a Web Worker to parse files into a flattened "Linear Domain Model" where all notes have absolute start times and durations in seconds. Use `Tone.Part` for scheduling these notes.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `guitarpro-parser` | `1.2.0` | `.gp*` file parsing | Pure JS, supports all versions (GP3-8), zero dependencies. |
| `tone` | `15.1.22` | Audio synthesis | Industry standard for web audio, accurate timing via `Transport`. |
| `localforage` | `1.10.0` | IndexedDB storage | Simple API for persistent storage of `Blob` objects. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `lucide-react` | `1.0.1` | UI Icons | Standard minimalist icon set. |
| `zod` | `^3.x` | Type validation | Validating internal domain models if needed. |

**Installation:**
```bash
npm install guitarpro-parser tone localforage lucide-react
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── domain/            # Pure TypeScript types & domain logic
│   ├── types.ts       # Song, Track, Measure, PlaybackNote
│   └── flattening.ts  # Logic to convert TabSong -> Song
├── services/          # Side-effect heavy logic
│   ├── parser.ts      # guitarpro-parser wrapper & Worker logic
│   ├── audio.ts       # Tone.js engine & scheduling
│   └── library.ts     # IndexedDB / localforage management
└── hooks/             # React integration
    ├── useSong.ts     # Loads and manages the current Song
    └── usePlayback.ts # Interfaces with audio.ts
```

### Pattern 1: Linear Domain Model (Flattening)
**What:** Converting hierarchical `Song -> Track -> Bar -> Beat -> Note` into a linear array of notes with absolute timestamps.
**When to use:** Crucial for both `Tone.Part` (audio) and scrolling canvas (visual) to ensure they use the same timing source of truth.
**Example:**
```typescript
// Proposed Domain Model (src/domain/types.ts)
export interface Song {
  metadata: { title: string; artist: string; album: string };
  tracks: Track[];
  measures: Measure[];
  durationSeconds: number;
}

export interface Track {
  id: string;
  name: string;
  tuning: number[]; // MIDI notes
  notes: PlaybackNote[];
}

export interface PlaybackNote {
  pitch: number;      // MIDI note (base + fret + capo)
  startTime: number;  // Seconds from start
  duration: number;   // Seconds
  string: number;     // 0-based
  fret: number;
  techniques: NoteTechniques;
}
```

### Anti-Patterns to Avoid
- **Parsing on Main Thread:** Don't parse files in the main thread; even a 500ms freeze ruins the UX. Use Web Workers.
- **Hierarchical Playback:** Don't try to play back by iterating through bars/beats in real-time. It's error-prone and jittery. Flatten first.
- **Manual Math:** Don't calculate beat durations using BPM manually. Use `beatDurationMs(beat)` from `guitarpro-parser`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File Storage | Custom IndexedDB | `localforage` | Handles serialization and browser quirks automatically. |
| Audio Timing | `setTimeout`/`setInterval` | `Tone.Transport` | Sample-accurate timing vs non-deterministic JS timers. |
| Musical Math | Custom BPM calc | `beatDurationMs` | Tuplets, dotted notes, and complex tempo changes are hard to get right. |
| Binary Parsing | Custom Byte Parser | `guitarpro-parser` | Parsing GPX/GP7 is extremely complex (XML/Binary hybrids). |

## Common Pitfalls

### Pitfall 1: Tied Notes
**What goes wrong:** Tied notes trigger two separate "attacks" in the audio engine, creating a click or double-strike.
**How to avoid:** During flattening, if `note.tie.destination` is true, merge it into the previous note by extending the previous note's duration and skipping the current note.

### Pitfall 2: Memory Leaks (Audio)
**What goes wrong:** Creating new synths or `Tone.Part` instances on every song load without disposing of old ones.
**How to avoid:** Always call `part.dispose()` and `synth.dispose()` when a track is removed or the song changes.

### Pitfall 3: Browser Autoplay Policy
**What goes wrong:** `Tone.js` fails to start because the AudioContext is suspended.
**How to avoid:** Call `await Tone.start()` inside a user interaction (Click handler) before triggering any audio.

## Code Examples

### Web Worker Parsing (Best Practice)
```typescript
// parser.worker.ts
import { parseTabFile } from 'guitarpro-parser';

self.onmessage = async (e) => {
  const { data, fileName } = e.data;
  try {
    const tabSong = parseTabFile(data, fileName);
    // Perform flattening logic here or return tabSong
    const flattened = flattenSong(tabSong);
    self.postMessage({ success: true, song: flattened });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
```

### Binary File Handling
```typescript
// Best practice for reading file input
const onFileChange = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  
  // Use Transferables to move buffer to worker efficiently
  worker.postMessage({ data, fileName: file.name }, [data.buffer]);
  
  // Save to IndexedDB as Blob for persistence
  await localforage.setItem(file.name, new Blob([data]));
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MIDI.js | Tone.js | ~2018 | Better scheduling and synthesis flexibility. |
| AlphaTab | `guitarpro-parser` | Recent | Lighter weight, no UI coupling (better for custom canvas). |
| Base64 storage | `Blob` storage | HTML5 | Drastically reduced memory usage for binary data. |

## Open Questions

1. **Repeat Handling:** Does the MVP require full support for repeat signs (1st/2nd endings)? 
   - *Recommendation:* Flatten the song "as heard" (expanding repeats) during the initial parse to simplify playback and rendering.
2. **Technique Rendering:** Which techniques are absolute "must-haves" for Phase 1?
   - *Recommendation:* Slides and Bends are most visually impactful. Palm mutes and Let Ring are audio-critical.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/Dev | ✓ | 20.x | — |
| pnpm | Packages | ✓ | 9.x | — |
| IndexedDB | Storage | ✓ | — | In-memory cache |
| AudioContext| Audio | ✓ | — | Muted mode |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest + Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |
| Full suite command | `npm run test:run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PARSE-01 | `.gp` file parsing | unit | `vitest src/domain/flattening.test.ts` | ❌ Wave 0 |
| DOMAIN-01| Note flattening | unit | `vitest src/domain/flattening.test.ts` | ❌ Wave 0 |
| BINARY-01| IndexedDB storage | integration | `vitest src/services/library.test.ts` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `src/domain/flattening.test.ts` — covers flattening logic and tied notes.
- [ ] `src/services/library.test.ts` — covers Blob storage and retrieval.
- [ ] Sample `.gp` files for testing (mocks or fixtures).

## Sources

### Primary (HIGH confidence)
- `docs/guitarpro-parser/README.md` - API and data structures.
- `docs/ai-specs/03-audio-and-parsing.md` - Core project strategy.
- `docs/tonejs/README.md` - Audio engine implementation details.

### Secondary (MEDIUM confidence)
- MDN Web Docs - Binary data (Blob/ArrayBuffer) best practices.
- Tone.js Documentation - `Tone.Part` vs `Tone.Sequence` performance.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are confirmed and versioned.
- Architecture: HIGH - Flattening pattern is standard for this domain.
- Pitfalls: HIGH - Common audio/parsing issues are identified.

**Research date:** 2024-05-24
**Valid until:** 2024-06-24
