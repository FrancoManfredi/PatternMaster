# Exploration: fix-jd-p1-p2-findings

**Date:** 2026-07-29
**Project:** `patternmaster` (Next.js 16.2.12, React 19.2.4, TypeScript 5)
**Scope:** 10 P1/P2 findings from Judgment Day review. All are surgical, low-risk fixes — no deep architecture exploration needed. Each is scoped below.

---

## Global context

**Repo layout (relevant subset):**

```
src/
├── app/
│   ├── api/                      # ⚠️ EMPTY (was src/app/api/correction/route.ts)
│   ├── globals.css               # PM-FE-04: scrollbar rule at line 117
│   ├── layout.tsx                # Renders <Header /> via ProgressProvider
│   ├── page.tsx                  # PM-FE-03: "Iniciar Sesión" line 65
│   ├── catalogo/                 # Catalog page (Header caller)
│   └── patterns/[slug]/
│       ├── page.tsx              # Server component, generateStaticParams
│       └── PatternDetailClient.tsx  # PM-FE-05: "Guardar patrón" line 56-63
├── components/
│   ├── ErrorBoundary.tsx         # ✓ already wired (round 2 fix)
│   ├── ProgressContext.tsx       # localStorage progress
│   ├── layout/Header.tsx         # PM-FE-03: dead /progress, /community links
│   ├── patterns/ExerciseSection.tsx  # PM-FE-01: hardcoded patternTestDefs
│   └── ui/
│       ├── PatternCard.tsx       # PM-FE-02: hexToRgba line 21
│       ├── CatalogCard.tsx       # PM-FE-02: hexToRgba line 40
│       └── ProgressBadge.tsx     # PM-FE-05: dead, 0 callers
├── content/
│   ├── index.ts                  # PM-CONTENT-02: starterCodeJS: string (line 59)
│   └── patterns/*.json           # PM-CONTENT-02: 24 of 25 missing starterCodeJS
├── lib/
│   ├── guided-mode/              # Part B check inputs
│   ├── js-starter.ts             # PM-FE-05: generateJSStarter, 0 callers
│   ├── storage.ts                # ProgressStore (working)
│   ├── test-runner/
│   │   ├── runner.ts             # PM-FE-02: private stripTS() at line 52
│   │   ├── sandbox-worker.ts     # createWorkerSource (used by checks.ts)
│   │   ├── types.ts              # PatternTestDef, TestSuiteResult
│   │   └── tests/                # PM-FE-07: console.log debug in 8 files
│   └── validate-pattern/
│       ├── checks.ts             # PM-FE-06: 623 lines, needs split
│       ├── validate-pattern.test.ts
│       └── validate-batch.test.ts
```

**Test files in `tests/`:**
- 10 total: abstract-factory, adapter, builder, chain-of-responsibility, decorator, facade, factory-method, singleton, strategy, template-method
- 8 of those have `[EVAL-TESTDEF-N]` console.log artifacts: **adapter, builder, chain-of-responsibility, decorator, factory-method, singleton, strategy, template-method** (8 files, ~77 instances)
- `abstract-factory.ts` and `facade.ts` are clean — confirms "8 test definition files" from the issue

**Env vars status:**
- `.env.local` has `MOCK_CORRECTOR=true` and `ANTHROPIC_API_KEY=`
- `process.env` reference search: **0 matches in `src/`** — only in `sdd/explore/suggestion-validation-gate/exploration.md` (historical reference to the removed `src/app/api/correction/route.ts`)
- The API route was removed but env vars remained. `.env.example` must document them anyway (forward-looking template)

**From round 2 (archived, already applied):**
- `openspec/changes/archive/2026-07-29-fix-critical-jd-findings-round2` exists — confirms our prior `ErrorBoundary`, category-ternary, and `.gitignore` work landed
- Prior exploration format/style to mirror: `sdd/fix-critical-jd-findings-round2/explore/exploration.md`

---

## PM-FE-01: Extract hardcoded `patternTestDefs` map (#6)

### Current state

`src/components/patterns/ExerciseSection.tsx` lines 93–130 (28 lines) define an inline `Record<string, () => Promise<unknown>>` literal with 9 entries mapping slug → dynamic import:

```
factory-method, singleton, decorator, strategy, builder,
adapter, chain-of-responsibility, template-method, abstract-factory
```

Each entry does `import("@/lib/test-runner/tests/<slug>").then((m) => m.<slug>TestDef)`. This is data, not behavior — it doesn't belong in a component. Adding a 10th pattern requires editing component internals. The `Record<string, () => Promise<unknown>>` is also loosely typed: `unknown` is forced to `as any` at the call site (line 134).

### Affected files

- `src/components/patterns/ExerciseSection.tsx` (lines 93–130 — replace with `import` + single call)
- `src/lib/test-runner/registry.ts` — **NEW**, exports `loadPatternTestDef(slug: string): Promise<PatternTestDef | null>` (or similar typed wrapper)

### Recommendation

Create `src/lib/test-runner/registry.ts` with a typed function:

```ts
import type { PatternTestDef } from "./types";

const TEST_DEF_LOADERS: Record<string, () => Promise<{ testDef: PatternTestDef }>> = {
  "factory-method": () => import("./tests/factory-method").then(m => ({ testDef: m.factoryMethodTestDef })),
  // ... 8 more
};

export async function loadPatternTestDef(slug: string): Promise<PatternTestDef | null> {
  const loader = TEST_DEF_LOADERS[slug];
  if (!loader) return null;
  const { testDef } = await loader();
  return testDef;
}
```

**Effort:** Low. **Risk:** Very low — pure refactor, behavior preserved. Each loader still runs in `ExerciseSection.handleRunTests`, just in a module the component imports from.

---

## PM-FE-02: Dedupe `stripTS()` and `hexToRgba()` (#7)

### Current state

**`stripTS` is duplicated in two files with identical 4-step implementation:**
- `src/lib/test-runner/runner.ts` line 52 — `function stripTS(code: string): string` (private, no `export`)
- `src/lib/validate-pattern/checks.ts` line 22 — `export function stripTS(code: string): string` (public)

The `checks.ts` version has the warning comment: `/** Replicates runner.ts stripTS exactly — MUST match the production code */`. This is fragile: any drift between the two copies silently breaks validation. Note: `src/lib/test-runner/__tests__/stripper.test.ts` has its own local `stripTypes` helper (with `["typescript", "imports"]` — different transform set), so it tests something separate and is **not affected** by this dedupe.

**`hexToRgba` is duplicated in two component files with overlapping but different color maps:**

- `src/components/ui/PatternCard.tsx` lines 21–31 — maps `var(--color-info-cyan)` → `#22d3ee`, `var(--color-primary)` → `#bef264`
- `src/components/ui/CatalogCard.tsx` lines 40–53 — maps `var(--color-primary)` → `#bef264`, `var(--color-secondary)` → `#5de6ff`, `var(--color-tertiary-fixed-dim)` → `#ffb95f`

Same regex/slice logic (`hex.slice(1,3)` etc.), different lookup tables.

### Affected files

- `src/lib/transforms.ts` — **NEW** (or could be `src/lib/strip-ts.ts`), exports `stripTS`
- `src/lib/colors.ts` — **NEW**, exports `hexToRgba(hex, alpha)` + a `VAR_COLOR_HEX` map
- `src/lib/test-runner/runner.ts` — import `stripTS` from `transforms.ts`, remove local copy
- `src/lib/validate-pattern/checks.ts` — import `stripTS` from `transforms.ts`, remove local copy
- `src/components/ui/PatternCard.tsx` — import `hexToRgba` from `colors.ts`, remove local
- `src/components/ui/CatalogCard.tsx` — import `hexToRgba` from `colors.ts`, remove local

### Approaches

1. **Single module per concern** (recommended)
   - Pros: One canonical location per utility; easy to find; trivial to test
   - Cons: New files (`transforms.ts`, `colors.ts`) — but they belong in `src/lib/`
   - Effort: Low

2. **Extend `src/lib/syntax-highlight.ts`** to also export these
   - Pros: One less file
   - Cons: Mixes syntax highlighting with code transformation and color math — bad cohesion. `syntax-highlight.ts` is a leaf util, the others would be cross-cutting.

### Recommendation

Approach 1. `transforms.ts` and `colors.ts` are clear, single-purpose modules. The `checks.ts` comment warning "MUST match" disappears — that's the win.

**Effort:** Low. **Risk:** Low — `stripTS` semantics are preserved by single source of truth; the 4 regex lines are character-for-character identical between the two current copies, so swapping one for the other is behavior-neutral.

---

## PM-FE-03: Fix dead nav links and misleading "Iniciar Sesión" button (#8)

### Current state

**`src/components/layout/Header.tsx` lines 6–10:**
```tsx
const navItems = [
  { label: "Patrones", path: "/catalogo", activePath: "/catalogo" },
  { label: "Mi Progreso", path: "/progress", activePath: "/progress" },      // 404
  { label: "Comunidad", path: "/community", activePath: "/community" },      // 404
];
```
- `/progress` and `/community` are not registered in `app/` (no `progress/page.tsx` or `community/page.tsx`). Clicking them 404s.
- Header is rendered from 3 sites (HomePage, CatalogPageClient, PatternDetailClient) — affects every page.

**`src/app/page.tsx` line 65 — primary CTA:**
```tsx
<Link href="/catalogo" ...>
  <span>terminal</span>
  Iniciar Sesión
</Link>
```
- Button labeled "Iniciar Sesión" (Login) but routes to `/catalogo` (browse patterns). Misleading: users expect a login flow but get the catalog. No auth system exists.

**`Header.tsx` right side (lines 60–73):** has a `search` button and a `person` avatar icon, no text. The "Iniciar Sesión" issue is **only** on the home page hero.

### Affected files

- `src/components/layout/Header.tsx` — remove `/progress` and `/community` from `navItems`
- `src/app/page.tsx` — rename "Iniciar Sesión" CTA to something that matches its target (`/catalogo`)

### Approaches

1. **Remove the dead links from nav, rename the button** (recommended)
   - Keep `Patrones` only. Rename CTA to "Empezar Ahora" or "Explorar Patrones" (matches `/catalogo` intent).
   - Pros: Cleanest, no new routes needed
   - Cons: Loses a UI affordance that might be planned for later
2. **Add stub pages `/progress` and `/community`** (e.g. "Coming soon")
   - Pros: Preserves future intent
   - Cons: Adds non-functional pages — builds UI debt
3. **Add real progress/community pages**
   - Out of scope for a "fix findings" change; P1/P2 review is about cleanup

### Recommendation

Approach 1. The project has a working progress system via `ProgressContext` (localStorage) — there's no public `/progress` page to show it, and `/community` has no backing feature. Adding stubs is feature creep. Cleanest: just remove them. The button rename is one word.

**Effort:** Low. **Risk:** Low. Only caveat: the team may have intentionally added those nav slots as placeholders. If so, Approach 2 is better — but the prior round's findings (round 2) followed the same "delete dead code" philosophy, so this is consistent.

---

## PM-FE-04: Replace global `::-webkit-scrollbar { display: none }` (#10)

### Current state

`src/app/globals.css` lines 116–119:
```css
/* Scrollbar hide */
::-webkit-scrollbar {
  display: none;
}
```

This affects **every scrollable element** in the app. It hides Webkit scrollbars completely — a known accessibility/UX problem:
- **Keyboard-only users** can't tell if a region scrolls (no visible affordance)
- **Mouse users on Linux/Windows** lose scroll context
- The rule is also Webkit-only — Firefox ignores it (Firefox users get default scrollbars already, breaking visual consistency)
- The comment "Scrollbar hide" is honest about intent, but the chosen mechanism is wrong for a content app

### Affected files

- `src/app/globals.css` — replace lines 116–119 with a styled, accessible scrollbar

### Recommendation

Replace with a thin, themed scrollbar that matches the dark carbon surface aesthetic. Use both Webkit pseudo-elements and `scrollbar-color`/`scrollbar-width` for Firefox:

```css
/* Themed scrollbar — visible but unobtrusive */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: var(--color-surface-container-low, #0a0a0a);
}
::-webkit-scrollbar-thumb {
  background: var(--color-outline-variant, #444);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary, #bef264);
}
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-outline-variant, #444) var(--color-surface-container-low, #0a0a0a);
}
```

This uses CSS custom properties that already exist in the design system. Falls back gracefully.

**Effort:** Low. **Risk:** Low — cosmetic only. Verify on Firefox + Chrome.

---

## PM-FE-05: Remove dead code (#11)

### Current state

Three pieces of dead code, all confirmed via grep (zero callers):

1. **`src/components/ui/ProgressBadge.tsx`** (17 lines) — exports `ProgressBadge({ completed })`. Codegraph blast radius shows 0 callers. Was probably intended for PatternCard but never wired.

2. **`src/lib/js-starter.ts`** (25 lines) — exports `generateJSStarter(tsCode: string)`. Grep across `src/` finds 0 imports. The regexes strip TS type annotations via repeated `.replace()` calls. Likely a precursor to the `sucrase` `transforms: ["typescript"]` stripper now in `runner.ts` — both are dead-or-superseded. **Note:** the user explicitly calls this dead, so delete it (do NOT reuse for PM-CONTENT-02 — see below).

3. **"Guardar patrón" button** in `src/app/patterns/[slug]/PatternDetailClient.tsx` lines 56–63:
   ```tsx
   <button className="...">
     <span>bookmark</span>
     Guardar patrón
   </button>
   ```
   No `onClick`, no handler. Pure visual decoration that suggests a feature that doesn't exist.

### Affected files

- `src/components/ui/ProgressBadge.tsx` — **DELETE**
- `src/lib/js-starter.ts` — **DELETE**
- `src/app/patterns/[slug]/PatternDetailClient.tsx` — remove the button (lines 56–63) and its parent flex wrapper (lines 56–64)

### Recommendation

Delete all three. No tests depend on `ProgressBadge` (codegraph confirmed) or `generateJSStarter` (grep confirmed). The "Guardar patrón" button has no behavior to preserve.

**Effort:** Low. **Risk:** Very low.

**Important cross-impact on PM-CONTENT-02:**
- PM-FE-05 explicitly marks `generateJSStarter` as dead. If PM-CONTENT-02 were to "auto-generate JS starters for all 24 missing patterns", it could resurrect `generateJSStarter` to do the conversion. But the user has *also* called that function dead.
- Resolution: PM-CONTENT-02 must use **option A** (make `starterCodeJS?: string` optional). The `?? pattern.exercise.starterCode` fallback in `ExerciseSection.tsx` line 26 already handles the missing case. The dead function stays dead.

---

## PM-CONTENT-02: Make `starterCodeJS` optional in `PatternContent` (#12)

### Current state

- `src/content/index.ts` line 59: `starterCodeJS: string;` — required field.
- 25 pattern JSONs total. Only `factory-method.json` line 75 has the field. The other **24 are missing it** (verified by grep: `starterCodeJS` appears in exactly 1 file).
- All 25 are loaded via `as PatternContent` (lines 64–85) — TypeScript would normally flag the missing field, but the `as` cast bypasses the check. Runtime: the field is `undefined` for 24 patterns.
- `ExerciseSection.tsx` line 26 already handles this: `JavaScript: pattern.exercise.starterCodeJS ?? pattern.exercise.starterCode,` — nullish-coalescing falls back to TS code. The `???` works at runtime, but the type lies.

The user reported "at least `abstract-factory.json`, `bridge.json`" — confirmed: 24/25 patterns are affected (every one except `factory-method.json`).

### Approaches

1. **Make `starterCodeJS` optional** (`starterCodeJS?: string`) in the interface — **recommended**
   - Pros: One-line type fix. Matches existing runtime behavior. The `??` fallback already exists. Zero content changes needed.
   - Cons: Loses type enforcement that every pattern should have a JS starter. But this is enforcement of an aspirational standard, not actual data integrity.
2. **Add `starterCodeJS` to all 24 missing JSONs**
   - Pros: Strictly typed, every pattern has a JS variant
   - Cons: 24 manual edits. Would require either (a) running `generateJSStarter` (but PM-FE-05 deletes that), (b) hand-converting each TS starter to JS (error-prone, especially with type-parameterized code), or (c) shipping without a JS variant for many patterns (defeats the point). Also: JS starters may be pedagogically wrong (TS type annotations actually help the student).
3. **Delete the field entirely**
   - Pros: Simpler interface
   - Cons: The `factory-method.json` is the only pattern with a real JS starter (verified working with sandbox). Deleting the field would be a regression for the one pattern that does it right.

### Recommendation

Approach 1. Add `?` to the field declaration. The `ExerciseSection` fallback already works. No JSON edits. No `generateJSStarter` resurrection. `factory-method.json` keeps its JS variant for the one pattern that benefits from it.

**Effort:** Trivial. **Risk:** Very low. One-line interface change.

**Bonus cleanup:** `src/components/__tests__/factory-method.test.ts` line 131 asserts `exercise.starterCode is a non-empty string`. The test for `starterCodeJS` does not exist — that asymmetry is fine, since making it optional means no test should assume it.

---

## PM-FE-06: Split `validate-pattern/checks.ts` into Part A / Part B files (#13)

### Current state

`src/lib/validate-pattern/checks.ts` is **623 lines** (confirmed via line count — the issue says 623, real count matches). It bundles three concerns in one file:

- **Lines 22–31** — `stripTS` (will move to `transforms.ts` per PM-FE-02)
- **Lines 33–305** — Part A checks (A1–A7): sandbox worker, criteria syntax, stripTS, over-specification, self-validation, runner constants
- **Lines 307–570** — Part B checks (B1–B7): guided objective, vocabulary, truncation, computed new lines, step syntax, acceptance symbols
- **Lines 572–623** — Runner functions: `runPartAChecks`, `runPartBChecks`, `runPartAWithSolution`, `allPassed`

Imports section (lines 12–17):
```ts
import { transform } from "sucrase";                      // used by stripTS
import type { PatternTestDef } from "@/lib/test-runner/types";
import type { GuidedExercise, GuidedStep } from "@/lib/guided-mode/types";
import { createWorkerSource } from "@/lib/test-runner/sandbox-worker";
import { buildGuidedExercise } from "@/lib/guided-mode/build";
import type { PatternContent } from "@/content/index";
```

**Public API contract** — `src/lib/validate-pattern/validate-pattern.test.ts` and `validate-batch.test.ts` import from `./checks`:
- `runPartAChecks(testDef, solutionCode?)`
- `runPartBChecks(guided, content)`
- `runPartAWithSolution(testDef, solutionCode)`

### Approaches

1. **`checks.ts` becomes a barrel re-export** (recommended)
   - Move implementation into `part-a-sandbox.ts` and `part-b-guided.ts`
   - Keep `checks.ts` as ~10 lines: `export * from "./part-a-sandbox"; export * from "./part-b-guided";`
   - Pros: Zero test changes, zero import changes anywhere else. The barrel file signals "this is the public API".
   - Cons: Adds one more file (3 instead of 1). But the *purpose* of `checks.ts` becomes clearer — it's the entry point, not the implementation.
2. **Update all imports** to point to `part-a-sandbox.ts` / `part-b-guided.ts` directly
   - Pros: No barrel
   - Cons: 2 test files need import updates. If a third caller is added later, they have to know which file. Loses cohesion.
3. **Subdirectory** `validate-pattern/checks/part-a-sandbox.ts` + `validate-pattern/checks/part-b-guided.ts`
   - Pros: Cleaner grouping
   - Cons: Deeper paths, more friction. Same file count as approach 1.

### Recommendation

Approach 1. Surgical, preserves every call site, no test changes. The `stripTS` move (PM-FE-02) is independent and should be done first — after that move, `checks.ts` has zero `sucrase` import; it's purely checks.

**Execution order matters:**
1. PM-FE-02 first: move `stripTS` to `transforms.ts`. Both `runner.ts` and `checks.ts` import from there. After this, `checks.ts` no longer has its own `sucrase` import.
2. PM-FE-06 second: split `checks.ts` into `part-a-sandbox.ts` + `part-b-guided.ts`, with `checks.ts` as barrel.

**Effort:** Low-Medium. **Risk:** Low — barrel preserves API exactly. Verify both test files still pass after.

---

## PM-FE-07: Remove `console.log("[EVAL-TESTDEF-N]...")` debug artifacts (#14)

### Current state

**8 test definition files** in `src/lib/test-runner/tests/` contain debug `console.log` calls tagged with `[EVAL-TESTDEF-N]` (where N is the criterion index 0–4):

| File | Lines | Count |
|---|---|---|
| `template-method.ts` | 41, 42, 45, 49, 86, 108, 127, 146 | 8 |
| `strategy.ts` | 47, 48, 51, 55, 58, 60, 72, 78, 90, 96, 108, 114, 119 | 11 |
| `singleton.ts` | 36, 37, 43, 55, 58, 70, 74, 87, 92 | 8 |
| `factory-method.ts` | 48, 49, 52, 53, 57, 60, 62 | 7 |
| `decorator.ts` | 44, 45, 49, 67, 68, 88, 89, 104, 107, 111, 115 | 9 |
| `chain-of-responsibility.ts` | 44, 45, 55, 60, 73, 79, 87, 100, 106, 114, 132, 138, 148, 152, 156 | 14 |
| `builder.ts` | 38, 43, 72, 83, 92, 99, 110, 119, 126, 137, 148, 156, 158 | 12 |
| `adapter.ts` | 44, 58, 69, 86, 97, 114, 125, 144 | 8 |

(`facade.ts` and `abstract-factory.ts` are clean.)

**Total:** ~84 calls. They run inside the sandboxed worker code path (tests are evaluated in `new Function` context) — wait, no, let me re-check this. The test definition functions are imported and run in `ExerciseSection.handleRunTests` via `runUserTests`, which executes them in a Web Worker. The `console.log` calls thus fire inside the worker, surfacing in the worker's console (visible in dev tools). They're real noise in the developer's console during "Run Tests".

Each line is a diagnostic print of intermediate state — `requiredExports`, `instance`, `result` values, etc. None affect the test outcome (they're after the assert/check, not gating). Pure noise.

### Affected files

All 8 listed in the table above.

### Approaches

1. **Delete all 84 `console.log` lines** (recommended)
   - Pros: Clean. No new test infrastructure.
   - Cons: Loses debug traces for future development. If a regression appears, developer must re-add.
2. **Replace with a gated debug helper** (`if (DEBUG) console.log(...)`)
   - Pros: Preserves traces behind a flag
   - Cons: Over-engineered for what is clearly throwaway debug code. The `[EVAL-TESTDEF-N]` prefix signals these were instrumented for a specific evaluation pass and never cleaned up.
3. **Convert to `if (failed) console.error(...)`** for the relevant values
   - Pros: Useful diagnostics only on failure
   - Cons: More code; still noise; the original logs are not gated to failures.

### Recommendation

Approach 1. The `[EVAL-TESTDEF-N]` prefix is the smoking gun: a developer instrumented a one-time evaluation run, then never cleaned up. A proper debug system, if needed later, should be a deliberate addition — not preservation of these.

**Effort:** Low. **Risk:** None. Lines can be deleted verbatim.

---

## PM-CONTENT-03: Customize `README.md` from boilerplate (#15)

### Current state

`README.md` (36 lines) is the unmodified `create-next-app` template:
- Line 1: "This is a [Next.js](https://nextjs.org) project bootstrapped with `create-next-app`..."
- Standard "Getting Started", "Learn More", "Deploy on Vercel" sections
- No mention of: PatternMaster purpose, the actual tech stack (Sucrase, Zod, Anthropic SDK), the 25 patterns, the guided mode, the sandbox test runner, project structure, contributing guide

The project *is* a real, opinionated product: a Spanish-language learning app for design patterns with sandbox execution and AI feedback. The README does not reflect this — a new contributor would be misled.

### Affected files

- `README.md` (root) — full rewrite, 36 lines → ~100-150 lines of project-specific docs

### Recommendation

Replace with a project-specific README containing:

1. **Title + one-line description**: "PatternMaster — Aprende, practica y recibí feedback de IA sobre patrones de diseño"
2. **Stack section**: Next.js 16.2.12, React 19, TypeScript 5, Tailwind v4, Sucrase (sandbox), Zod (schemas), Anthropic SDK (corrector), Vitest
3. **Quick start**: `npm install && npm run dev` → `http://localhost:3000`
4. **Available scripts** (from `package.json`): `dev`, `build`, `start`, `lint`, `test`, `test:watch`
5. **Project structure**: brief overview of `src/app`, `src/components`, `src/content/patterns`, `src/lib/test-runner`, `src/lib/validate-pattern`
6. **How to add a pattern**: link to the JSON schema location + a one-paragraph recipe
7. **Sandbox test runner**: short note that the free mode runs user code in a Web Worker via Sucrase
8. **Environment variables**: link to `.env.example` (the new file from PM-CONTENT-04)
9. **License / Contributing** (or "Private project" if no license)

Keep it in English (the project default for technical artifacts; the user did not request Spanish). UI copy remains in Spanish as it is throughout the app.

**Effort:** Medium. **Risk:** None — docs only. No code changes.

---

## PM-CONTENT-04: Create `.env.example` with documented env vars (#16)

### Current state

- `.env.local` exists (2 lines): `MOCK_CORRECTOR=true` and `ANTHROPIC_API_KEY=`
- `.env.example` does not exist (confirmed `Test-Path` returns False)
- No code in `src/` references `process.env.MOCK_CORRECTOR` or `process.env.ANTHROPIC_API_KEY` (grep returned 0 matches)
- A prior exploration (`sdd/explore/suggestion-validation-gate/exploration.md` line 21) references a now-removed route `src/app/api/correction/route.ts` that did read `process.env.MOCK_CORRECTOR`

**Implication:** the env vars are **forward-looking**. The API route that consumed them was removed (the `app/api/` directory is empty), but the `.env.local` was not cleaned up. A new contributor cloning the repo has no template to follow.

### Affected files

- `.env.example` (root) — **CREATE** (does not exist)

### Recommendation

Create `.env.example` with the two documented vars + a brief comment block:

```bash
# ─── PatternMaster Environment Configuration ─────────────────────
# Copy this file to `.env.local` and fill in real values.
# Never commit `.env.local` — it is gitignored.

# ─── Corrector API ────────────────────────────────────────────────
# When `true`, the corrector endpoint returns a deterministic mock
# response (no LLM call). When `false` or unset, the corrector calls
# the Anthropic API using ANTHROPIC_API_KEY.
# Note: the /api/correction route is currently in development. These
# variables are reserved for it; current code paths do not read them.
MOCK_CORRECTOR=true

# ─── Anthropic (Claude) ──────────────────────────────────────────
# API key for the Anthropic SDK. Required when MOCK_CORRECTOR is not
# "true". Get one at https://console.anthropic.com/.
ANTHROPIC_API_KEY=
```

The note about "current code paths do not read them" is **important** — do not lie about the system. As the corrector API is rebuilt, the `.env.example` becomes the canonical reference for which vars matter.

**Effort:** Trivial. **Risk:** None.

---

## Cross-cutting observations

### Dependency / execution order

The 10 fixes are mostly independent, but two have a sequencing constraint:

1. **PM-FE-02 must precede PM-FE-06**: dedupe `stripTS` first (so both files import the canonical version), then split `checks.ts`. Otherwise `part-a-sandbox.ts` would inherit a still-duplicated `stripTS`.
2. **PM-FE-05 and PM-CONTENT-02 are linked**: PM-FE-05 deletes `generateJSStarter` (the would-be tool for option B of PM-CONTENT-02). This forces PM-CONTENT-02 to use option A (make field optional). The two fixes are **consistent** — both remove a half-built feature in favor of the simpler design.

### Recommended execution order (lowest risk first)

1. PM-FE-04 (CSS only, no logic)
2. PM-FE-07 (delete log lines)
3. PM-FE-05 (delete dead code: ProgressBadge, js-starter.ts, "Guardar patrón")
4. PM-CONTENT-02 (make `starterCodeJS` optional — one-liner)
5. PM-FE-02 (dedupe `stripTS` and `hexToRgba`)
6. PM-FE-01 (extract `patternTestDefs` registry)
7. PM-FE-03 (header nav + Iniciar Sesión)
8. PM-FE-06 (split checks.ts — depends on PM-FE-02)
9. PM-CONTENT-03 (README)
10. PM-CONTENT-04 (.env.example)

### Test impact

- `validate-pattern.test.ts` and `validate-batch.test.ts`: **unaffected** if PM-FE-06 uses the barrel approach. Both import from `./checks`, the barrel re-exports from `part-a-sandbox` and `part-b-guided`.
- `__tests__/stripper.test.ts`: has its own local `stripTypes` (with `["typescript", "imports"]` — different from production). **Unaffected** by PM-FE-02.
- `__tests__/runner.test.ts` line 145–215: replicates `stripTS` logic locally for testing. **Unaffected** by PM-FE-02 (it's a test fixture, not a production import). Could optionally be cleaned to import the shared `stripTS` after the dedupe — but that's optional polish, not in scope.
- `src/components/__tests__/factory-method.test.ts` line 131: asserts `starterCode is non-empty`. **Unaffected** by PM-CONTENT-02 (the test doesn't check `starterCodeJS`).
- `ProgressBadge.test.tsx` / `js-starter.test.ts`: **do not exist** — no tests to break by deleting the files.

### `.gitignore` (not in this change but worth noting)

The prior round (round 2) identified that `/openspec/` and `/sdd/` are gitignored. If the team wants design history tracked, that fix is a follow-up. **Not in scope for this change** — flagging for awareness only.

### No Next.js API risk

None of the 10 fixes touch Next.js APIs (no `next/router`, no `next/image`, no route handlers, no `generateMetadata`, no Server Actions). The AGENTS.md warning about "This is NOT the Next.js you know" does not apply. `Header.tsx` and `page.tsx` are Client Components and stay Client Components.

### Project conventions to preserve

- **Module pattern**: `src/lib/` for shared utilities, `src/lib/test-runner/` for sandbox stuff, `src/lib/validate-pattern/` for checks. New `transforms.ts` and `colors.ts` should land in `src/lib/`.
- **Comments in Spanish** (the team writes in Spanish) vs. **code/identifiers in English** — for the new `transforms.ts` and `colors.ts`, JSDoc can be English (consistent with `runner.ts` and `storage.ts`).

---

## Ready for Proposal

**Yes.** All 10 issues are well-scoped, low-risk, and have clear fix shapes. No further exploration needed.

The orchestrator can move to `sdd-propose` and produce a single proposal with 10 task groups. Suggested proposal structure:

- **Group 1: CSS + log cleanup** (PM-FE-04, PM-FE-07) — cosmetic, no logic risk
- **Group 2: Dead code removal** (PM-FE-05) — mechanical deletes
- **Group 3: Type/content fix** (PM-CONTENT-02) — one-line interface
- **Group 4: Utility dedupe** (PM-FE-02) — `transforms.ts` + `colors.ts`
- **Group 5: Registry extraction** (PM-FE-01) — `test-runner/registry.ts`
- **Group 6: Header / Hero CTAs** (PM-FE-03) — UI text + nav items
- **Group 7: File split** (PM-FE-06) — barrel pattern, depends on Group 4
- **Group 8: Docs** (PM-CONTENT-03 README, PM-CONTENT-04 `.env.example`) — independent, can be done any time

The orchestrator should warn the user about Group 4 → Group 7 ordering (Group 4 must finish first), and the explicit PM-FE-05/PM-CONTENT-02 coupling (deleting `generateJSStarter` is intentional, not loss).
