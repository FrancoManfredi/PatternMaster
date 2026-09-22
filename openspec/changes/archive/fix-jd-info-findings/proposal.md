# Proposal: Fix INFO Judgment Day Findings

## Intent

Fix 9 INFO-level bugs confirmed by Judgment Day review: conflicting CSS, dead UI elements, logic fall-through in mock corrector, missing error feedback, XSS vector, and weight mismatches. Non-blocking quality issues across 7 files.

## Scope

### In Scope
- **F1** — Remove conflicting `text-lg` from FeedbackPanel score display (line 63)
- **F2** — Map catch-block errors to correct error types in `/api/correction` route
- **F3** — Align mock-corrector scoring weights with rubric.ts (0.35, 0.30, 0.20, 0.15)
- **F4** — Wire "Iniciar Sesión" button to a placeholder `/login` Link
- **F5** — Surface API errors in ExerciseSection UI (state + banner)
- **F6** — Remove unused `accentColor` variable in PatternDetailClient
- **F7** — Add `hasClasses && !hasInterface` → "partial" branch in mock-corrector quality logic
- **F8** — Show `customLanguage` in badge when `language === "Otro"`
- **F9** — HTML-escape captured group in `renderBoldText` before `<strong>` wrapping

### Out of Scope
- Building a real `/login` page (F4 is a placeholder link only)
- Full i18n for error messages
- Re-designing the quality heuristic in mock-corrector beyond the missing branch

## Capabilities

### New Capabilities
None — bug fixes only.

### Modified Capabilities
None — no spec contract changes.

## Approach

Group fixes into three phases by nature:

**Phase 1 — Logic bugs** (F2, F3, F7): Fix error-type mapping in API catch block, align scoring weights, add missing quality branch.

**Phase 2 — Visual/UX** (F1, F4, F5, F6, F8): Remove conflicting class, wire dead button to placeholder link, add error banner state, delete dead code, fix language badge.

**Phase 3 — Security** (F9): Apply existing `escapeHtml` inside `renderBoldText` before wrapping `$1` in `<strong>`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/patterns/FeedbackPanel.tsx` | Modified | F1: remove `text-lg` |
| `src/app/api/correction/route.ts` | Modified | F2: error type mapping |
| `src/lib/mock-corrector.ts` | Modified | F3: weights + F7: quality branch |
| `src/app/page.tsx` | Modified | F4: wrap button in Link |
| `src/components/patterns/ExerciseSection.tsx` | Modified | F5: error state + F8: badge text |
| `src/app/patterns/[slug]/PatternDetailClient.tsx` | Modified | F6: remove dead variable |
| `src/lib/syntax-highlight.ts` | Modified | F9: escapeHtml in renderBoldText |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Error-type mapping creates false positives for unrelated exceptions | Low | Map only known error classes; fallback to generic |
| Placeholder `/login` link 404s for users who click it | Low | Add `cursor-pointer`; 404 is better than dead button |
| Score weight change shifts mock corrector results | Low | Existing tests validate totalScore output; re-run `npx vitest run` |

## Rollback Plan

`git revert` the single commit. All 9 fixes are independent 1-3 line changes with no shared state. Any fix can be selectively reverted.

## Dependencies

None. Self-contained in their respective files.

## Success Criteria

- [ ] All 38 existing tests pass (`npx vitest run`)
- [ ] TypeScript: 0 errors (`npx tsc --noEmit`)
- [ ] `text-3xl` renders without `text-lg` conflict in FeedbackPanel
- [ ] API errors produce correct error type (not always "timeout")
- [ ] Mock corrector scores use rubric-matched weights (0.35/0.30/0.20/0.15)
- [ ] "Iniciar Sesión" button navigates to `/login`
- [ ] ExerciseSection shows error banner on API failure
- [ ] `accentColor` removed from PatternDetailClient (no unused vars)
- [ ] Class-without-interface code gets "partial" quality, not "excellent"
- [ ] Language badge shows custom language name when "Otro" selected
- [ ] `renderBoldText` escapes HTML before strong-wrapping
