# Proposal: Fix Critical JD Findings — Round 2

## Intent

Fix three critical defects from Judgment Day review that affect correctness and resilience:
1. Category ternary bugs silently mislabeling/misrepresenting ESTRUCTURAL patterns
2. Orphaned ErrorBoundary component — defined but never wired into the tree
3. Design docs excluded from version control by overly broad `.gitignore` rules

## Scope

### In Scope
- **PM-ARCH-01**: Fix category ternary chain in `PatternDetailClient.tsx` lines 148 and 212. Extract `CATEGORY_DISPLAY` constant (mirroring `CATEGORY_META` from `CatalogCard.tsx`) with complete CREACIONAL/COMPORTAMIENTO/ESTRUCTURAL mappings for icon and label.
- **PM-ARCH-02**: Add `componentDidCatch` with `console.error` logging to `ErrorBoundary.tsx`. Wire it into `src/app/layout.tsx` (wrapping `{children}`) and `ExerciseSection.tsx` (wrapping main render output).
- **PM-INFRA-01**: Remove `/openspec/` and `/sdd/` entries from `.gitignore`.

### Out of Scope
- Broad refactor to make `PatternContent.category` a union type (deferred)
- ErrorBoundary for SSR, event handlers, or async errors (React limitation — documented, not fixable here)
- CatalogCard.tsx changes (already correct)

## Capabilities

### New Capabilities
None — these are defect fixes, not new feature capabilities.

### Modified Capabilities
None — no spec-level requirement changes. The ErrorBoundary wiring introduces error-resilience behavior, but no existing specs define error-handling contracts.

## Approach

**PM-ARCH-01**: Extract shared `CATEGORY_DISPLAY` constant in a colocated file (or inline in `PatternDetailClient.tsx`) with a full three-way mapping: category → icon + label. Replace both inline ternaries (line 148–151 and line 212) with lookups.

**PM-ARCH-02**: Add `componentDidCatch(error, errorInfo)` that logs via `console.error`. Import `ErrorBoundary` in `layout.tsx` (server component imports client component — Next.js App Router pattern) wrapping `{children}`. Wrap `ExerciseSection` render return (inside its JSX). This gives full-tree and per-exercise isolation.

**PM-INFRA-01**: Delete lines 24–25 from `.gitignore`. No migration needed — these are hand-written docs, not build artifacts.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/app/patterns/[slug]/PatternDetailClient.tsx` | Modified | Replace two broken ternaries with CATEGORY_DISPLAY lookup |
| `src/components/ErrorBoundary.tsx` | Modified | Add componentDidCatch logging |
| `src/app/layout.tsx` | Modified | Import and wrap children in ErrorBoundary |
| `src/components/patterns/ExerciseSection.tsx` | Modified | Wrap render output in ErrorBoundary |
| `.gitignore` | Modified | Remove openspec/ and sdd/ ignore rules |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| ErrorBoundary gives false confidence — won't catch event/async/SSR errors | Medium | Document limitations in component JSDoc; this is React standard behavior |
| Layout wrapping could mask critical errors silently | Low | `componentDidCatch` logs to console; fallback UI is visible and distinct |
| Un-ignoring docs dirs exposes internal design history to consumers if repo is public | Low | Acceptable — design docs are educational content, not secrets |

## Rollback Plan

- Revert `.gitignore` to re-add the two lines
- Remove ErrorBoundary imports from layout and ExerciseSection
- Revert PatternDetailClient to original ternaries (git revert the commit)

## Dependencies

None. No external dependencies, no API changes, no migration steps.

## Success Criteria

- [ ] `pattern.category === "ESTRUCTURAL"` renders correct icon and label on detail page
- [ ] ErrorBoundary catches a deliberate render error in ExerciseSection and renders fallback UI
- [ ] ErrorBoundary catches a deliberate render error at layout level and renders fallback UI
- [ ] `git status` shows `openspec/` and `sdd/` as untracked (no longer ignored)
- [ ] All existing functionality unaffected (no visual regressions for CREACIONAL or COMPORTAMIENTO patterns)
