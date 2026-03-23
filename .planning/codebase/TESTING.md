# Testing Patterns

## Framework & Environment
- **Test Runner**: Vitest 4.1.1
- **Browser Environment**: `jsdom` (simulates browser environment in Node)
- **Component Testing**: `@testing-library/react` and `@testing-library/jest-dom` for DOM-based assertions.

## Test Organization
- **Location**: Tests should be co-located with the code they test (e.g., `Button.tsx` and `Button.test.tsx`).
- **File Extensions**: Use `.test.tsx` for component tests and `.test.ts` for logic/utility tests.

## Standards & Patterns
- **AAA Pattern**: Structure tests using Arrange, Act, and Assert.
- **Naming**: Use descriptive test names that explain the expected behavior.
- **Mocking**: Utilize `vi.mock()` for external dependencies (like `guitarpro-parser` or `tone`).

## Current State
- Infrastructure is established in `package.json` and `vite.config.ts`.
- No tests are currently implemented in the `src/` directory.
