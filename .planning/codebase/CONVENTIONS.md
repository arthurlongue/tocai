# Coding Conventions

**Analysis Date:** 2025-05-14

## Naming Patterns

**Files:**
- PascalCase for React components: `src/components/ui/button.tsx`
- camelCase for hooks: `src/hooks/use-mobile.tsx`
- camelCase for utilities and services: `src/lib/utils.ts`
- kebab-case for directory names: `src/components/ui/`

**Functions:**
- Verb-noun pattern: `fetchData`, `calculateSimilarity`
- PascalCase for React components: `function Button(...) { ... }`
- camelCase for helper functions and hooks: `function cn(...) { ... }`

**Variables:**
- camelCase for local variables and constants: `const isUserAuthenticated = true`
- UPPER_SNAKE_CASE for global constants or configuration values (if applicable)
- Descriptive names preferred over short ones: `marketSearchQuery` instead of `q`

**Types:**
- PascalCase for Interfaces and Types: `interface ButtonProps { ... }`
- No prefix (like `I` or `T`): `interface Market` instead of `IMarket`

## Code Style

**Formatting:**
- [Biome](https://biomejs.dev/) is used for formatting.
- Key settings (from `biome.jsonc`):
  - Indent style: `tab`
  - Quote style: `double`
  - Organize imports: `on`

**Linting:**
- [Biome](https://biomejs.dev/) is used for linting.
- Rules: `recommended: true` enabled in `biome.jsonc`.

## Import Organization

**Order:**
1. React and third-party libraries (e.g., `import * as React from "react"`)
2. Framework-specific libraries (e.g., `import { cva } from "class-variance-authority"`)
3. Internal modules with path aliases (e.g., `import { cn } from "@/lib/utils"`)
4. Relative imports (e.g., `import { Button } from "./button"`)

**Path Aliases:**
- `@/*` maps to `src/*` (configured in `tsconfig.json` and `vite.config.ts`)

## Error Handling

**Patterns:**
- Use `try/catch` blocks for asynchronous operations.
- Prefer comprehensive error handling that logs errors and provides meaningful feedback or re-throws specialized errors.
- Schema validation with `zod` is recommended for external data/API inputs (seen in `coding-standards` document).

## Logging

**Framework:** `console`

**Patterns:**
- Log errors in `catch` blocks: `console.error('Fetch failed:', error)`
- Avoid leaving `console.log` in production-ready code.

## Comments

**When to Comment:**
- Explain **WHY** a piece of code exists, not **WHAT** it does.
- Document complex algorithms or performance-critical hacks.
- JSDoc is recommended for public APIs and complex functions.

**JSDoc/TSDoc:**
- Used to describe parameters, return values, and examples for exported functions.

## Function Design

**Size:**
- Keep functions small and focused (ideally < 50 lines).
- Split complex logic into smaller, reusable helpers.

**Parameters:**
- Use object destructuring for functions with more than 2-3 parameters.
- Provide default values where sensible.

**Return Values:**
- Use explicit return types for better type safety.
- Return early to avoid deep nesting (guard clauses).

## Module Design

**Exports:**
- Named exports are preferred for components and utilities to improve discoverability and refactoring.
- Default exports are used for entry points (like `App.tsx`) but should generally be avoided for internal components.
- Components in `src/components/ui/` use a pattern of defining the function and then exporting it at the bottom: `export { Button, buttonVariants }`.

**Barrel Files:**
- Guidelines recommend importing directly to optimize bundle size, but barrel files are sometimes used in component directories.

---

*Convention analysis: 2025-05-14*
