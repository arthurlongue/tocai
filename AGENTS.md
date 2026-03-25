# Tocaí (v2) Project Context

## Project Overview
Tocaí is a web-based Guitar Pro tablature player and visualizer. It runs entirely in the browser, parsing `.gp`, `.gp3`, `.gp5`, and `.gpx` files, rendering them on a scrolling canvas (similar to Rocksmith or Synthesia), and synthesizing audio playback.

## Core Technologies
- **Package Manager**: pnpm.
- **UI Framework**: React with TypeScript.
- **Styling**: Tailwind CSS (with Shadcn/UI components).
- **Tooling**: BiomeJS for linting and formatting.
- **Audio Engine**: [Tone.js](docs/tonejs/README.md).
- **Tab Parsing**: [`guitarpro-parser`](docs/guitarpro-parser/README.md).
- **Persistence**: IndexedDB (via `localforage`) for local song storage.
- **Rendering**: HTML5 Canvas (60fps scrolling timeline).
- **Testing**: Vitest + Testing Library.

## Technical Architecture
The project follows **Clean Architecture** principles to maintain strict module boundaries:

- `src/domain/`: Pure TypeScript logic (types, MIDI-to-frequency math, timing/tempo conversions). Zero external dependencies.
- `src/services/`: Integrations with external libraries.
    - `parser.ts`: Converts hierarchical GP data into a flat array of `PlaybackNote` objects.
    - `audio.ts`: Orchestrates Tone.js (Transport, synths, and scheduling).
    - `storage.ts`: Handles IndexedDB operations.
- `src/engine/`: Canvas rendering logic.
    - `renderer.ts`: Main `requestAnimationFrame` drawing loop.
    - `layout.ts`: Coordinate math for note positioning (X = time, Y = string).
- `src/components/`: React UI components.
- `src/hooks/`: React lifecycle glue (e.g., `useEngine`, `usePlayback`, `useResize`).

## Key Implementation Mandates

### 1. Timing & Synchronization
- **Single Source of Truth**: `Tone.getTransport().seconds` is the absolute time reference.
- **No React State for Animation**: The canvas render loop must poll `Tone.Transport` directly. Never store playback progress in React state to drive the canvas (to prevent stuttering).

### 2. Audio Synthesis
- **String Isolation**: Use an array of `Tone.Synth` (one per string) to allow independent pitch glides (bends/slides) without affecting other ringing notes.
- **Sample-Accurate Scheduling**: Use `Tone.Part` for all playback. Do not use standard JS timers.
- **User Gesture**: Audio must be started via `Tone.start()` in response to a user click.

### 3. Visual Rendering
- **HiDPI Scaling**: Scale the canvas by `window.devicePixelRatio` to prevent blurriness.
- **Canvas Best Practices**: Use `ctx.save()` and `ctx.restore()` to encapsulate draw styles. Cull notes that are outside the viewport bounds.

## Directory Overview
- `docs/ai-specs/`: Comprehensive design documents (Requirements, Architecture, Audio/Parsing, UI/Canvas).
- `docs/guitarpro-parser/`: API reference for the parsing library.
- `docs/tonejs/`: Documentation and examples for the audio framework.

## CONTINUITY.md (REQUIRED)

Maintain a single continuity file for the current workspace: `.agents/CONTINUITY.md`.

- `.agents/CONTINUITY.md` is a living document and canonical briefing designed to survive compaction; do not rely on earlier chat/tool output unless it's reflected there.

- At the start of each assistant turn: read `.agents/CONTINUITY.md` before acting.

### File Format

Update `.agents/CONTINUITY.md` only when there is a meaningful delta in:

  - `[PLANS]`: "Plans Log" is a guide for the next contributor as much as checklists for you.
  - `[DECISIONS]`: "Decisions Log" is used to record all decisions made.
  - `[PROGRESS]`: "Progress Log" is used to record course changes mid-implementation, documenting why and reflecting upon the implications.
  - `[DISCOVERIES]`: "Discoveries Log" is for when when you discover optimizer behavior, performance tradeoffs, unexpected bugs, or inverse/unapply semantics that shaped your approach, capture those observations with short evidence snippets (test output is ideal.
  - `[OUTCOMES]`: "Outcomes Log" is used at completion of a major task or the full plan, summarizing what was achieved, what remains, and lessons learned.

### Anti-drift / anti-bloat rules

- Facts only, no transcripts, no raw logs.
- Every entry must include:
  - a date in ISO timestamp (e.g., `2026-01-13T09:42Z`)
  - a provenance tag: `[USER]`, `[CODE]`, `[TOOL]`, `[ASSUMPTION]`
  - If unknown, write `UNCONFIRMED` (never guess). If something changes, supersede it explicitly (don't silently rewrite history).
- Keep the file bounded, short and high-signal (anti-bloat). 
- If sections begin to become bloated, compress older items into milestone (`[MILESTONE]`) bullets.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **tocai** (315 symbols, 746 relationships, 19 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/tocai/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/tocai/context` | Codebase overview, check index freshness |
| `gitnexus://repo/tocai/clusters` | All functional areas |
| `gitnexus://repo/tocai/processes` | All execution flows |
| `gitnexus://repo/tocai/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
