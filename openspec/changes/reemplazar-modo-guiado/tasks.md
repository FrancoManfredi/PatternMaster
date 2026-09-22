# Tasks: Replace Guided Mode with Informational Walkthrough

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~560 (net: -260 deletions, +300 additions) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | N/A |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Schema + storage simplification | PR 1 | `npm test` | Navigate to Factory Method guided mode | `factory-method.ts`, `storage.ts`, `index.ts` |
| 2 | Component rewrite + test cleanup | PR 1 | `npm test` | Full guided walkthrough flow | `GuidedExerciseSection.tsx`, test file deletion |

## Phase 1: Data Schema Simplification

- [ ] 1.1 Modify `src/content/guided/factory-method.ts`: remove `import type { CriterionCheck }` (line 1)
- [ ] 1.2 Modify `src/content/guided/factory-method.ts`: simplify `GuidedStep` interface — remove `starterCode`, `check`; rename `solutionCode` → `code`
- [ ] 1.3 Modify `src/content/guided/factory-method.ts`: for each of the 4 steps, delete `starterCode` and `check` blocks; rename `solutionCode` to `code`
- [ ] 1.4 Verify: `factory-method.ts` exports `GuidedStep` with only `index`, `title`, `explanation`, `code`

## Phase 2: Storage Type Simplification

- [ ] 2.1 Modify `src/lib/storage.ts`: change `GuidedStepState` type from `"pending" | "active" | "completed" | "revealed"` to `"unread" | "current" | "read"` (line 52)
- [ ] 2.2 Modify `src/lib/storage.ts`: add legacy schema detection in `getGuidedStepProgress` — if saved values contain old keys (`pending`, `active`, `completed`, `revealed`), call `clearGuidedProgress` and return `{}`
- [ ] 2.3 Modify `src/lib/storage.ts`: simplify `clearGuidedProgress` — remove the `guided-code-${slug}` key scanning loop (no longer needed since we removed editable code)
- [ ] 2.4 Verify: `GuidedStepState` allows exactly 3 values; legacy detection clears old state

## Phase 3: Component Rewrite

- [ ] 3.1 Rewrite `src/components/patterns/GuidedExerciseSection.tsx`: remove all sandbox imports (`runUserTests`, `isSandboxSupported`), `useRef`, editor-related state (`stepResult`, `finalResult`, `currentCode`)
- [ ] 3.2 Rewrite step state initialization: use `getGuidedStepProgress` with new 3-state model; default step 0 = `"current"`, rest = `"unread"`
- [ ] 3.3 Implement step sidebar with state icons: unread (○), current (●), read (✓) — all clickable, no `cursor-not-allowed`
- [ ] 3.4 Implement step content area: "Paso X de N" badge, explanation text, read-only `<pre>` code block using `highlightCode()` with line numbers
- [ ] 3.5 Implement navigation: Previous/Next buttons at bottom; "Finalizar" on last step (no-op, no sandbox verification)
- [ ] 3.6 Implement "Clear progress" button in sidebar that calls `clearGuidedProgress` and resets state
- [ ] 3.7 Remove all "Verificar paso" and "Revelar solución" button logic
- [ ] 3.8 Verify: no `<textarea>` in guided mode; no sandbox imports; `Modo Libre` toggle still works in parent `ExerciseSection`

## Phase 4: Test Cleanup

- [ ] 4.1 Delete `src/lib/test-runner/__tests__/guided-starters-verification.test.ts`
- [ ] 4.2 Run `npm test` — verify all remaining tests pass with no failures

## Phase 5: Integration Verification

- [ ] 5.1 Manual: Factory Method guided walkthrough shows 4 steps with accumulated code
- [ ] 5.2 Manual: step sidebar allows free navigation (no locks)
- [ ] 5.3 Manual: code blocks are read-only with syntax highlighting (no textarea)
- [ ] 5.4 Manual: "Verificar paso" and "Revelar solución" buttons are gone
- [ ] 5.5 Manual: Modo Libre toggle and sandbox tests unchanged
- [ ] 5.6 Manual: localStorage legacy detection works (old progress resets cleanly)
