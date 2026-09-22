# Spec: Fix Critical JD Findings — Round 2

Three surgical bug fixes. No new capabilities.

---

## PM-ARCH-01: Category Ternary Bug

**Problem**: Lines 148 and 212 in `PatternDetailClient.tsx` use a ternary that only checks for CREACIONAL and COMPORTAMIENTO, silently defaulting ESTRUCTURAL to the wrong icon/label.

**Expected behavior after fix**:
- All three categories (CREACIONAL, COMPORTAMIENTO, ESTRUCTURAL) render correct icon and label
- Single source of truth via `CATEGORY_DISPLAY` constant

**Verification scenarios**:

**Scenario 1: ESTRUCTURAL pattern displays correctly**
- GIVEN a pattern with category="ESTRUCTURAL"
- WHEN the detail page renders
- THEN the correct ESTRUCTURAL icon and label appear (not the COMPORTAMIENTO fallback)

**Scenario 2: CREACIONAL pattern still works**
- GIVEN a pattern with category="CREACIONAL"
- WHEN the detail page renders
- THEN the correct CREACIONAL icon and label appear (no regression)

**Scenario 3: COMPORTAMIENTO pattern still works**
- GIVEN a pattern with category="COMPORTAMIENTO"
- WHEN the detail page renders
- THEN the correct COMPORTAMIENTO icon and label appear (no regression)

**Regression protection**:
- CREACIONAL and COMPORTAMIENTO rendering must remain identical
- No changes to pattern data fetching or other UI elements

---

## PM-ARCH-02: ErrorBoundary Orphaned

**Problem**: `ErrorBoundary.tsx` exists but is never imported or used. Missing `componentDidCatch` lifecycle method.

**Expected behavior after fix**:
- ErrorBoundary has `componentDidCatch(error, errorInfo)` that logs to console.error
- ErrorBoundary wraps `{children}` in `layout.tsx`
- ErrorBoundary wraps output in `ExerciseSection.tsx`
- Render errors show fallback UI instead of crashing the app

**Verification scenarios**:

**Scenario 1: Layout-level error caught**
- GIVEN a component inside layout.tsx throws during render
- WHEN the error occurs
- THEN ErrorBoundary displays fallback UI and logs error to console

**Scenario 2: Exercise-level error caught**
- GIVEN a component inside ExerciseSection throws during render
- WHEN the error occurs
- THEN ErrorBoundary displays fallback UI and logs error to console

**Scenario 3: Normal rendering unaffected**
- GIVEN no errors occur
- WHEN components render normally
- THEN ErrorBoundary is transparent (no visual or performance impact)

**Regression protection**:
- No changes to successful render paths
- No SSR/async error handling (out of scope)
- Layout structure and styling unchanged

---

## PM-INFRA-01: Design Docs Gitignored

**Problem**: `.gitignore` lines 24–25 exclude `/openspec/` and `/sdd/` from version control.

**Expected behavior after fix**:
- Lines 24–25 removed from `.gitignore`
- `openspec/` and `sdd/` directories are trackable by git
- `git status` shows these directories as untracked (if not yet added)

**Verification scenarios**:

**Scenario 1: Directories are no longer ignored**
- GIVEN the .gitignore fix is applied
- WHEN running `git status`
- THEN openspec/ and sdd/ appear as untracked (not ignored)

**Scenario 2: Other gitignore rules intact**
- GIVEN the .gitignore fix is applied
- WHEN checking other ignored paths (node_modules, .next, etc.)
- THEN they remain ignored (no regression)

**Regression protection**:
- No other .gitignore entries modified
- No changes to actual file contents in openspec/ or sdd/

---

## Out of Scope (Explicit)

- Union type refactor for category (separate concern)
- SSR/async error handling (React limitation)
- CatalogCard component changes
- Any feature additions or capability changes
