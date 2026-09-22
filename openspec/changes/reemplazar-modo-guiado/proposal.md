# Proposal: Replace Guided Mode with Informational Walkthrough

## Intent

Current Guided Mode (`GuidedExerciseSection`) requires users to write code, verify each step via sandbox tests ("Verificar paso"), and reveal solutions when stuck. This creates friction: users must fight the editor instead of learning the pattern. The sandbox adds complexity (Web Worker, transpilation, criterion checks) for a pedagogical path that should be read-only. Replace it with a sequential informational walkthrough showing accumulated code with syntax highlighting — no editing, no verification.

## Scope

### In Scope
- Simplify `GuidedStep` data schema: remove `starterCode`, `check` (CriterionCheck); rename `solutionCode` → `code`
- Rewrite `GuidedExerciseSection` as read-only walkthrough with syntax-highlighted code blocks
- Simplify `GuidedStepState`: `"unread" | "current" | "read"` (was `"pending" | "active" | "completed" | "revealed"`)
- Add free navigation between steps (previous/next buttons, step sidebar)
- Repurpose existing `solutionCode` entries as the `code` field per step
- **Remove `guided-starters-verification.test.ts`** — tests behavior that no longer exists

### Out of Scope
- Modo Libre (editable editor, sandbox, TestSuiteStatus) — unchanged
- Factory Method exercise content (acceptance criteria, test definitions)
- `CriterionCheck` type (still used by Modo Libre sandbox)
- Pattern exercise test suite (`pattern-exercise-tests` spec)

## Capabilities

### New Capabilities
- `guided-walkthrough`: Read-only sequential walkthrough showing pedagogical explanation + accumulated code with syntax highlighting per step. User navigates freely between steps with no sandbox verification.

### Modified Capabilities
None — no existing guided-mode spec in `openspec/specs/`.

## Approach

Simplification by deletion. Remove ~200 lines of sandbox/verification/editor logic from `GuidedExerciseSection.tsx`, replace editable textarea with `highlightCode()` on static accumulated code. Keep the step sidebar layout and pedagogical text rendering intact.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/content/guided/factory-method.ts` | Modified | Simplify `GuidedStep` type; repurpose `solutionCode` → `code` |
| `src/components/patterns/GuidedExerciseSection.tsx` | Modified | Rewrite as read-only walkthrough |
| `src/content/guided/index.ts` | Modified | Update type exports |
| `src/lib/storage.ts` | Modified | Simplify `GuidedStepState` |
| `src/lib/test-runner/__tests__/guided-starters-verification.test.ts` | Removed | Tests step verification that no longer exists |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Breaking localStorage migration for existing guided progress | Low | Clear guided progress on schema mismatch; loss is cosmetic (step state resets) |
| Content authors expect `starterCode`/`check` fields | Low | Document new schema; all 4 factory-method steps already have verified `solutionCode` |

## Rollback Plan

Revert commit. All changes are isolated to 4 files + 1 deletion. No database migration, no API changes.

## Dependencies

None.

## Success Criteria

- [ ] Factory Method walkthrough shows 4 sequential steps with accumulated code
- [ ] Step sidebar allows free navigation (no lock icons)
- [ ] Code blocks are read-only with syntax highlighting (no textarea)
- [ ] "Verificar paso" and "Revelar solución" buttons are gone
- [ ] `guided-starters-verification.test.ts` is removed; `npm test` still passes
- [ ] Modo Libre toggle and sandbox tests unchanged
