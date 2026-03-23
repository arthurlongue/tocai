---
phase: phase-01
plan: 05-gap
type: execute
wave: 4
gap_closure: true
depends_on: []
files_modified: [src/services/parser.ts, src/services/parser.worker.ts]
autonomous: true
---

<objective>
Fix DOMParser error during file upload by moving parsing back to the main thread. Web Workers do not have access to the DOMParser API which guitarpro-parser requires for GPX files.
</objective>

<execution_context>
@$HOME/.gemini/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@src/services/parser.ts
@src/services/parser.worker.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Move parsing to main thread</name>
  <files>src/services/parser.ts, src/services/parser.worker.ts</files>
  <action>
    1. Rewrite `parseFile` in `src/services/parser.ts` to directly import and use `parseTabFile` and `flattenSong`.
    2. Remove the Web Worker instantiation. The function should simply read the `arrayBuffer`, parse it, flatten it, and resolve the Promise.
    3. Delete `src/services/parser.worker.ts` as it's no longer viable without a DOMParser polyfill.
  </action>
  <verify>
    <automated>pnpm tsc -b</automated>
  </verify>
</task>

</tasks>
