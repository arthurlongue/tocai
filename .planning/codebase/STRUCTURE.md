# Codebase Structure

**Analysis Date:** 2025-03-24

## Directory Layout

```
tocai/
├── .planning/       # Agent planning and codebase maps
├── docs/            # AI specs and research documentation
│   ├── ai-specs/    # Technical requirements and designs
│   ├── guitarpro-parser/
│   └── tonejs/
├── public/          # Static assets (favicons, icons)
├── src/
│   ├── assets/      # Static images and SVGs
│   ├── components/  # React components
│   │   └── ui/      # Shared shadcn/ui base components
│   ├── domain/      # Pure business logic and types (Skeleton)
│   ├── engine/      # Canvas rendering engine (Skeleton)
│   ├── hooks/       # React custom hooks (Skeleton)
│   ├── lib/         # Common utilities (cn utility, etc.)
│   ├── services/    # External integrations (Skeleton)
│   ├── App.tsx      # Main Layout component
│   ├── main.tsx     # React application entry point
│   └── index.css    # Global Tailwind styles
├── biome.jsonc      # BiomeJS configuration
├── components.json  # Shadcn/ui configuration
├── package.json     # Project dependencies and scripts
└── vite.config.ts   # Vite build tool configuration
```

## Directory Purposes

**src/domain/:**
- Purpose: PURE domain logic, models, and math. Zero external dependencies.
- Contains: Types (`types.ts`), pitch/timing logic, and music theory models.
- Key files: `src/domain/types.ts` (Planned)

**src/services/:**
- Purpose: Integration point for external libraries.
- Contains: Parser service, Tone.js audio service, and storage service.
- Key files: `src/services/parser.ts`, `src/services/audio.ts`, `src/services/storage.ts` (Planned)

**src/engine/:**
- Purpose: Logic for rendering the guitar tab to the canvas.
- Contains: Main rendering loop, layout calculation, and canvas primitives.
- Key files: `src/engine/renderer.ts`, `src/engine/layout.ts` (Planned)

**src/components/:**
- Purpose: React UI components.
- Contains: Player, Track Mixer, Library, and generic UI elements.
- Key files: `src/App.tsx`, `src/components/ui/*.tsx`

**src/hooks/:**
- Purpose: React-specific glue for domain/services.
- Contains: Hooks for managing audio playback, engine lifecycle, and resizing.
- Key files: `src/hooks/useEngine.ts`, `src/hooks/usePlayback.ts` (Planned)

**docs/ai-specs/:**
- Purpose: High-level requirements and design documents.
- Contains: Product requirements, architecture specs, and technical designs.

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Standard React entry point.
- `src/App.tsx`: Main UI container and router.

**Configuration:**
- `package.json`: Main manifest.
- `vite.config.ts`: Vite configuration.
- `biome.jsonc`: Linting and formatting rules.
- `components.json`: Shadcn/ui registry config.

**Core Logic:**
- `src/domain/`: Business logic.
- `src/services/`: Integration logic.
- `src/engine/`: Rendering logic.

**Testing:**
- `*.test.ts(x)`: Vitest files, colocated with the implementation (Planned).

## Naming Conventions

**Files:**
- React components: PascalCase (e.g., `Button.tsx`).
- Logic/Services: camelCase (e.g., `parser.ts`).
- Tests: `[filename].test.ts(x)`.

**Directories:**
- Kebab-case or all lowercase (e.g., `ai-specs`, `services`).

## Where to Add New Code

**New Feature (e.g., File Upload):**
- UI: `src/components/`
- Integration: `src/services/storage.ts` or `src/services/parser.ts`
- State/Logic: `src/domain/` or `src/App.tsx`

**New Canvas Rendering Step:**
- Math/Layout: `src/engine/layout.ts`
- Drawing: `src/engine/renderer.ts` or `src/engine/primitives.ts`

**New Hook:**
- Glue logic: `src/hooks/`

## Special Directories

**.planning/:**
- Purpose: Contains agent-generated plans and codebase mapping.
- Committed: Yes.

**src/components/ui/:**
- Purpose: Shadcn/ui core components, generally not modified unless for theme changes.
- Committed: Yes.

---

*Structure analysis: 2025-03-24*
