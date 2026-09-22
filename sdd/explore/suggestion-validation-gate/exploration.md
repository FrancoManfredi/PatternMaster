# Exploration: Suggestion Validation Gate for PatternMaster Corrector

**Topic:** Validate concrete suggestions in feedback against user code before returning
**Date:** 2026-07-26
**Project:** `patternmaster` (Next.js + TypeScript design-patterns learning app)

---

## 1. Current State

The correction system has **two entry points** that produce a `CorrectionResult`:

1. **Mock corrector** (`src/lib/mock-corrector.ts`) — pure-function template-based, no LLM
2. **Real Claude corrector** (`src/lib/claude.ts` → `correctWithClaude`) — LLM behind `buildCorrectionPrompt`

Both return the same `CorrectionResult` shape:
```ts
{ totalScore, criteria: { patternApplication, decoupling, naming, functionality }, feedback }
```

The route handler (`src/app/api/correction/route.ts`) selects mock vs. real via `process.env.MOCK_CORRECTOR === "true"`. Validation today is only at the request level (`CorrectionRequestSchema`); the **response trust is unconditional** — once the result is built, it goes straight to the client.

**The `feedback` string contains concrete, checkable suggestions** (e.g. "agregá validación para tipos de notificación no soportados") that are produced *without ever looking at the user's code beyond coarse `interface`/`class`/`comment` detection*. This is the gap to close.

---

## 2. Affected Areas

- `src/lib/mock-corrector.ts` — source of every suggestion in the mock path. Templates live in `PATTERN_TEMPLATES` and `GENERIC_FEEDBACK` (lines 11–143, 146–157).
- `src/lib/prompt.ts` — Claude prompt. Ends with a soft instruction "ANTES de sugerir un cambio, citá al menos una clase, método o variable concreta" (line 71). No structural enforcement.
- `src/lib/schemas.ts` — `CorrectionResultSchema` (line 19). Would need a new optional field to surface invalid suggestions.
- `src/app/api/correction/route.ts` — where the result is finalized and returned. Natural place for a post-correction gate.
- `src/lib/claude.ts` — `correctWithClaude` returns whatever the LLM produces. The gate must run on its output too.
- `src/lib/__tests__/mock-corrector.test.ts` — existing tests assert feedback *contains* strings (e.g. `expect(result.feedback).toContain("Creador")` on line 66). Some tests will need updating once we change the feedback content based on validation.

---

## 3. Complete Catalog of Suggestion Patterns

I extracted every concrete suggestion from all 13 feedback strings (5 quality levels × 3 template sets: factory-method, strategy, generic). Below, each suggestion is paired with the code check that would prove it valid or invalid.

### A. Structural-completeness suggestions (low/empty quality)

| # | Suggestion (exact text from mock) | Code check to validate |
|---|---|---|
| 1 | "definí la interfaz **Producto**" / "definí la **Interfaz Strategy**" | `code` does NOT contain `interface \w+` ⇒ suggestion is **valid** (still missing). |
| 2 | "implementá al menos un **Producto Concreto**" / "**Estrategia Concreta**" | `code` does NOT contain `class \w+ implements` ⇒ suggestion is **valid**. |
| 3 | "conectá todo" / "integración con el **Creador**" | If interface AND classes exist but no usage of the class in another class, suggestion is **valid**. |

### B. Naming / style suggestions (good quality)

| # | Suggestion | Code check |
|---|---|---|
| 4 | "unificá el estilo de nomenclatura" | Hard to validate mechanically. **Skip or downgrade to "soft".** Heuristic: count PascalCase vs camelCase inconsistency, but this is unreliable. |
| 5 | "agregá comentarios que expliquen las decisiones de diseño" | `code` does NOT match `/\/\//` and `/\/\*/` ⇒ valid. Already partially detected by `analyzeCode().hasComments`. |

### C. Robustness / edge-case suggestions (good + excellent quality)

These are the **most checkable** and the highest-value targets:

| # | Suggestion (verbatim) | Code check to validate |
|---|---|---|
| 6 | "considerá bordes (edge cases) como tipos de notificación no soportados" (factory-method, good) | Validate the code has a default branch / `throw new Error("Unknown")` / exhaustive `switch` covering "unsupported" cases. **Invalid** if a default branch already exists. |
| 7 | "considerá bordes (edge cases) como estrategias nulas" (strategy, good) | Validate null-handling: `code` contains `=== null`, `??`, `?.`, or `if (!strategy)` ⇒ **invalid** (already handled). |
| 8 | "agregá validación en el **Creador** para manejar tipos de notificación no soportados" (factory-method, excellent) | Same family as #6 — check for `throw`, `Error`, or `default:` in the factory's `create()`. |
| 9 | "agregá validación en el **Contexto** para manejar estrategias nulas" (strategy, excellent) | Same family as #7 — check the Context class for null guards. |
| 10 | "agregá validación para manejar casos nulos" (generic excellent) | Generic version of #7/#9. |
| 11 | "usá tipos más específicos que strings genéricos para los parámetros de configuración" (all excellent variants) | Check that function parameters of the *factory/create* method are NOT `type: string`. Look for: parameter declarations containing `: string` next to `create`, `build`, `notify`, or any factory-like function. **Invalid** if those params are already unions, enums, or branded types. |

### D. Architecture suggestions (excellent, decoupling)

| # | Suggestion | Code check |
|---|---|---|
| 12 | "Se podría mejorar usando inyección de dependencias" (factory-method, strategy, generic — excellent.decoupling) | Check for constructor with `private` modifier + parameter typed as the interface (e.g. `constructor(private factory: NotificationFactory)`). If already present ⇒ **invalid** (already using DI). |

### Pattern taxonomy (recap)

Across all 13 templates, suggestions cluster into **four families** — only A, B, C-6/7/8/9/10, and D-12 are mechanically checkable. C-11 and B-4 need AST-level inspection (typescript compiler API) to validate reliably.

---

## 4. Code Detection: What `analyzeCode()` Sees Today vs. What We Need

### Today (`analyzeCode` in `src/lib/mock-corrector.ts`, lines 212–233)

```ts
lines, hasInterface, hasClasses, hasComments, quality
```

Detects only **presence/absence**. It cannot tell us "is null already handled" or "is DI already in use".

### What the gate would need to add

| Capability | Approximate mechanism | Effort |
|---|---|---|
| Count `interface \w+` declarations | Regex increment | Trivial |
| Count `class \w+` and `class \w+ implements \w+` | Regex increment | Trivial |
| Detect `class \w+ extends \w+` | Regex | Trivial |
| Detect factory method signature (method returning the interface) | AST or pattern: `createLogger\(\)\s*:\s*\w+` | Low |
| Detect null-handling patterns (`=== null`, `=== undefined`, `??`, `?.`, `if (!`, `throw new Error`) | Regex set | Low |
| Detect "default case" in switch / exhaustive handling | AST or regex `default\s*:` | Low–Med |
| Detect constructor DI (parameter with `private`/`readonly` + interface type) | Regex: `constructor\s*\([^)]*\b(private|readonly)\s+\w+` | Low |
| Detect string params in factory methods | Combine regexes: function name in `{create, build, notify, get, make}` + `: string` | Low–Med |
| Detect pattern-specific actors (Producto, Creador, Estrategia) | Use `getPatternGlossary()` (already exists) | Reuse |

**Recommendation:** build a `validateSuggestions(code, feedback, glossary)` function that returns a list of `InvalidSuggestion` objects. Keep regex-only for the first iteration; AST only if regex proves too noisy.

---

## 5. Architecture Recommendations: Where the Gate Lives

Two viable placements. **Recommend #1** for minimum risk and symmetric coverage.

### Option 1 — Post-correction gate in the route handler ✅

```
Claude OR mockCorrect → buildCorrectionResult()
                        ↓
              validateSuggestions(code, result, glossary)
                        ↓
              strip / mark invalid suggestions
                        ↓
                  NextResponse.json
```

**Pros:**
- Single source of truth, regardless of which corrector ran.
- Easy to A/B test by toggling the gate.
- Doesn't change mock/LLM contracts.
- All existing tests in `mock-corrector.test.ts` keep working if we keep the original `feedback` available and add a *new* field for the cleaned version.

**Cons:** the feedback that the corrector produced internally is mutated after the fact. Mitigate by keeping a `feedback.raw` field plus a `feedback.cleaned` field.

### Option 2 — Inline gate inside each corrector (mock + claude)

**Pros:** corrector owns its own validation.
**Cons:** duplicated logic in two places; tests diverge; harder to evolve. **Skip.**

### Module shape (proposed)

New file: `src/lib/suggestion-validator.ts`

```ts
// Pure function, no I/O.
export function validateSuggestions(params: {
  code: string;
  feedback: string;
  glossary?: PatternGlossary;
  patternSlug: string;
}): { invalid: InvalidSuggestion[]; cleanedFeedback: string }
```

Called from `src/app/api/correction/route.ts` right before the `NextResponse.json` on the success path.

---

## 6. Result Shape Impact

**Yes, we need to extend `CorrectionResultSchema`.** Current shape (line 19 of `schemas.ts`) is opinionated — `feedback` is a plain string. Two viable extensions:

### Option A — Add a sibling field (recommended)

```ts
export const CorrectionResultSchema = z.object({
  totalScore: z.number().min(0).max(10),
  criteria: z.object({ /* unchanged */ }),
  feedback: z.string(),
  suggestionValidation: z
    .object({
      invalidCount: z.number().int().min(0),
      invalid: z.array(z.object({
        snippet: z.string(),     // the sentence that was flagged
        reason: z.string(),      // why it was dropped
      })),
    })
    .optional(),
});
```

**Pros:** backward-compatible (optional), testable, surfaces the gate's effect to the UI.
**Cons:** adds a field that the UI must learn to render.

### Option B — Strip silently, log to server only

Keep schema unchanged. Gate writes to `console.warn` only.

**Pros:** zero schema churn.
**Cons:** invisible to the user; can't show "we removed N suggestions because you already did them" in the UI.

**Recommendation:** Option A. The whole point of a gate is to be honest with the user about what the LLM got wrong — silently stripping feels dishonest and undermines the trust the rest of the system is building. Surface it in the UI as a small badge: "1 sugerencia omitida: ya estaba en tu código".

---

## 7. Risks

- **Regex overreach** — pattern #4 ("unificá estilo de nomenclatura") and #11 (specific types vs strings) are **semantic** judgments. Trying to validate them with regex will produce false positives/negatives. **Mitigation:** keep them in the "soft" bucket — gate does NOT strip them, only flags them.
- **Prompt-side drift** — Claude can produce suggestions in many phrasings the mock templates don't cover. The validator must pattern-match on **intent keywords** (e.g. "validación", "null", "edge case", "tipos específicos") not exact strings. Otherwise the gate works on mocks and silently fails on real LLM output.
- **Test churn** — `mock-corrector.test.ts` line 31 asserts `expect(result.feedback).toContain("Excelente")`. Once the gate removes pieces of feedback, these tests may break. **Mitigation:** keep raw `feedback` in the schema (Option A above) and update the few tests that need to read `feedback` from the cleaned version.
- **Monomorphization bias** — the mock templates are good/excellent-static. If we always strip suggestions, an "excellent" code sample may end up with a feedback string that reads "low quality", confusing the user. **Mitigation:** if the gate strips N out of M suggestions, recompute `totalScore` to reflect that fewer issues were found, OR keep the original score and let the user see "we said excellent, but only because nothing else was missing". This is a design call — flag for proposal.

---

## 8. Effort Estimate

| Sub-task | Effort | Notes |
|---|---|---|
| Extract suggestion taxonomy into a tagged data structure | XS | 1 file, ~50 lines, no behavior change. |
| `analyzeCode()` v2 — add null-handling, DI, default-case detection | S | Extend existing function, ~40 lines, all regex. |
| New `validateSuggestions()` module | M | ~150 lines including the intent-keyword map. |
| Extend `CorrectionResultSchema` with `suggestionValidation` | XS | 5 lines + types. |
| Wire gate into `src/app/api/correction/route.ts` | XS | 3 lines + import. |
| Update `mock-corrector.test.ts` for new field + feedback cleaning | S | Maybe 4-5 test updates. |
| Add new tests for `validateSuggestions()` (table-driven) | M | ~15 cases per pattern × 22 patterns = sample-driven. |
| UI badge for "X sugerencias omitidas" | S–M | Outside the API; flag for design. |
| **Total (API + lib only, no UI)** | **M (≈1–2 days)** | |
| **Total (API + lib + UI badge)** | **L (≈3–4 days)** | |

---

## 9. Recommendation

**Build a post-correction gate in the route handler** (Option 1), backed by a new pure module `src/lib/suggestion-validator.ts`. Extend the schema with an **optional** `suggestionValidation` field (Option A) so we keep raw feedback for audit and expose the gate's effect to the UI. Keep regex-only for v1; reserve AST for the second iteration. Limit v1 to the **mechanically checkable** patterns (#1, #2, #5, #6/7/8/9/10, #12) — explicitly tag the soft ones (#4, #11) so the gate never strips them.

**Ready for proposal:** Yes. The taxonomy is small (4 families, ~12 patterns), the existing `analyzeCode` is the right place to extend, and the route handler is the only call site. No external dependencies, no schema-breaking changes.
