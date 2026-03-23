---
phase: 04
slug: integration-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.1 (unit) + Playwright (E2E) |
| **Config file** | `vite.config.ts` (Vitest built-in), `playwright.config.ts` (Wave 0) |
| **Quick run command** | `pnpm test --run src/components/TransportBar.test.ts` |
| **Full suite command** | `pnpm test --run && pnpm exec playwright test` |
| **Estimated runtime** | ~10 seconds (unit) + ~30 seconds (E2E) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test --run src/**/{TransportBar,Minimap}.test.ts`
- **After every plan wave:** Run `pnpm test --run && pnpm exec playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~40 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | INTEGRATION-01 | unit | `pnpm test --run src/components/TransportBar.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | INTEGRATION-02 | unit | `pnpm test --run src/hooks/useSpeedControl.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | INTEGRATION-03 | unit | `pnpm test --run src/components/Minimap.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | INTEGRATION-04 | visual | Manual UAT | N/A | N/A | ⬜ pending |
| 04-02-02 | 02 | 2 | INTEGRATION-04 | unit | `pnpm test --run src/styles/theme.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 3 | PERF-01 | E2E | `pnpm exec playwright test tests/e2e/responsive.spec.ts` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 3 | PERF-02 | E2E | `pnpm exec playwright test tests/e2e/smoke.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/TransportBar.test.tsx` — Transport bar component tests
- [ ] `src/components/Minimap.test.tsx` — Minimap component tests
- [ ] `src/hooks/useSpeedControl.test.ts` — Speed control hook tests
- [ ] `tests/e2e/smoke.spec.ts` — Basic E2E smoke test (upload → play → visualize)
- [ ] `tests/e2e/responsive.spec.ts` — Responsive breakpoint verification
- [ ] `playwright.config.ts` — Playwright configuration file
- [ ] `@playwright/test` — Install Playwright testing framework

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dark theme visual polish | INTEGRATION-04 | Subjective aesthetic judgment | 1. Run `pnpm run dev`. 2. Verify charcoal backgrounds (#1a1a1a, #252525) are applied. 3. Verify Rocksmith colors are used as accents. 4. Check contrast ratios feel appropriate. |
| Transport bar layout | INTEGRATION-01 | Visual layout verification | 1. Load a song. 2. Verify transport bar appears below visualizer. 3. Verify all controls are present (PLAY/PAUSE/STOP, seek, speed, track selector, volume). |
| Minimap interaction feel | INTEGRATION-03 | Subjective UX feel | 1. Click minimap to seek. 2. Drag to scrub. 3. Verify interaction feels responsive and intuitive. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
