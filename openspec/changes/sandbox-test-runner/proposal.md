# Proposal: Client-Side Sandbox Test Runner

## Intent

Replace the static "Test Suite Status" checklist (always "pending") with a deterministic sandbox runner that evaluates user code against per-pattern acceptance criteria in a Web Worker. Pass pass/fail results to the LLM correction prompt as context, improving correction accuracy.

## Scope

### In Scope
- `src/lib/test-runner/` — types, Worker blob, runner orchestration, factory-method test def
- `src/components/patterns/TestSuiteStatus.tsx` — live pass/fail per criterion
- `src/components/patterns/ExerciseSection.tsx` — wire sandbox runner + correction API in parallel
- `src/lib/schemas.ts` — `TestSuiteResultSchema`, optional `testResult` in `CorrectionRequestSchema`
- `src/app/api/correction/route.ts` — accept `testResult`, forward to prompt builder
- `src/lib/prompt.ts` — inject test results as structured context for LLM
- `src/content/patterns/__tests__/factory-method.test.ts` — relax over-specific assertions (no `getLastMessage()`, no exact error text)

### Out of Scope
- Runner definitions for remaining 21 patterns (factory-method pilot only)
- esbuild-wasm integration (V2)
- Non-TypeScript sandbox execution (LLM-only fallback for other languages)
- Fuzzy symbol matching, server-side sandboxing

## Capabilities

### New Capabilities
- `test-runner`: Client-side sandbox execution engine. Creates Web Workers with network APIs blocked, strips TS annotations via regex (V1), evaluates user code, extracts named exports, runs per-criterion behavioral checks, returns structured `TestSuiteResult` with pass/fail per criterion.

### Modified Capabilities
- `pattern-exercise-tests`: Relax Vitest reference-solution assertions — remove `getLastMessage()`, exact error text, and case-sensitivity checks. Sandbox runner validates behavior essential to the pattern, not implementation details.

## Approach

**Architecture**: Web Worker sandbox with inline blob source. Main thread orchestrates timeout (5s), termination, and error handling. Tests run INSIDE the worker (classes are not serializable). Communication via `postMessage({ type: "result"|"error" })`.

**TS stripper**: V1 regex removing: comments, interface/type declarations, `export`/`import`, visibility modifiers, `implements` clauses, parameter/return type annotations. Sufficient for simple exercise code; V2 upgrades to esbuild-wasm.

**LLM enrichment**: Test results injected as `## Resultados de Tests Automáticos` block in prompt, listing pass/fail per criterion with error messages.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/test-runner/*` | New | Types, Worker source, runner, test definitions |
| `src/components/patterns/TestSuiteStatus.tsx` | New | Live pass/fail checklist |
| `src/components/patterns/ExerciseSection.tsx` | Modify | Wire sandbox runner + correction API |
| `src/lib/schemas.ts` | Modify | Add `TestSuiteResultSchema` |
| `src/lib/prompt.ts` | Modify | Inject test results for LLM |
| `src/lib/test-runner/tests/factory-method.ts` | New | Serializable test def for FM |
| `src/content/patterns/__tests__/factory-method.test.ts` | Modify | Relax over-specific assertions |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| TS stripper regex breaks on edge cases | Medium | V1 targets simple exercise patterns; V2 upgrades to esbuild-wasm |
| Worker not available (old browser) | Low | Graceful fallback: all criteria → failed, LLM still works |
| User writes non-TS code | Low | Sandbox only runs for TS/JS; other languages use LLM-only path |

## Rollback Plan

Revert `ExerciseSection.tsx` changes, delete `test-runner/` directory, revert `schemas.ts`/`route.ts`/`prompt.ts`.

## Dependencies

- None external. Uses `Worker` API and dynamic `import()` for code splitting.

## Success Criteria

- [ ] "Ejecutar Tests" button updates TestSuiteStatus with pass/fail per criterion within 5s
- [ ] Factory Method exercise: correct solution → all 4 criteria pass
- [ ] Factory Method exercise: broken solution → relevant criteria fail with clear error messages
- [ ] LLM prompt includes test results as structured context when available
- [ ] Non-TS languages still work via LLM-only path (no regression)
- [ ] `npm run build` succeeds without TS errors in new files
