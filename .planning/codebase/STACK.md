# Technology Stack

**Analysis Date:** 2024-03-23

## Languages

**Primary:**
- TypeScript 5.9.3 - Application logic, services, domain models, and React components.

**Secondary:**
- CSS (Tailwind 4.2.2) - Used for styling components across `src/index.css`, `src/App.css`.

## Runtime

**Environment:**
- Node.js (Development/Build)
- Modern Browser (Execution - requires Web Audio API support)

**Package Manager:**
- PNPM
- Lockfile: `pnpm-lock.yaml` present

## Frameworks

**Core:**
- React 19.2.4 - UI component library.
- Vite 8.0.1 - Build system and development server.
- Tailwind CSS 4.2.2 - Utility-first styling framework integrated via `@tailwindcss/vite`.

**Testing:**
- Vitest 4.1.1 - Test runner and assertion library.
- Testing Library React 16.3.2 - Component testing utilities.
- jsdom 29.0.1 - DOM simulation for tests.

**Build/Dev:**
- BiomeJS 2.4.8 - Formatting and linting (configured in `biome.jsonc`).
- TypeScript 5.9.3 - Type checking and transpilation.

## Key Dependencies

**Critical:**
- `tone` 15.1.22 - Handles Web Audio API interaction, playback timing (Transport), and synthesis.
- `guitarpro-parser` 1.2.0 - Core logic for parsing binary `.gp`, `.gpx`, and `.gp5` files into JSON data structures.

**Infrastructure:**
- `localforage` 1.10.0 - Persistence layer for storing parsed song data in browser IndexedDB.
- `radix-ui` 1.4.3 - Accessible UI primitives used for standard components (Dialog, Slider, Switch, etc.).
- `lucide-react` 1.0.1 - Icon library for the user interface.
- `clsx` & `tailwind-merge` - Utility functions for dynamic class name construction.

## Configuration

**Environment:**
- Standard Vite environment configuration via `.env` files.

**Build:**
- `vite.config.ts` - Plugin configuration for React and Tailwind.
- `tsconfig.json` - TypeScript compiler options and path aliases (`@/*` -> `./src/*`).
- `biome.jsonc` - Linting and formatting rules.

## Platform Requirements

**Development:**
- Node.js and PNPM installed.

**Production:**
- Static site hosting (Vite build output).
- Requires browser support for Web Audio API and IndexedDB.

---

*Stack analysis: 2024-03-23*
