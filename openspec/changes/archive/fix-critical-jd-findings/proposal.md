# Proposal: Fix Critical Judgment Day Findings

## Intent

Fix 2 CRITICAL bugs confirmed by Judgment Day dual review that break visual rendering on the home page and inflate user progress. The bugs impact core UX: pattern cards for 5 CREACIONAL patterns render without accent colors, and exercises are marked complete regardless of actual score.

## Scope

### In Scope
- Fix **PatternCard.tsx**: Replace dynamic-template Tailwind classes with inline styles
- Fix **ExerciseSection.tsx**: Gate `markCompleted()` on `totalScore >= 5`
- Verify CREACIONAL cards render cyan accent colors
- Verify progress only advances on passing submissions

### Out of Scope
- Redesigning PatternCard or ExerciseSection UI
- Changing Tailwind config or build pipeline
- Modifying other components with dynamic Tailwind classes
- Changing the `/api/correction` response schema

## Capabilities

> This section is the CONTRACT between proposal and specs phases.

### New Capabilities
None — bug fixes restore intended behavior.

### Modified Capabilities
None — no spec-level behavior change. These are implementation bugs where components deviate from their intended contract.

## Approach

### Fix 1 — PatternCard.tsx: Inline styles for dynamic colors
Tailwind v4 JIT requires complete static class strings. Template literals like `text-${accentColor}` never generate CSS. CatalogCard.tsx already solves this: map accentColor to a CSS custom property (`--accent-color`), use `hexToRgba()` for alpha variants, apply all color-dependent attributes via inline `style`. Replace ~12 dynamic class occurrences across watermark, gradient overlay, category badge, title, progress bar, and action button.

### Fix 2 — ExerciseSection.tsx: Score gate
On line 76–78, the `data.success` check calls `markCompleted(exerciseId)` unconditionally. Extract `totalScore` from `data.result` (already typed as `CorrectionResult` with `totalScore: number 0–10`). Only call `markCompleted` when `totalScore >= 5`. Below threshold, show feedback without marking complete.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/components/ui/PatternCard.tsx` | Modified | Inline styles replace dynamic Tailwind classes |
| `src/components/patterns/ExerciseSection.tsx` | Modified | Score threshold gate before `markCompleted` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Inline styles don't visually match current Tailwind | Low | Use same hex values; verify both accentColor variants (info-cyan, primary) |
| Score threshold of 5 may be too strict/lenient | Low | 5/10 is standard passing; schema validates 0–10 range |

## Rollback Plan
`git revert` the single commit. Both fixes are isolated 1-file changes with no shared state.

## Dependencies
None. Self-contained in their respective files.

## Success Criteria

- [ ] CREACIONAL pattern cards render with cyan accent, border tints, and hover effects
- [ ] Primary-accent cards unchanged (no regression)
- [ ] Score < 5 → exercise NOT marked complete; progress unchanged
- [ ] Score ≥ 5 → exercise marked complete; progress advances
