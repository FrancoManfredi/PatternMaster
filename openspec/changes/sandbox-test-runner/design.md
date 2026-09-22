# Design: Client-Side Sandbox Test Runner

## Technical Approach

Web Worker sandbox evaluates user TypeScript code client-side. Main thread orchestrates blob Worker creation, 5s timeout with `worker.terminate()`, and structured result handling. V1 uses a regex TypeScript stripper; V2 upgrades to esbuild-wasm. Tests run entirely inside the worker because class constructors aren't serializable via `postMessage`.

## Architecture Decisions

| Decision | Choice | Alternatives Rejected | Rationale |
|----------|--------|----------------------|-----------|
| Sandbox mechanism | Web Worker blob | iframe, server-side VM | Workers provide thread isolation; iframes can't be created inside workers; server-side adds latency |
| Network blocking | Override fetch/XHR/WebSocket/importScripts in worker | CSP, service worker | Direct override is reliable inside worker scope; CSP doesn't block fetch from worker |
| Timeout | 5s `worker.terminate()` | None | Prevents infinite loops from hanging UI; educational context justifies hard limit |
| Transpilation | Regex TS stripper | esbuild-wasm (V2) | Sufficient for simple exercise patterns; V2 adds esbuild-wasm for edge cases |
| Symbol extraction | Same-scope eval after user code | AST parsing | Classes aren't serializable; same-scope eval captures constructor references |
| Test format | Serializable `PatternTestDef` with JS check strings | Jest/Vitest in worker | Jest requires DOM/node APIs; our format is zero-dependency and serializable |
| Symbol matching | Exact name, case-sensitive | Fuzzy matching | Exercise explicitly names expected symbols; fuzzy adds complexity without value |

## Data Flow

```
User clicks "Ejecutar Tests"
  │
  ├─► ExerciseSection.tsx — dynamic import runner + test def
  │     │
  │     ├─► runner.ts — creates Blob Worker, posts {code, testDef}, starts 5s timer
  │     │     │
  │     │     ├─► sandbox-worker.ts (inside Worker)
  │     │     │     1. Block network APIs
  │     │     │     2. stripTypes(code) — regex TS→JS
  │     │     │     3. new Function(jsCode) — evaluate
  │     │     │     4. eval(symbolName) — extract exports
  │     │     │     5. For each criterion: new Function('exports','assert', check)
  │     │     │     6. postMessage({ type: "result", payload: TestSuiteResult })
  │     │     │
  │     │     └─► runner.ts — resolves promise with TestSuiteResult
  │     │
  │     └─► TestSuiteStatus.tsx — renders ✅/❌ per criterion
  │
  └─► Correction API (/api/correction) — POST with testResult
        │
        ├─► route.ts — forwards testResult to buildCorrectionPrompt
        ├─► prompt.ts — injects ## Resultados de Tests Automáticos block
        └─► Returns CorrectionResult → FeedbackPanel
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/test-runner/types.ts` | Create (exists) | `TestSuiteResult`, `PatternTestDef`, message types |
| `src/lib/test-runner/sandbox-worker.ts` | Create (exists) | Worker blob source, network block, TS strip, eval |
| `src/lib/test-runner/runner.ts` | Create (exists) | Worker orchestration, timeout, error normalization |
| `src/lib/test-runner/tests/factory-method.ts` | Create (exists) | `PatternTestDef` for Factory Method pilot |
| `src/lib/test-runner/__tests__/runner.test.ts` | Create | Unit tests: timeout, network block, valid/broken code |
| `src/lib/prompt.ts` | Modify | Accept optional `testResult`, inject structured block into prompt |
| `src/app/api/correction/route.ts` | Modify | Forward `testResult` to `buildCorrectionPrompt` |
| `src/content/patterns/__tests__/factory-method.test.ts` | Modify | Relax over-specific assertions (remove `getLastMessage()`, exact error text) |

## Interfaces / Contracts

```ts
// Prompt builder extension
export function buildCorrectionPrompt(params: {
  // ...existing params...
  testResult?: TestSuiteResult;
}): string;

// Runner API
export function runUserTests(
  code: string,
  testDef: PatternTestDef,
  options?: { timeoutMs?: number }
): Promise<TestSuiteResult>;

// Worker message protocol
type WorkerMessage =
  | { type: "result"; payload: TestSuiteResult }
  | { type: "error"; payload: string }
  | { type: "timeout" };
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Timeout handling | Worker that never responds → 5s → all criteria failed |
| Unit | Network blocked | Worker eval tries `fetch()` → throws before network request |
| Unit | Transpilation error | Invalid TS code → all failed with friendly error message |
| Unit | Missing symbols | Code without required exports → specific criteria fail with "No se encontró" |
| Unit | Valid code passing | Factory Method reference solution → all 4 criteria pass |
| Unit | Graceful degradation | Mock `window.Worker = undefined` → skip without crashing |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. The change is additive:
- New `test-runner/` directory is self-contained
- `ExerciseSection.tsx` already wires runner in `try/catch`; failure doesn't break the correction API path
- Non-TS languages use the existing LLM-only path (no regression)

## Open Questions

- [ ] Should the TS stripper handle generic default values more robustly (e.g., `private lastMessage: string = ""`)? Current regex removes the type annotation but preserves the default, which is correct for most cases.
- [ ] Should V2 esbuild-wasm be loaded from CDN or bundled? Decision deferred to the V2 design phase.
