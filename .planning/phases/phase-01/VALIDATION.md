# Phase 1: Domain & Parsing Foundation - Validation

This document tracks the validation of requirements and truths for Phase 1.

## Requirement Coverage

| Req ID | Description | Plan | Status |
|--------|-------------|------|--------|
| DOMAIN-01 | Internal song/track/measure/note data structures | 01-01 | ⏳ PENDING |
| PARSE-01 | Guitar Pro file parsing & worker offloading | 01-02 | ⏳ PENDING |
| UI-UPLOAD-01 | File upload & basic metadata display | 01-03 | ⏳ PENDING |
| BINARY-01 | IndexedDB storage (localforage) | 01-04 | ⏳ PENDING |

## Observable Truths

| Truth | Verification Method | Status |
|-------|---------------------|--------|
| Hierarchical TabSong data is correctly transformed into a linear array of PlaybackNote objects | `src/domain/flattening.test.ts` | ⏳ PENDING |
| Note timings (startTime, duration) are correctly calculated in seconds | `src/domain/flattening.test.ts` | ⏳ PENDING |
| Tied notes are merged into a single PlaybackNote with extended duration | `src/domain/flattening.test.ts` | ⏳ PENDING |
| MIDI pitch is correctly calculated from tuning + fret + capo | `src/domain/flattening.test.ts` | ⏳ PENDING |
| Song repeats are expanded during flattening (flattened "as heard") | `src/domain/flattening.test.ts` | ⏳ PENDING |
| Guitar Pro files are parsed in a separate Web Worker | Human verify / DevTools | ⏳ PENDING |
| File data is transferred to the worker using Transferables | `src/services/parser.ts` code audit | ⏳ PENDING |
| User can select a .gp file using a file input | Human verify (01-03) | ⏳ PENDING |
| App displays song metadata upon successful upload | Human verify (01-03) | ⏳ PENDING |
| Guitar Pro file data (Blobs) can be persisted to IndexedDB | `src/services/library.test.ts` | ⏳ PENDING |

## Critical Links

| From | To | Via | Status |
|------|----|-----|--------|
| `FileUpload` | `parser.ts` | Async `parseFile` call | ⏳ PENDING |
| `parser.ts` | `parser.worker.ts` | `postMessage` (Transferable) | ⏳ PENDING |
| `parser.worker.ts` | `flattening.ts` | Function call | ⏳ PENDING |
| `App.tsx` | `library.ts` | Persistence (Planned for later) | ⏳ PENDING |

## Automated Tests

| Test Suite | Purpose | Command |
|------------|---------|---------|
| `src/domain/flattening.test.ts` | Logic validation | `npx vitest src/domain/flattening.test.ts` |
| `src/services/library.test.ts` | Storage validation | `npx vitest src/services/library.test.ts` |
