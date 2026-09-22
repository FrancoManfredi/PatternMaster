# Exploration: fix-critical-jd-findings-round2

## Scope

Three critical findings from Judgment Day review of the PatternMaster codebase. All three are small, surgical fixes — no deep architecture exploration needed.

## PM-ARCH-01: Category ternary ignores ESTRUCTURAL

**Current state**

`src/app/patterns/[slug]/PatternDetailClient.tsx` line 212 (terminal header label):

```tsx
{pattern.category === "CREACIONAL" ? "CREATIONAL" : "BEHAVIORAL"}
```

The ternary only distinguishes CREACIONAL from everything else. Looking at the actual data, there are three categories: `CREACIONAL`, `ESTRUCTURAL`, `COMPORTAMIENTO` (confirmed in `SearchFilterBar.tsx` line 3 and `CatalogCard.tsx` lines 10–32). All ESTRUCTURAL patterns — adapter, bridge, composite, decorator, facade, flyweight, proxy — currently render as `BEHAVIORAL` in the terminal header.

**Related (not flagged)**: line 148 has the same binary-ternary pattern for icon choice:

```tsx
{pattern.category === "CREACIONAL" ? "factory" : "route"}
```

This is technically the same bug class, but the user only flagged line 212. Worth mentioning in proposal.

**Recommendation**: Replace the ternary with a complete mapping. Two clean options:

1. Inline ternary chain (smallest diff):
   ```tsx
   {pattern.category === "CREACIONAL"
     ? "CREATIONAL"
     : pattern.category === "ESTRUCTURAL"
     ? "STRUCTURAL"
     : "BEHAVIORAL"}
   ```
2. Extract a `CATEGORY_DISPLAY` constant (mirrors `CATEGORY_META` in `CatalogCard.tsx`). More maintainable — single source of truth for category → display string.

**Affected files**
- `src/app/patterns/[slug]/PatternDetailClient.tsx` (line 212 — required; line 148 — related)

**Risks / edge cases**
- The category type in `PatternContent` (`src/content/index.ts` line 27) is currently `string`, not a union. The ternary doesn't enforce exhaustiveness. If a new category is ever added, it will silently fall through to `BEHAVIORAL`. Consider tightening the type to `"CREACIONAL" | "ESTRUCTURAL" | "COMPORTAMIENTO"` as a follow-up.
- No tests cover the terminal header label. Existing tests in `PatternCard.test.tsx` and `ExerciseSection.test.tsx` only assert `categoryLabel` (the Spanish display string), not the English terminal label.

---

## PM-ARCH-02: ErrorBoundary exists but is never wired in

**Current state**

- `src/components/ErrorBoundary.tsx` (45 lines) is a complete class component with `getDerivedStateFromError` and a default fallback UI. It is a `.tsx` `"use client"` component.
- A `grep` across `src/` for `ErrorBoundary` returns **only one match** — the class declaration in its own file. Zero imports, zero usages.
- `src/app/layout.tsx` wraps children only with `ProgressProvider` (line 41). No error boundary anywhere in the tree.
- `ExerciseSection.tsx` is the highest-risk component: it runs user code in a sandbox, manages `AbortController`, async test runs, and dynamic imports — all classic crash surfaces. It is not currently protected.

**What needs to change**

1. **Wire ErrorBoundary into `layout.tsx`** — wrap `<ProgressProvider>`'s children so any unhandled render error in the entire app surfaces the fallback instead of taking down the page. Next.js App Router's own `error.tsx` is an alternative for route-segment errors, but the class-component ErrorBoundary gives consistent client-side recovery and is the existing solution.
2. **Wire ErrorBoundary into `ExerciseSection.tsx`** — wrap the exercise body so a crash in the test-runner / sandbox code doesn't kill the rest of the page. This is the highest-leverage placement.
3. **Add `componentDidCatch`** — the current implementation has no error logging. Add it so crashes are observable (at minimum `console.error`; could pipe to a logger if one is added later).

**Affected files**
- `src/app/layout.tsx` — add `<ErrorBoundary>` wrap
- `src/components/patterns/ExerciseSection.tsx` — add `<ErrorBoundary>` wrap
- `src/components/ErrorBoundary.tsx` — add `componentDidCatch` lifecycle

**Risks / edge cases**
- Next.js App Router: the root `layout.tsx` is a Server Component. `ErrorBoundary.tsx` is a Client Component (`"use client"`). This is fine — Client Components can be used inside Server Components. No compatibility issue.
- The AGENTS.md notes "This is NOT the Next.js you know" — recommend the implementer skim `node_modules/next/dist/docs/` before wiring, but the change itself is vanilla React + standard Next.js client/server interop, not a new Next.js API.
- `ErrorBoundary` is a class component. It does not catch: errors inside event handlers, async code, server-side rendering, or errors in the boundary itself. This is React's standard limitation. Document the boundaries if needed.
- Wrapping `ExerciseSection` may catch errors that the existing `errorMessage` state was meant to surface. Check if `ExerciseSection` has its own `try/catch` flow before wrapping — if it does, the boundary catches the **unhandled** case, which is the actual goal.

---

## PM-INFRA-01: .gitignore excludes design docs and spec history

**Current state**

`.gitignore` lines 23–25:

```
# project docs and specs
/openspec/
/sdd/
```

Both directories contain valuable, hand-written design artifacts:

- `openspec/changes/` — 13 change directories, each with `proposal.md`, `design.md`, `tasks.md`, and `specs/`. Examples: `catalogo-patrones`, `patrones-estructurales`, `patrones-comportamiento`, `guided-mode`, `sandbox-test-runner`, `fix-corrector-terminology`, etc.
- `openspec/specs/` — 2 spec directories (`pattern-exercise-tests`, `sandbox-test-runner`) — the **delta specs** that represent the project's agreed-upon capabilities.
- `sdd/explore/` — 3 exploration documents (`coding-exercise-tests`, `correction-prompt-terminology`, `suggestion-validation-gate`).

All of this is currently untracked. The team's design history is invisible to git, which means no diffing, no blame, no PR review on design decisions. The `.gitignore` comment "# project docs and specs" suggests the original author meant to ignore build artifacts and confused these directories with generated content. They are not.

**Recommendation**: Remove both lines (`/openspec/` and `/sdd/`) and the comment header. Verify with `git status` after the change to confirm the directories start tracking. No new files to add — git will pick them up automatically.

**Affected files**
- `.gitignore` (lines 23–25) — remove

**Risks / edge cases**
- This is a one-line content change, but it has a **large blast radius** in terms of files now entering version control. Run `git status` and `git diff --cached --stat` to review the staged file count before committing.
- If the team prefers, a more conservative approach: keep ignoring the build/cache outputs under those dirs (e.g. `openspec/**/node_modules/`) but track the markdown. Currently neither dir contains build artifacts — they are pure design docs — so a blanket un-ignore is safe.
- If a `.openspec.yaml` or similar config has been auto-generated, double-check before tracking. None observed in the directory listing.

---

## Cross-cutting observations

- **Tests**: none of the three fixes require new tests, but adding a test for the terminal header label (PM-ARCH-01) is a small win — locks in the correct mapping against future category additions.
- **Project convention**: `CatalogCard.tsx` already solves the category-to-display mapping problem correctly (lines 10–32). PM-ARCH-01's fix should match that style for consistency. Consider extracting a shared `CATEGORY_DISPLAY` constant if doing the cleanup.
- **No Next.js API risk**: All three fixes are framework-agnostic. The AGENTS.md warning about "This is NOT the Next.js you know" doesn't apply here.

## Ready for Proposal

**Yes.** All three issues are well-scoped, low-risk, and have clear fix shapes. Recommend:

1. PM-ARCH-01 → trivial code change, no spec impact
2. PM-ARCH-02 → small wire-up + `componentDidCatch` add; no behavior change for happy path
3. PM-INFRA-01 → one-line `.gitignore` change with a large but safe `git add` follow-up

The orchestrator can move directly to `sdd-propose` with confidence. No further exploration needed.
