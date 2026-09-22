# Tasks: Implement Flyweight Pattern

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~370 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Full Flyweight: solution, tests, sandbox, guided | PR 1 | `npx vitest run src/content/patterns/__tests__/flyweight.test.ts` | `npx tsc --noEmit && npx vitest run` | Revert 2 modified files (registry.ts, guided/index.ts) + delete 5 new files |

## Phase 1: Reference Solution

- [x] 1.1 Create `__solutions__/flyweight.ts` — `CharacterFlyweight` abstract class with `abstract render(x, y)`
- [x] 1.2 Implement `ConcreteCharacter` extending `CharacterFlyweight` with intrinsic state (`char`, `font`, `size`, `color`)
- [x] 1.3 Implement `CharacterFactory` with `Map<string, CharacterFlyweight>` pool, `getCharacter()`, and `getPoolSize()`
- [x] 1.4 Implement `Document` with extrinsic position tuples, internal factory, `addCharacter()`, and `render()` delegation

## Phase 2: Vitest Test Suite

- [x] 2.1 Create `__tests__/flyweight.test.ts` — 4 `describe` blocks per AC (instanceof hierarchy, factory reuse, distinct flyweights for diff params, Document render delegation)
- [x] 2.2 Add content-shape validation — `flyweight.json` has exactly 4 criteria, non-empty `starterCode`
- [x] 2.3 Add negative tests: missing pool reuse (factory creates new instance each call), missing extrinsic separation
- [x] 2.4 Verify all pass with `npx vitest run`

## Phase 3: Sandbox Test Definition

- [x] 3.1 Create `src/lib/test-runner/tests/flyweight.ts` exporting `flyweightTestDef` — `expectedNamedExports: ["CharacterFlyweight", "ConcreteCharacter", "CharacterFactory", "Document"]`
- [x] 3.2 Add 4 criterion checks with `exports`/`assert()`: flyweight instanceof, render execution, pool reference equality, document API
- [x] 3.3 Register lazy loader in `src/lib/test-runner/registry.ts`: `"flyweight": () => import("./tests/flyweight").then(m => m.flyweightTestDef)`

## Phase 4: Guided Exercise

- [x] 4.1 Create `src/content/guided/flyweight.ts` with `buildGuidedExercise` — 4 steps: (0) `CharacterFlyweight` abstract class, (1) `ConcreteCharacter` with intrinsic state, (2) `CharacterFactory` with pool reuse, (3) `Document` with extrinsic positions + demo showing pool reuse
- [x] 4.2 Register `flyweightGuided` import in `src/content/guided/index.ts` and add to `guidedExercises` record
