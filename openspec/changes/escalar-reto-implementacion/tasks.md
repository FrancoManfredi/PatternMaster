# Tasks: Escalar Reto de Implementación — Batch 1

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350-450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (3 patterns × 3 artifacts + index + test update) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Medium

## Phase 1: Singleton (Creacional — Fácil)

- [ ] 1.1 Create `src/lib/test-runner/tests/singleton.ts` — PatternTestDef with 4 criteria: private constructor, `getInstance()` returns same instance, `get(key)` returns config value, config loaded once
- [ ] 1.2 Create `src/content/patterns/__solutions__/singleton.ts` — export `ConfigManager` class with private static instance, `getInstance()`, `get(key)`, `getAll()`, `reset()`
- [ ] 1.3 Create `src/content/guided/singleton.ts` — 3 steps (Fácil): step 0 problem+objective, step 1 private constructor + static instance, step 2 getInstance() + get()
- [ ] 1.4 Update `src/content/guided/index.ts` — import `singletonGuided` and register in `guidedExercises` map
- [ ] 1.5 Run validation: `npx vitest run src/lib/validate-pattern/validate-pattern.test.ts` — verify A6 self-validation + all B checks pass for singleton

## Phase 2: Decorator (Estructural — Intermedio)

- [ ] 2.1 Create `src/lib/test-runner/tests/decorator.ts` — PatternTestDef with 4 criteria: Beverage interface with `getCost()`+`getDescription()`, Espresso/HouseBlend concrete components, BeverageDecorator abstract class with wrapped reference, Milk/Mocha/Whip decorators
- [ ] 2.2 Create `src/content/patterns/__solutions__/decorator.ts` — export `Beverage` class, `Espresso`, `HouseBlend`, `BeverageDecorator`, `Milk`, `Mocha`, `Whip`
- [ ] 2.3 Create `src/content/guided/decorator.ts` — 3-4 steps (Medio): step 0 problem+objective, step 1 Beverage interface + concrete components, step 2 BeverageDecorator abstract class, step 3 Milk/Mocha/Whip decorators
- [ ] 2.4 Update `src/content/guided/index.ts` — import `decoratorGuided` and register in `guidedExercises` map
- [ ] 2.5 Run validation: `npx vitest run src/lib/validate-pattern/validate-pattern.test.ts` — verify A6 self-validation + all B checks pass for decorator

## Phase 3: Strategy (Comportamiento — Fácil)

- [ ] 3.1 Create `src/lib/test-runner/tests/strategy.ts` — PatternTestDef with 4 criteria: TaxStrategy interface, SpainTaxStrategy (21%), USTaxStrategy (7%), Order uses injected strategy
- [ ] 3.2 Create `src/content/patterns/__solutions__/strategy.ts` — export `TaxStrategy` class, `SpainTaxStrategy`, `USTaxStrategy`, `Order` class
- [ ] 3.3 Create `src/content/guided/strategy.ts` — 3 steps (Fácil): step 0 problem+objective, step 1 TaxStrategy interface + concrete strategies, step 2 Order with injected strategy
- [ ] 3.4 Update `src/content/guided/index.ts` — import `strategyGuided` and register in `guidedExercises` map
- [ ] 3.5 Run validation: `npx vitest run src/lib/validate-pattern/validate-pattern.test.ts` — verify A6 self-validation + all B checks pass for strategy

## Phase 4: Batch Validation

- [ ] 4.1 Update `src/lib/validate-pattern/validate-pattern.test.ts` — add describe blocks for singleton, decorator, strategy (import TestDefs, solutions, guided exercises, JSON content)
- [ ] 4.2 Run full validation suite: `npx vitest run src/lib/validate-pattern/validate-pattern.test.ts` — all 3 patterns must pass 100% Part A + Part B
- [ ] 4.3 Verify no regressions: factory-method validation still passes after adding new patterns
