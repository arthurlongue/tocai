## [DECISIONS]

- 2026-03-23T00:00Z [USER] Use pnpm + BiomeJS for package management and linting/formatting.
- 2026-03-25T17:00Z [USER] Replace Vite README with Tocaí-specific docs; keep app dark-mode only.
- 2026-03-25T18:08Z [USER] Fix stopped-state Visualizer seek regression + Playwright server reuse in CI.
- 2026-03-25T18:28Z [USER] Add regression coverage for playback-speed desync.
- 2026-03-25T19:09Z [USER] Replace renderer-only speed fix with shared playback-timeline sync layer.
- 2026-03-25T19:20Z [USER] Review codebase for performance and coding-standards concerns.
- 2026-03-25T19:35Z [USER] Fix reviewed issues via delegated workstreams (speed control, parser, visual sync, flattening).
- 2026-03-25T19:46Z [USER] Re-triage after minimap/slider seek desync and broad Playwright failures.
- 2026-03-25T21:00Z [USER] Fix invalid Playwright fixture and shared minimap/slider seek desync.
- 2026-03-25T22:00Z [USER] Implement multi-track audio: simultaneous playback, track selection, solo mode, dual volume controls.

## [OUTCOMES]

- 2026-03-26T16:02Z [TOOL] Fixed regressions: App now restores `resetSpeed()` + `engine.reset()` on song load/clear/delete; TrackMixer mute labels unique via track index; storage uses clone-on-write mock crossing serialization boundary. 19 files, 113 tests.
- 2026-03-26T15:33Z [TOOL] Partial fix: App removed `resetSpeed()` entirely; only `AudioEngine.reset()` resets Tone transport. TrackMixer labels still name-based. Storage fixture mocks `Map<string, any>`.
- 2026-03-26T01:06Z [TOOL] Fixed stale renderer canvas assertions in `Renderer.test.ts` (18 files, 107 tests).
- 2026-03-26T00:48Z [TOOL] Restored number-only canvas note rendering (sustain tails remain).
- 2026-03-26T00:45Z [TOOL] Restored colored string lane guides; removed Visualizer wrapper borders.
- 2026-03-25T23:45Z [TOOL] Multi-track audio: per-track `StringSynth` + `Volume` nodes, `TrackMixer` component (28 tests).
- 2026-03-25T21:12Z [TOOL] Parser-valid GP5 fixture + seek/minimap sync fix. 16 files, 81 tests, 12/12 E2E.
- 2026-03-25T19:14Z [TOOL] Committed playback-sync fix (`63e6807`), refreshed GitNexus.
- 2026-03-25T19:09Z [TOOL] Moved playback-speed visual sync to `playbackTimeline.ts`.
- 2026-03-25T18:28Z [TOOL] Added renderer speed-change regression test, fixed visual speed sync.
- 2026-03-25T18:12Z [TOOL] Full validation: build, vitest, playwright (12/12 Chromium).
- 2026-03-23T14:46Z [TOOL] Scaffolded clean-architecture dirs, initialized Shadcn UI for Tailwind v4.

## [PROGRESS]

- 2026-03-26T00:46Z [USER] Parallel agent reverted Renderer to boxed note bodies; restored number-only rendering.
- 2026-03-26T00:30Z [TOOL] Enlarged note labels/body, removed lane guide lines; restored colored string lanes at 00:45.
- 2026-03-25T21:00Z [TOOL] Split fix implementation into fixture/upload recovery and seek/sync recovery tracks.
- 2026-03-23T14:45Z [TOOL] Scaffolded clean-architecture dirs, initialized Shadcn UI for Tailwind v4.

## [DISCOVERIES]

- 2026-03-26T01:06Z [CODE] Renderer draws six glowing string lanes, two-pass hit-line stroke, per-note text, FPS label. Tests counting raw canvas calls drift unless they isolate note-hit-line from lane/FPS.
- 2026-03-23T14:46Z [TOOL] Shadcn CLI `init -d` fails with Tailwind v4 unless `components.json` has `"config": ""` + `"cssVariables": true`.
- 2026-03-25T17:00Z [TOOL] `playwright.config.ts` used `npm run dev`; pnpm standard, default suite was 114 tests/9 workers.
- 2026-03-25T17:00Z [CODE] App lacks library/reload flow; `STRING_COUNT` fixed at 6; no dynamic instrument range.
- 2026-03-25T17:15Z [CODE] Visualizer/minimap RAF loops triggered Tone warnings before user activation.
- 2026-03-25T17:52Z [CODE] `Visualizer` must read `Tone.getTransport().seconds` because `stop()` resets to 0; seek positions survive rerenders.
- 2026-03-25T18:11Z [CODE] `useTransportStatus()` must guard `on/off` methods on mocked Tone transport objects.
- 2026-03-25T18:28Z [CODE] Renderer vs MinimapRenderer speed mismatch caused teleporting notes; fixed via shared song-time math.
- 2026-03-25T19:20Z [CODE] Minimap redraw scales with note count; upload writes to IndexedDB before parse; flattening is O(n); oversized bundle (552 kB minified).
- 2026-03-25T19:24Z [CODE] `parser.ts` had `test-song.gp5` shortcut; `flattening.ts` used `any`; `App.tsx` had debug paths.
- 2026-03-25T19:42Z [CODE] `TransportBar` polls only during playback; no permanent idle timer.
- 2026-03-25T19:56Z [CODE] `tests/fixtures/test-song.gp5` was 364-byte handcrafted stub; `guitarpro-parser` threw `Offset outside bounds`. Vitest mocks masked this.
- 2026-03-25T19:57Z [CODE] Minimap and slider seek shared `usePlayback.seek()` which wrote song seconds directly to transport seconds; speed-adjusted timeline model contradicted this.
- 2026-03-25T21:09Z [CODE] Fixed: `usePlayback.seek()` maps song→transport time; `MinimapRenderer.getTimeFromX()` clamps to `[0, songDuration]`. Fixture replaced with parser-valid GP5.
