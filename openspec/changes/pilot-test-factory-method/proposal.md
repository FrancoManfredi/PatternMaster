# Proposal: Pilot Test for Factory Method Exercise

## Intent

Create automated behavioral tests for the Factory Method coding exercise to validate that a correct implementation meets all acceptance criteria. This is the pilot — after validating the approach, it will be replicated across all 22 design patterns. The current state has no automated verification of exercise correctness; the corrector relies purely on LLM judgment, with no spec-based contract for what "correct" means.

## Scope

### In Scope
- Reference solution module at `src/content/patterns/__solutions__/factory-method.ts`
- Behavioral Vitest test file at `src/content/patterns/__tests__/factory-method.test.ts`
- Content-shape validation test confirming `factory-method.json` has valid acceptance criteria

### Out of Scope
- Modifying the existing corrector (`app/api/correct/route.ts`)
- Building a sandbox execution runner for user submissions
- UI changes to the exercise page
- Creating a pattern-agnostic test runner (deferred to post-pilot)
- Tests for the other 21 patterns (pending pilot validation)

## Capabilities

### New Capabilities
- `pattern-exercise-tests`: Behavioral contract tests verifying a pattern exercise implementation against its acceptance criteria. Each pattern gets a reference solution and a spec-derived test file.

### Modified Capabilities
- None

## Approach

**Reference solution + behavioral tests**:

1. Reference solution implementing `Notification`, `EmailNotification`, `SMSNotification`, `PushNotification`, and `NotificationFactory`
2. Vitest tests importing the reference solution and asserting each criterion: factory returns correct types, `send()` is callable, `NotificationService` uses the factory
3. Lightweight content-shape test validating the JSON acceptance criteria structure

No infra changes needed — Vitest with jsdom is already configured. The `@/` path alias resolves correctly.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/content/patterns/__solutions__/factory-method.ts` | New | Reference solution implementing Factory Method |
| `src/content/patterns/__tests__/factory-method.test.ts` | New | Behavioral tests verifying acceptance criteria |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Test contracts may not generalize to other patterns | Low | Pilot validates approach before scaling; adjust contract design based on learnings |
| Known content bug: `exercise.fileName` = "Database_Factory.ts" but exercise is about notifications | Low | Tests read from exercise content, not the fileName field; no lock-in to incorrect filename |

## Rollback Plan

Delete the two new files. No other files are created or modified.

## Dependencies

- Vitest (already installed and configured)
- None external

## Success Criteria

- [ ] `factory-method.test.ts` passes against the reference solution
- [ ] Tests fail when any acceptance criterion is violated (negative validation)
- [ ] Content-shape test validates the JSON structure
- [ ] `npx vitest run` exits clean with zero failures
