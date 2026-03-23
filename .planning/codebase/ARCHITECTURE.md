# Architecture

**Analysis Date:** 2025-03-24

## Pattern Overview

**Overall:** Clean Architecture / Layered

**Key Characteristics:**
- **Separation of Concerns:** Pure domain logic is decoupled from React and Tone.js.
- **Single Source of Truth:** `Tone.getTransport().seconds` is the absolute time reference for both audio and rendering.
- **Service-Oriented:** External integrations (parsing, audio, storage) are encapsulated in services.

## Layers

**Domain:**
- Purpose: PURE typescript logic, zero external dependencies.
- Location: `src/domain/`
- Contains: Models, Pitch/Timing logic, Techniques data structures.
- Depends on: None.
- Used by: `src/services/`, `src/engine/`, `src/components/`

**Services:**
- Purpose: Integrations with the outside world (GuitarPro parser, LocalForage, Tone.js).
- Location: `src/services/`
- Contains: `parser.ts`, `storage.ts`, `audio.ts`.
- Depends on: `src/domain/`, external libraries (`tone`, `localforage`, `guitarpro-parser`).
- Used by: `src/components/`, `src/hooks/`

**Engine:**
- Purpose: Canvas rendering loop and coordinate math.
- Location: `src/engine/`
- Contains: Renderer, Layout math, Canvas primitives.
- Depends on: `src/domain/`, `src/services/` (for time reference).
- Used by: `src/components/` (specifically `PlayerCanvas.tsx`).

**UI / React:**
- Purpose: User interface and application state management.
- Location: `src/components/`
- Contains: Player layout, controls, track mixer, etc.
- Depends on: `src/hooks/`, `src/services/`, `src/domain/`, `src/engine/`.
- Used by: `src/App.tsx`

**Glue / Hooks:**
- Purpose: React bindings for services and the rendering engine.
- Location: `src/hooks/`
- Contains: `useEngine.ts`, `usePlayback.ts`, `useResize.ts`.
- Depends on: `src/services/`, `src/engine/`.
- Used by: `src/components/`

## Data Flow

**Song Loading & Playback:**

1. **User Action:** User selects a `.gp` file in `src/components/Library.tsx`.
2. **Parse:** `src/services/parser.ts` converts the file to normalized domain types (`PlaybackNote`).
3. **Store:** `src/services/storage.ts` persists data via `localforage`.
4. **Schedule:** `src/services/audio.ts` schedules notes onto `Tone.Transport`.
5. **Render:** `src/engine/renderer.ts` runs the `requestAnimationFrame` loop, polling `Tone.Transport` for the current time.

**State Management:**
- Current implementation uses React State (`useState`) lifted to `src/App.tsx` or `src/components/Player.tsx`.
- Avoids complex state managers (Redux/Zustand) for the initial phase.

## Key Abstractions

**PlaybackNote:**
- Purpose: Normalized data structure for a single note event with an absolute start time in seconds.
- Examples: `src/domain/types.ts`
- Pattern: Data Transfer Object (DTO)

**Renderer Loop:**
- Purpose: Decoupled canvas drawing logic using `requestAnimationFrame`.
- Examples: `src/engine/renderer.ts`
- Pattern: Game Loop

## Entry Points

**Main Entry:**
- Location: `src/main.tsx`
- Triggers: Browser load.
- Responsibilities: Renders the root React application into the DOM.

**Root App:**
- Location: `src/App.tsx`
- Triggers: Rendered by `main.tsx`.
- Responsibilities: Global layout, routing state, top-level error boundaries.

## Error Handling

**Strategy:** Fail gracefully with UI feedback.

**Patterns:**
- **React Error Boundaries:** Used in `src/App.tsx` to catch parsing or rendering crashes.
- **Service Errors:** Services throw explicit errors for malformed files or failed storage operations.

## Cross-Cutting Concerns

**Logging:** Standard `console` for development.
**Validation:** `guitarpro-parser` handles initial file validation.
**Styling:** Tailwind CSS + Radix UI components (shadcn/ui).

---

*Architecture analysis: 2025-03-24*
