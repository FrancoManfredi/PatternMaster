# Tasks: Fix Critical JD Findings — Round 2

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~35–55 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-chain |
| Chain strategy | size-exception |

```
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low
```

## Phase 1: Gitignore Fix

- [x] 1.1 PM-INFRA-01: Remove lines 24–25 (`/openspec/` and `/sdd/`) from `.gitignore`

## Phase 2: Category Ternary Fix

- [x] 2.1 PM-ARCH-01: Extract `CATEGORY_DISPLAY` constant before the component in `src/app/patterns/[slug]/PatternDetailClient.tsx` — map `CREACIONAL`→`{icon:"factory",label:"CREATIONAL"}`, `COMPORTAMIENTO`→`{icon:"route",label:"BEHAVIORAL"}`, `ESTRUCTURAL`→`{icon:"account_tree",label:"STRUCTURAL"}` (mirrors `CATEGORY_META` pattern from `CatalogCard.tsx`)
- [x] 2.2 PM-ARCH-01: Replace inline ternary on line 148–151 with `CATEGORY_DISPLAY[pattern.category]?.icon ?? "factory"`
- [x] 2.3 PM-ARCH-01: Replace inline ternary on line 212 with `CATEGORY_DISPLAY[pattern.category]?.label ?? "CREATIONAL"`

## Phase 3: ErrorBoundary Wiring

- [x] 3.1 PM-ARCH-02: Add `componentDidCatch(error: Error, errorInfo: React.ErrorInfo)` to `src/components/ErrorBoundary.tsx` that calls `console.error("ErrorBoundary caught:", error, errorInfo)`
- [x] 3.2 PM-ARCH-02: Import `ErrorBoundary` in `src/app/layout.tsx` and wrap `{children}` inside `<body>` (inside `ProgressProvider`)
- [x] 3.3 PM-ARCH-02: Import `ErrorBoundary` in `src/components/patterns/ExerciseSection.tsx` and wrap main render return

## Phase 4: Verification

- [x] 4.1 Verify `git status` shows `openspec/` and `sdd/` as untracked (not ignored)
- [x] 4.2 Verify all three categories render correct icon+label on pattern detail page
- [x] 4.3 Verify ErrorBoundary fallback UI appears when a child throws
