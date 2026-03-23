## [DECISIONS]

- 2026-03-23T00:00Z [USER] Documented pnpm as the package manager and BiomeJS as the lint/format tooling in the canonical project guidance.

## [OUTCOMES]

- 2026-03-23T00:00Z [TOOL] Updated `AGENTS.md` and `docs/ai-specs/02-architecture.md` so the tech stack documentation now includes pnpm and BiomeJS.

## [PROGRESS]

- 2026-03-23T14:45Z [TOOL] Scaffolded correct clean architecture directories (`src/domain`, `src/services`, `src/engine`, `src/components`, `src/hooks`).
- 2026-03-23T14:45Z [TOOL] Configured path aliases (`@/*`) in `tsconfig.json`, `tsconfig.app.json`, and `vite.config.ts`.
- 2026-03-23T14:46Z [TOOL] Initialized Shadcn UI manually for Tailwind v4 and successfully downloaded common base components (button, card, slider, switch, scroll-area, sheet, table, dialog, dropdown-menu).

## [DISCOVERIES]

- 2026-03-23T14:46Z [TOOL] Shadcn CLI standard `init -d` fails with Tailwind v4 by default due to missing `tailwind.config.ts`. To resolve, `components.json` must be manually crafted with `"config": ""` and `"cssVariables": true`.