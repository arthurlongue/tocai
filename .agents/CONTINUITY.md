## [DECISIONS]

- 2026-03-23T00:00Z [USER] Documented pnpm as the package manager and BiomeJS as the lint/format tooling in the canonical project guidance.
- 2026-03-25T17:00Z [USER] Chose to replace the default Vite README with a repo-specific `README.md` grounded in current code paths, setup commands, architecture, and known gaps.
- 2026-03-25T17:28Z [USER] Requested a review and improvement of the color palette for high contrast, and decided the app will exclusively use dark mode.
- 2026-03-25T18:08Z [USER] Requested fixes for the two review findings covering stopped-state visualizer seeks and Playwright server reuse in CI.
- 2026-03-25T18:20Z [USER] Requested that the current uncommitted workspace changes be committed as-is.

## [OUTCOMES]

- 2026-03-23T00:00Z [TOOL] Updated `AGENTS.md` and `docs/ai-specs/02-architecture.md` so the tech stack documentation now includes pnpm and BiomeJS.
- 2026-03-25T17:00Z [TOOL] Rewrote the root `README.md` from the stock Vite template into project documentation for Tocaí, covering product scope, runtime flow, stack, pnpm commands, tests, docs, and present limitations.
- 2026-03-25T17:00Z [TOOL] Verified the existing unit/component suite still passes after the documentation update (`pnpm test -- --run`: 10 files, 57 tests).
- 2026-03-25T17:15Z [TOOL] Reviewed the Playwright setup and reproduced the resource spike: `pnpm exec playwright test` scheduled 114 tests on 9 workers, while the app spins canvas/Tone polling loops after upload and the checked-in debug spec mirrors browser console spam to stdout.
- 2026-03-25T17:20Z [TOOL] Refactored `src/App.tsx` layout/styling entirely to Tailwind utility classes, deleted `src/App.css`, and removed legacy global CSS layout rules from `src/index.css`.
- 2026-03-25T17:28Z [TOOL] Refactored `index.css` to use a high-contrast Tailwind Zinc palette strictly mapped for dark mode on `:root`, replacing inline hardcoded HEX colors and passing all theme tests.
- 2026-03-25T17:38Z [TOOL] Fixed TypeScript error TS18048 in `src/components/Minimap.tsx` by adding a null check for `canvasRef.current` in `handlePointerDown`. Verified fix with `pnpm build`.
- 2026-03-25T17:52Z [TOOL] Reduced idle canvas work in `src/components/Visualizer.tsx`, `src/components/Minimap.tsx`, `src/hooks/usePlayback.ts`, and `src/engine/Renderer.ts` so canvases draw statically while idle and only animate when playback is started. Verified with `pnpm build`.
- 2026-03-25T18:10Z [TOOL] Rebuilt the local Playwright workflow around Chromium only: added `tests/e2e/helpers.ts`, added `pnpm test:e2e:smoke`, removed `tests/e2e/test-debug.spec.ts`, cut the default E2E suite to 12 tests, and refreshed the two Chromium screenshot baselines in `tests/e2e/responsive.spec.ts-snapshots/`. Verified with `pnpm exec playwright test --project=chromium --workers=3 --reporter=line` (`12 passed`).
- 2026-03-25T18:12Z [TOOL] Verified the full local validation path after the Playwright/runtime cleanup: `pnpm build`, `pnpm test -- --run` (`10 files, 56 tests`), and `pnpm test:e2e` (`12 passed`).
- 2026-03-25T18:06Z [TOOL] Resolved the two review regressions in the current working tree: `src/components/Visualizer.tsx` now preserves `Tone.Transport.seconds` for non-playing redraws, `playwright.config.ts` again disables `reuseExistingServer` under `CI`, and `src/components/Visualizer.test.tsx` covers the stopped seek + rerender path.
- 2026-03-25T18:06Z [TOOL] Fixed the review regressions by making `Visualizer` redraw idle states from `Tone.getTransport().seconds`, restoring `reuseExistingServer: !process.env.CI` in `playwright.config.ts`, and adding `src/components/Visualizer.test.tsx` for the stopped-after-seek case.
- 2026-03-25T18:06Z [TOOL] Revalidated the targeted fix with `pnpm test -- --run src/components/Visualizer.test.tsx src/components/Minimap.test.tsx` (`11 files, 57 tests`) and `pnpm build`.
- 2026-03-25T18:05Z [TOOL] Fixed the post-review regressions by keeping `Visualizer` idle redraws aligned to `Tone.getTransport().seconds`, restoring `reuseExistingServer: !process.env.CI` in Playwright, and adding `src/components/Visualizer.test.tsx`. Verified with `pnpm test -- --run src/components/Visualizer.test.tsx src/components/Minimap.test.tsx`, `pnpm build`, and `pnpm test:e2e:smoke` (`10 passed`).
- 2026-03-25T18:06Z [TOOL] Supersedes the prior 2026-03-25T18:05Z validation note for this turn: the verified checks are `pnpm test --run src/components/Visualizer.test.tsx src/components/Minimap.test.tsx` (`2 files, 4 tests`), `pnpm build`, `pnpm exec vitest run src/components/Visualizer.test.tsx`, and `pnpm exec playwright test --list` (`12 tests in 4 files`); `pnpm test:e2e:smoke` was not rerun in this turn.
- 2026-03-25T18:20Z [TOOL] Prepared the workspace for handoff by recording the user’s commit request in continuity; commit creation is the next step and test execution remains UNCONFIRMED for any edits not already covered above.

## [PROGRESS]

- 2026-03-23T14:45Z [TOOL] Scaffolded correct clean architecture directories (`src/domain`, `src/services`, `src/engine`, `src/components`, `src/hooks`).
- 2026-03-23T14:45Z [TOOL] Configured path aliases (`@/*`) in `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts`.
- 2026-03-23T14:46Z [TOOL] Initialized Shadcn UI manually for Tailwind v4 and successfully downloaded common base components (button, card, slider, switch, scroll-area, sheet, table, dialog, dropdown-menu).
- 2026-03-25T18:05Z [USER] Requested fixes for the two `/review` findings covering Visualizer stopped-state seeking and Playwright server reuse in CI.

## [DISCOVERIES]

- 2026-03-23T14:46Z [TOOL] Shadcn CLI standard `init -d` fails with Tailwind v4 by default due to missing `tailwind.config.ts`. To resolve, `components.json` must be manually crafted with `"config": ""` and `"cssVariables": true`.
- 2026-03-25T17:00Z [TOOL] `playwright.config.ts` still uses `npm run dev -- --port 5173 --strictPort` even though the repository standard is pnpm; README now documents pnpm usage and flags the mismatch instead of hiding it.
- 2026-03-25T17:00Z [CODE] Runtime behavior is narrower than the product spec: uploads are persisted to IndexedDB, but the visible app has no library browser/reload flow and always loads `song.tracks[0]` for playback and rendering.
- 2026-03-25T17:00Z [CODE] `src/engine/constants.ts` fixes `STRING_COUNT = 6`, so the current renderer and synth setup are not yet dynamic for bass or extended-range instruments.
- 2026-03-25T17:15Z [TOOL] `pnpm exec playwright test --list` expands the suite to 114 tests across Chromium, Firefox, and WebKit, and a live run selected 9 workers on this 18-way machine.
- 2026-03-25T17:15Z [CODE] After upload, `src/components/Visualizer.tsx` and `src/components/Minimap.tsx` start `requestAnimationFrame` loops immediately; those loops call Tone APIs every frame before user activation, which reproduces repeated `AudioContext was not allowed to start` warnings under Playwright.
- 2026-03-25T17:52Z [CODE] The visualizer/minimap now gate `requestAnimationFrame` behind `Transport` state, and `usePlayback` pushes one-shot redraws on seek/pause/stop so idle states remain visually correct without continuous polling.
- 2026-03-25T18:05Z [CODE] `Visualizer` idle redraws must always read `Tone.getTransport().seconds`; `Transport.stop()` is already responsible for resetting that value to `0`, so branching on `"stopped"` inside the component drops valid seek positions.
- 2026-03-25T17:15Z [CODE] `tests/e2e/test-debug.spec.ts` is part of the default suite and forwards browser `console` events to Node stdout, so the repeated Tone warnings become high-volume terminal I/O during E2E runs.
- 2026-03-25T18:10Z [TOOL] The trimmed Chromium suite now uses 3 workers from the top-level Playwright config constant and keeps only two always-on screenshot anchors (`mobile-layout-320px.png`, `desktop-layout-1280px.png`).
- 2026-03-25T18:11Z [CODE] `useTransportStatus()` now has to tolerate mocked `Tone.getTransport()` objects without `on/off` methods because `src/components/Minimap.test.tsx` stubs transport with only `seconds`; guarding those listeners restored the unit suite without changing runtime behavior.
- 2026-03-25T18:06Z [CODE] The stopped-state seek regression in `src/components/Visualizer.tsx` was triggered by later redraws using a synthetic idle `0` instead of `Tone.Transport.seconds`; a rerender after seek reproduced it even without playback because `usePlayback.seek()` only updates the transport clock and draws once.
