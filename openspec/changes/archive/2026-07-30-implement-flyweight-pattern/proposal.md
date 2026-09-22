# Proposal: Implement Flyweight Pattern

## Intent

Flyweight is a structural pattern missing **all** exercise infrastructure: no reference solution, no Vitest tests, no sandbox test definition, no registry entry, and no guided mode. `flyweight.json` is complete with 4 acceptance criteria. This change fills every gap, bringing Flyweight to parity with composite (most recent complete pattern).

## Scope

### In Scope
- **Reference solution**: `__solutions__/flyweight.ts` implementing 4 acceptance criteria (CharacterFlyweight interface, ConcreteCharacter with intrinsic state, CharacterFactory with pool, Document with extrinsic positions)
- **Vitest tests**: `__tests__/flyweight.test.ts` — behavioral tests per AC + negative tests + content-shape validation
- **Sandbox test definition**: `lib/test-runner/tests/flyweight.ts` — 4 criterion checks verifying behavior, not implementation
- **Registry entry**: add `flyweight` lazy-import to `lib/test-runner/registry.ts`
- **Guided mode**: `content/guided/flyweight.ts` — 4 progressive steps with `buildGuidedExercise`
- **Guided index**: add `flyweightGuided` import + map entry to `content/guided/index.ts`

### Out of Scope
- Editing `flyweight.json` (already complete with 4 ACs, starter code, theory, exercise)
- New capability specs (uses existing `pattern-exercise-tests` and `sandbox-test-runner`)

## Capabilities

### New Capabilities
- None — this uses existing test infrastructure.

### Modified Capabilities
- **pattern-exercise-tests**: adding Flyweight reference solution and behavioral test suite
- **sandbox-test-runner**: adding Flyweight test definition + registry entry

## Approach

Mirror the `composite` pattern exactly: `__solutions__` → `__tests__` → sandbox test def → registry → guided mode → guided index. Flyweight uses `abstract class` for `CharacterFlyweight` (not `interface`) because Sucrase strips interfaces at runtime — same reason as Bridge and Composite. The factory pool uses `Map<string, CharacterFlyweight>` keyed by `char-font-size-color`. The Document stores `{ flyweight, x, y }` tuples as extrinsic state.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/content/patterns/__solutions__/flyweight.ts` | New | Reference solution: CharacterFlyweight abstract class, ConcreteCharacter, CharacterFactory, Document |
| `src/content/patterns/__tests__/flyweight.test.ts` | New | Vitest behavioral tests with negative tests + content-shape validation |
| `src/lib/test-runner/tests/flyweight.ts` | New | Serializable criterion checks for sandbox Worker |
| `src/lib/test-runner/registry.ts` | Modified | Add `flyweight` lazy-import entry |
| `src/content/guided/flyweight.ts` | New | 4-step guided exercise using `buildGuidedExercise` |
| `src/content/guided/index.ts` | Modified | Add `flyweightGuided` import + map entry |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `Map` key collision edge case (different params produce same key) | Low | Key uses delimited concatenation `char-font-size-color` with hyphens — no ambiguity with realistic font/size/color values |
| `abstract class` not available in JS-only mode | Low | Guided mode provides JS fallback with `throw Error("Implement...")` — same precedent as bridge/composite |
| Pool growth unbounded if users create flyweights with unique params | Low | Flyweight's purpose is shared state; our solution demonstrates the pattern — production hardening is out of scope |

## Rollback Plan

Remove the 5 new files, revert the 2 modified files (registry.ts and guided/index.ts). Zero data migration, zero config changes.

## Dependencies

- `composite` pattern as implementation template (complete)
- `buildGuidedExercise` from `@/lib/guided-mode/build` (existing)
- `sandbox-test-runner` spec (existing capability)

## Success Criteria

- [ ] `npx vitest run` passes all flyweight tests (behavioral + content-shape)
- [ ] `npx tsc --noEmit` compiles with zero errors
- [ ] 4 sandbox criterion checks load via registry and verify behavior (not implementation)
- [ ] All 5 new files + 2 edits follow composite pattern conventions exactly
