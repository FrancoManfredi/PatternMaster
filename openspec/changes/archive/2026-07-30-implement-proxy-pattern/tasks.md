# Tasks: Implement Proxy Pattern

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

| Field | Value |
|-------|-------|
| Estimated changed lines | ~660 |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single PR (size-exception accepted) |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

## Phase 1: Reference Solution

- [x] 1.1 Create `src/content/patterns/__solutions__/proxy.ts` — `Image` abstract class, `HighResImage`, `ImageProxy` with lazy `display()`

## Phase 2: Vitest Tests

- [x] 2.1 Create `src/content/patterns/__tests__/proxy.test.ts` — 4 AC describe blocks + content-shape (proxy.json 4 entries, non-empty starterCode) + negative tests

## Phase 3: Sandbox Test Definition

- [x] 3.1 Create `src/lib/test-runner/tests/proxy.ts` — `proxyTestDef` with `expectedNamedExports`, 4 criterion checks (instanceof, lazy init, proxy transparency)
- [x] 3.2 Modify `src/lib/test-runner/registry.ts` — add `proxy: () => import("./tests/proxy").then((m) => m.proxyTestDef)`

## Phase 4: Guided Mode

- [x] 4.1 Create `src/content/guided/proxy.ts` — 4-step exercise via `buildGuidedExercise` (Image abstract class, HighResImage, ImageProxy lazy-init, gallery demo)
- [x] 4.2 Modify `src/content/guided/index.ts` — import `proxyGuided` + add `"proxy": proxyGuided` map entry
