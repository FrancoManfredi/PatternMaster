# Delta for exercise-correction

## MODIFIED Requirements

### Requirement: Correction Request Schema

The correction request MUST accept an optional `testResult` field of type `TestSuiteResult`. When present, the correction prompt SHOULD reference test outcomes to provide more targeted feedback. When absent, correction behavior is unchanged (LLM-only path).

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| With test results | `testResult` included in request | prompt built | prompt includes `## Resultados de Tests Automáticos` block with per-criterion pass/fail |
| Without test results | `testResult` omitted | prompt built | prompt built as before, no test results section |
| Invalid test results | malformed `testResult` | request validated | existing validation rejects or ignores the field without crashing |

(Previously: Correction request contained only `code`, `patternSlug`, and `language` — no test result context.)

### Requirement: Correction API Route

The API route at `/api/correction` MUST accept and forward `testResult` to the prompt builder without changing its existing validation behavior for other fields.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Forward test results | POST with `testResult` | route handler processes request | `testResult` passed to prompt builder unchanged |
| Backward compatible | POST without `testResult` | route handler processes request | existing behavior preserved, no regression |

(Previously: API route accepted only `code`, `patternSlug`, and `language`.)

## Note: Existing Test File

The existing `factory-method.test.ts` (Vitest, imports from `__solutions__`) is retained as a reference implementation. The NEW primary verification path for user-submitted code is the sandbox runner. The Vitest tests validate the reference solution; the sandbox runner validates user code at runtime.
