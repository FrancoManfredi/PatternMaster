# Tasks: suggestion-validation-gate

## Phase 1: Validator Core

- [x] 1.1 Create `src/lib/suggestion-validator.ts` with `validateSuggestions()` function
- [x] 1.2 Implement 5 checkable patterns (enum, validation, DI, comments, interface+implements)
- [x] 1.3 Implement soft vs hard pattern distinction (soft = flag-only, hard = strip)

## Phase 2: Schema & Wiring

- [x] 2.1 Add `InvalidSuggestionSchema` and `SuggestionValidationSchema` to `src/lib/schemas.ts`
- [x] 2.2 Wire validation gate in `src/app/api/correction/route.ts` (mock path)
- [x] 2.3 Wire validation gate in `src/app/api/correction/route.ts` (real Claude path)

## Phase 3: Tests

- [x] 3.1 Create `src/lib/__tests__/suggestion-validator.test.ts` — 8 tests covering all patterns
- [x] 3.2 Verify existing `mock-corrector.test.ts` still passes (no changes needed)

## Verification

- [x] 4.1 `npx vitest run` — all 79 tests pass
