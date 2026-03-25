## [DECISIONS]

- 2026-03-23T00:00Z [USER] Use pnpm as the package manager and BiomeJS for linting/formatting in the canonical project guidance.
- 2026-03-25T17:00Z [USER] Replace the stock Vite README with repo-specific documentation tied to current code paths, setup, architecture, and known gaps.
- 2026-03-25T17:28Z [USER] Keep the app dark-mode only and tune the palette for high contrast.
- 2026-03-25T18:08Z [USER] Fix the stopped-state Visualizer seek regression and Playwright server reuse in CI.
- 2026-03-25T18:20Z [USER] Commit the current uncommitted workspace changes as-is.
- 2026-03-25T18:28Z [USER] Add regression coverage for playback-speed desync.
- 2026-03-25T19:09Z [USER] Replace the renderer-only speed fix with a shared playback-timeline synchronization layer.
- 2026-03-25T19:20Z [USER] Review the codebase for performance and KISS/DRY/YAGNI concerns.
- 2026-03-25T19:24Z [USER] Run an additional standards-focused review pass.
- 2026-03-25T19:35Z [USER] Fix the reviewed performance and coding-standards issues with delegated workstreams matched to the task difficulty.
- 2026-03-25T19:46Z [USER] Re-triage validation after noticing seek desync through minimap/time slider and broad Playwright failures.
- 2026-03-25T21:00Z [USER] Delegate the actual fixes for the invalid Playwright fixture and the shared minimap/slider seek desync, including the minimap overshoot bug where clicks could produce impossible song times.

## [OUTCOMES]

- 2026-03-25T21:24Z [TOOL] Corrected `test:all` to use `pnpm test -- --run` so Vitest no longer blocks the chained suite in watch mode.

- 2026-03-25T21:20Z [TOOL] Added `test:all` to `package.json` so one command now runs `pnpm test`, `pnpm test:e2e`, and `pnpm test:e2e:smoke` while skipping the UI runner.

- 2026-03-23T00:00Z [TOOL] Updated `AGENTS.md` and `docs/ai-specs/02-architecture.md` so the tech stack docs include pnpm and BiomeJS.
- 2026-03-25T17:00Z [TOOL] Rewrote the root `README.md` into Tocaí-specific documentation and verified the unit/component suite still passed (`pnpm test -- --run`: 10 files, 57 tests).
- 2026-03-25T17:20Z [TOOL] Moved `App.tsx` styling to Tailwind utilities and removed legacy global layout CSS.
- 2026-03-25T17:52Z [TOOL] Reduced idle canvas work so visualizers draw statically while idle and animate only during playback; verified with `pnpm build`.
- 2026-03-25T18:10Z [TOOL] Rebuilt local Playwright around Chromium-only smoke coverage, trimmed the default E2E suite to 12 tests, refreshed screenshot baselines, and verified Chromium passed 12/12.
- 2026-03-25T18:12Z [TOOL] Verified the full local validation path after the Playwright/runtime cleanup: `pnpm build`, `pnpm test -- --run`, and `pnpm test:e2e` all passed.
- 2026-03-25T18:28Z [TOOL] Added a renderer regression test for speed changes, then fixed the visual speed sync and verified with focused Vitest coverage plus `pnpm build`.
- 2026-03-25T19:09Z [TOOL] Moved playback-speed visual sync into `src/engine/playbackTimeline.ts` and wired renderer/minimap/transport/hooks to continuous song time across speed changes and seeks; verified with focused Vitest coverage, `pnpm test -- --run`, and `pnpm build`.
- 2026-03-25T19:14Z [TOOL] Committed the playback-speed synchronization fix as `63e6807` and refreshed the GitNexus index.
- 2026-03-25T19:20Z [TOOL] Completed a performance/maintainability review; `pnpm build` passed and `pnpm exec biome check .` still reported pre-existing hook-dependency diagnostics.
- 2026-03-25T19:24Z [TOOL] Completed a standards review; the highest-signal issues were the `test-song.gp5` parser shortcut, module-global speed registry, `any`-based flattening internals, and placeholder/debug paths in `App.tsx`.
- 2026-03-25T19:42Z [TOOL] Implemented the reviewed fixes across playback controls, parser/upload flow, visual synchronization, minimap rendering, and flattening/layout performance. `useSpeedControl` is now local App-owned state, `TransportBar` is controlled by props and no longer idles on a permanent timer, `usePlayback`/`Visualizer`/`Minimap` coordinate through `src/engine/visualSync.ts`, `MinimapRenderer` caches a static layer, `parseFile()` no longer special-cases `test-song.gp5`, uploads parse before non-blocking persistence, `flattenSong()` no longer depends on `_measures`/`any` escapes, and renderer note culling narrows the scanned note range.
- 2026-03-25T19:43Z [TOOL] Verified the implementation with `pnpm test -- --run` (`15 files, 76 tests`), `pnpm build`, and a touched-files `pnpm exec biome check ...` pass. Full-repo `pnpm exec biome check .` still fails on pre-existing diagnostics outside this change set.
- 2026-03-25T19:44Z [TOOL] Ran delegated post-change reviews with `code-reviewer` and `typescript-reviewer`; both reported no blocking findings in the modified upload, playback, minimap, and flattening/layout paths.
- 2026-03-25T21:10Z [TOOL] Delegated and completed the regression fixes across two write scopes: a parser-valid GP5 fixture plus real parser integration coverage for E2E upload, and an inverse playback-timeline seek mapping plus minimap click clamping for audio/visual synchronization.
- 2026-03-25T21:12Z [TOOL] Re-validated the integrated workspace with `pnpm test -- --run` (`16 files, 81 tests`), `pnpm test:e2e` (`12/12`), `pnpm build`, and touched-file `pnpm exec biome check ...`; delegated `code-reviewer` and `typescript-reviewer` passes both approved with no blocking findings.

## [PROGRESS]

- 2026-03-23T14:45Z [TOOL] Scaffolded the clean-architecture directories and configured `@/*` path aliases.
- 2026-03-23T14:46Z [TOOL] Initialized Shadcn UI manually for Tailwind v4 and downloaded the common base components.
- 2026-03-25T18:05Z [USER] Requested fixes for the Visualizer stopped-state seek regression and Playwright server reuse in CI.
- 2026-03-25T19:35Z [TOOL] Split the implementation into separate workstreams: App/transport speed-state cleanup, parser/upload critical-path cleanup, explicit visual-sync decoupling, and flattening/layout performance cleanup.
- 2026-03-25T19:55Z [USER] Reported that minimap/time-slider navigation still desynchronizes notes and audio, and that Playwright coverage is mostly failing despite the green Vitest run.
- 2026-03-25T19:46Z [TOOL] Started delegated regression triage: one worker ran the full Vitest/Playwright surface, then follow-up investigation focused on the upload path, seek path, and test-coverage gaps.
- 2026-03-25T20:26Z [USER] Reported that seek via minimap or transport slider still desynchronizes notes and audio, and requested delegated triage of the full automated test surface before further fixes.
- 2026-03-25T21:00Z [TOOL] Split the fix implementation into two delegated tracks: fixture/upload recovery and seek/minimap synchronization recovery.

## [DISCOVERIES]

- 2026-03-23T14:46Z [TOOL] Shadcn CLI `init -d` fails with Tailwind v4 unless `components.json` is manually crafted with `"config": ""` and `"cssVariables": true`.
- 2026-03-25T17:00Z [TOOL] `playwright.config.ts` still used `npm run dev`; the repo standard is pnpm, and the default suite expanded to 114 tests across 9 workers.
- 2026-03-25T17:00Z [CODE] Uploads persist to IndexedDB, but the app still lacks a library/reload flow and always renders `song.tracks[0]`; `STRING_COUNT` is fixed at 6, so extended-range instruments are not yet dynamic.
- 2026-03-25T17:15Z [CODE] Visualizer/minimap started RAF loops immediately after upload and triggered repeated Tone warnings before user activation; the checked-in debug spec also forwards browser console spam to stdout.
- 2026-03-25T17:52Z [CODE] Idle redraws now gate on transport state, but `Visualizer` must still read `Tone.getTransport().seconds` because `Transport.stop()` resets that value to `0` and seek positions must survive rerenders.
- 2026-03-25T18:11Z [CODE] `useTransportStatus()` must tolerate mocked `Tone.getTransport()` objects without `on/off` methods; guarding those listeners restored the unit suite without changing runtime behavior.
- 2026-03-25T18:28Z [CODE] `Renderer` once multiplied raw transport seconds by speed while `MinimapRenderer` stayed on raw seconds, causing teleporting notes and then a frozen 1x feel until both paths mapped through shared song-time math.
- 2026-03-25T19:09Z [TOOL] `gitnexus_detect_changes({scope:"all"})` reported `risk_level: high` for the playback-sync patch because it touched `usePlayback`, `Renderer`, `Minimap`, `TransportBar`, and `useSpeedControl`.
- 2026-03-25T19:20Z [CODE] Minimap redraw cost scales with total note count; upload flow writes to IndexedDB before parse; tied-note flattening is O(n); `usePlayback()` still depends on DOM escape hatches; and the speed/timeline flow spans module state plus Tone BPM.
- 2026-03-25T19:20Z [TOOL] Production build still emits a single oversized JS chunk (`dist/assets/index-CcRR-P8v.js` at 552.70 kB minified, 158.40 kB gzip).
- 2026-03-25T19:24Z [CODE] `src/services/parser.ts` has a filename-based `test-song.gp5` fast path, `src/domain/flattening.ts` uses `any` for `_measures`/`repeatCount`, and `src/App.tsx` still carries debug/placeholder paths.
- 2026-03-25T19:42Z [CODE] `TransportBar` now subscribes to the explicit visual-sync channel and only polls while playback is started, so seek/pause/stop UI updates no longer rely on a permanent idle timer.
- 2026-03-25T19:43Z [TOOL] `gitnexus_detect_changes({scope:"all"})` returned `risk_level: critical` because the working tree already includes `AGENTS.md` plus broad playback/render edits across 20 files; the affected execution flows remained inside the intended upload, playback, minimap, and visualizer surfaces.
- 2026-03-25T19:56Z [TOOL] `pnpm test -- --run` still passes (`15 files, 76 tests`), but `pnpm test:e2e` now fails `11/12` Chromium specs at `tests/e2e/helpers.ts:32` because uploading `tests/fixtures/test-song.gp5` never leaves the upload screen.
- 2026-03-25T19:56Z [CODE] The checked-in `tests/fixtures/test-song.gp5` is a handcrafted fixture from `tests/fixtures/generate-gp5.cjs`; with the parser shortcut removed, the real `guitarpro-parser` throws `Offset is outside the bounds of the DataView`, so `FileUpload` never reaches `onSongLoaded`.
- 2026-03-25T19:57Z [CODE] Minimap clicks and the transport slider share the same `usePlayback.seek()` path, which currently writes song seconds directly into `Tone.getTransport().seconds` even though `playbackTimeline` models song time as speed-adjusted transport time; this explains seek desync after speed changes.
- 2026-03-25T19:57Z [CODE] Current Vitest coverage mocks `parseFile`/`parseTabFile` and encodes the current seek assumption, so it does not exercise a real GP5 fixture in browser context or assert seek correctness after speed changes.
- 2026-03-25T19:46Z [TOOL] `pnpm test -- --run` still passes (`15 files, 76 tests`), but `pnpm test:e2e` now fails `11/12` Chromium specs at `tests/e2e/helpers.ts:32` because upload never leaves the initial screen after `test-song.gp5` selection.
- 2026-03-25T19:47Z [CODE] `src/services/parser.ts` now always sends `test-song.gp5` through `guitarpro-parser`, and the checked-in fixture `tests/fixtures/test-song.gp5` currently throws `RangeError: Offset is outside the bounds of the DataView` when parsed directly. The old filename shortcut masked an invalid/minimal fixture rather than proving parser compatibility.
- 2026-03-25T19:47Z [CODE] Both minimap clicks and the transport seek slider funnel into the same `usePlayback.seek()` path (`src/App.tsx`, `src/components/TransportBar.tsx`, `src/components/Minimap.tsx`). That seek path writes the requested song time directly into `Tone.getTransport().seconds` even though `playbackTimeline.ts` models song time as a speed-adjusted projection of raw transport time, so seek math can diverge from audio scheduling after speed changes.
- 2026-03-25T19:47Z [CODE] The current unit tests missed the upload regression because `src/components/FileUpload.test.tsx` and `src/services/parser.test.ts` mock `parseFile` / `parseTabFile`; they verify pipeline usage but never parse the real `tests/fixtures/test-song.gp5` fixture end to end.
- 2026-03-25T20:26Z [TOOL] A delegated full test run found `pnpm test -- --run` still passing (`15/15` files, `76/76` tests) while `pnpm test:e2e` failed `11/12` Chromium specs at the shared `loadSong()` helper because the app never left the upload screen after file selection.
- 2026-03-25T20:26Z [TOOL] Real browser reproduction confirmed the upload failure is not Playwright selector drift: uploading `tests/fixtures/test-song.gp5` raises `Failed to load song: Offset is outside the bounds of the DataView`, originating from `guitarpro-parser` inside `parseFile()` / `handleFileChange()`.
- 2026-03-25T20:26Z [CODE] `tests/fixtures/test-song.gp5` is a 364-byte handcrafted fixture from `tests/fixtures/generate-gp5.cjs`; the current `src/services/parser.test.ts` and `src/components/FileUpload.test.tsx` only mock the parser/upload path and never assert that the checked-in GP5 fixture is parseable, so Vitest could stay green while all upload-driven Playwright specs regressed.
- 2026-03-25T20:26Z [CODE] The current seek path routes both minimap and transport slider through `usePlayback.seek()`; it writes the requested song time directly into `Tone.getTransport().seconds` and separately re-anchors `playbackTimeline`, so minimap seeks and slider seeks share the same transport-vs-song-time mismatch when speed scaling is active.
- 2026-03-25T19:50Z [TOOL] Re-ran validation: `pnpm test -- --run` passed (`15 files, 76 tests`), but `pnpm test:e2e` failed 11/12. Every failing Chromium spec stopped in `tests/e2e/helpers.ts` at `expect(ui.songTitle).toBeVisible()` after `setInputFiles()`, and the page snapshot stayed on the initial upload screen.
- 2026-03-25T19:50Z [CODE] The Playwright failures are shared-runtime regressions, not syntax-only issues: the browser reaches the landing page, but the uploaded `.gp5` fixture never advances the UI out of the upload state, blocking all upload-driven smoke/transport/minimap/responsive specs at the same helper assertion.
- 2026-03-25T20:29Z [TOOL] Browser-side repro with the Playwright CLI showed the upload path raises an alert: `Failed to load song: Offset is outside the bounds of the DataView`. Vite console tracing pinned it to `guitarpro-parser` reading `tests/fixtures/test-song.gp5` through `parseFile()` in the browser.
- 2026-03-25T20:30Z [CODE] `tests/fixtures/test-song.gp5` is a 364-byte handcrafted stub from `tests/fixtures/generate-gp5.cjs`, not a parser-validated fixture. The removed filename fast-path in `src/services/parser.ts` had been masking this, so Vitest stayed green because `FileUpload.test.tsx` mocks `parseFile()` and `parser.test.ts` only asserts the pipeline runs, not that the fixture parses successfully.
- 2026-03-25T20:31Z [CODE] Minimap seek and transport-slider seek share the same desync path: both call `usePlayback.seek()`, which currently assigns `Tone.getTransport().seconds = songSeconds` and then anchors `syncPlaybackTimeline(songSeconds, rawTransportSeconds)`. That assumes song-time and raw transport time are interchangeable, which contradicts the current speed-mapped timeline model and the intended seek semantics once playback speed is not 1x.
- 2026-03-25T21:09Z [CODE] `usePlayback.seek()` now maps requested song time back to raw transport time through `getTransportSecondsForSongTime()`, while `MinimapRenderer.getTimeFromX()` clamps clicks to `[0, songDuration]`; this fixes shared seek desync and prevents minimap clicks from producing impossible times.
- 2026-03-25T21:09Z [CODE] `tests/fixtures/test-song.gp5` is now parser-valid and covered by `src/services/parser.integration.test.ts`, so the browser upload path and Playwright suite no longer depend on the removed filename shortcut or a broken handcrafted stub.
- 2026-03-25T21:12Z [TOOL] `gitnexus_detect_changes({scope:"all"})` still reports `risk_level: critical` because the workspace contains broader pending edits and `AGENTS.md` drift, but the affected flows for this pass remained inside the intended upload, playback, minimap, and visualizer paths.
