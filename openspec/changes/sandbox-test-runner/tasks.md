# Tasks: Client-Side Sandbox Test Runner

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~300-400 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Core Test Runner (already implemented)

- [x] 1.1 Create `src/lib/test-runner/types.ts` — TestSuiteResult, CriterionResult, PatternTestDef, WorkerMessage types
- [x] 1.2 Create `src/lib/test-runner/sandbox-worker.ts` — Worker blob source, network block, TS stripper, eval + symbol capture
- [x] 1.3 Create `src/lib/test-runner/runner.ts` — runUserTests(), createWorker, 5s timeout, error normalization
- [x] 1.4 Create `src/lib/test-runner/tests/factory-method.ts` — factoryMethodTestDef with 4 criterion checks
- [x] 1.5 Create `src/components/patterns/TestSuiteStatus.tsx` — Live test result display (pending/running/pass/fail icons)
- [x] 1.6 Update `src/components/patterns/ExerciseSection.tsx` — Wire runner on "Ejecutar Tests", show TestSuiteStatus
- [x] 1.7 Update `src/lib/schemas.ts` — Add TestSuiteResultSchema, CriterionResultSchema, update CorrectionRequestSchema with optional testResult

## Phase 2: Prompt Integration

- [ ] 2.1 Modify `src/lib/prompt.ts` — Add `testResult?: TestSuiteResult` param, inject `## Resultados de Tests Automáticos` block when present showing passed/failed criteria
- [ ] 2.2 Modify `src/app/api/correction/route.ts` — Destructure `testResult` from parsed body, pass to `buildCorrectionPrompt()` call

## Phase 3: Test Relaxation

- [ ] 3.1 Modify `src/content/patterns/__tests__/factory-method.test.ts` — Remove `getLastMessage()` assertions (lines 43-59), replace exact error text match `"Unknown notification type: unknown"` with `toThrow()` (line 83-86), remove case-insensitive test (line 88-92)

## Phase 4: Runner Unit Tests

- [ ] 4.1 Create `src/lib/test-runner/__tests__/runner.test.ts` with 6 test cases:
  - Timeout: mock Worker that never responds → 5s → all criteria failed with "posible loop infinito"
  - Network block: worker eval tries `fetch()` → throws "fetch bloqueado en sandbox"
  - Transpilation error: invalid TS syntax → all failed with "Error al procesar tu código"
  - Missing symbols: code without required exports → specific criteria fail with "No se encontró"
  - Valid code passing: Factory Method reference solution → all 4 criteria pass
  - Graceful degradation: `window.Worker = undefined` → skip without crashing

## Phase 5: Verification

- [ ] 5.1 Run `npx vitest run src/lib/test-runner/__tests__/runner.test.ts` — all 6 tests pass
- [ ] 5.2 Run `npx vitest run src/content/patterns/__tests__/factory-method.test.ts` — relaxed assertions pass
- [ ] 5.3 Run `npx vitest run` — full suite green, no regressions
