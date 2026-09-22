# Proposal: Suggestion Validation Gate

## Intent

Correction feedback (mock and LLM) contains suggestions that don't match the user's actual code — e.g., "usá tipos más específicos que strings" when the user already uses an enum. The terminology fix (#fix-corrector-terminology) fixed vocabulary, but mock templates are still static strings and the LLM cite-directive is a soft instruction. This gate validates suggestions against code before display.

## Scope

### In Scope
- `suggestion-validator.ts` — pure function that parses suggestions from feedback, checks each against code via regex, returns invalid suggestions + cleaned feedback
- Extend `CorrectionResultSchema` with optional `suggestionValidation` field
- Wire gate in correction route before returning response
- Tests for 5 checkable suggestion patterns

### Out of Scope
- UI badge for invalid suggestions (deferred)
- `totalScore` recomputation after stripping
- Hard-to-validate patterns (naming, style advice)
- AST-based analysis (reserved for v2)

## Capabilities

### New Capabilities
None

### Modified Capabilities
- `exercise-correction`: correction result now includes optional `suggestionValidation` metadata (array of `{snippet, reason}` for flagged suggestions)

## Approach

Create a pure validation function that:
1. Extracts suggestion-like sentences from `feedback` text (sentence-level split on `. ` or `)`)
2. Matches each against 5 known patterns using conservative keyword regex
3. Checks if the code already satisfies the suggestion (e.g., `enum|const` present → "tipos más específicos" is invalid)
4. Returns `{invalid: {snippet, reason}[], cleaned: string}`

Two patterns are **soft** (never strip, flag-only): "agregá comentarios" and "inyección de dependencias" — because regex can't reliably verify comment quality or DI depth. Three are **hard** (strip if code disproves them).

Wire into `route.ts` after `mockCorrect()` or `correctWithClaude()` returns — run validator, merge `suggestionValidation` into result.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/suggestion-validator.ts` | New | Pure validation function |
| `src/lib/schemas.ts` | Modified | Add `suggestionValidation` to `CorrectionResultSchema` |
| `src/app/api/correction/route.ts` | Modified | Call gate before response |
| `src/lib/__tests__/suggestion-validator.test.ts` | New | Unit tests for all patterns |
| `src/lib/__tests__/mock-corrector.test.ts` | Modified | Update assertions if feedback changes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Regex overreach (false positives) | Medium | 2 patterns are soft (flag-only); v1 is conservative |
| LLM phrasing doesn't match regex | Medium | Use keyword matching (`validación`, `null`, `edge`), not exact strings |
| Gate strips too much, feedback feels empty | Low | Invalid suggestions shown in audit trail; score unchanged |

## Rollback Plan

Revert `schemas.ts` and `route.ts`. Delete `suggestion-validator.ts`. Tests for validator removed automatically.

## Dependencies

- None (pure function, no external packages)

## Success Criteria

- [ ] Mock feedback "usá tipos más específicos que strings" stripped when code contains `enum` or `const`
- [ ] Mock feedback "agregá validación" stripped when code contains `throw` or `default`
- [ ] `suggestionValidation` appears in response with flagged snippets
- [ ] Existing tests pass; new validator tests cover 5 patterns
