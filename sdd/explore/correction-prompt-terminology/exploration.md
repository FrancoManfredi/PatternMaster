# Exploration: Pattern-specific terminology in the LLM correction prompt

> Topic slug: `correction-prompt-terminology`
> Working dir: `C:\Users\Franco\Desktop\PatternMaster\patternmaster`
> Project is not a git repo (per env). Artifact lives at `sdd/explore/correction-prompt-terminology/exploration.md`.

## Current State

The correction pipeline runs in two modes, both pattern-agnostic in different ways:

### 1. The LLM prompt path (`src/lib/prompt.ts` → `src/lib/claude.ts`)

`buildCorrectionPrompt` takes **only six fields** and forwards them to Claude:

```ts
{ patternTitle, exerciseStatement, exerciseInstructions,
  acceptanceCriteria: string[], code, language }
```

The only pattern-aware variable is `patternTitle` (e.g. `"Factory Method"`, `"Strategy"`) on line 24. The rest of the prompt is **boilerplate** that is identical for every pattern:

- The rubric block (lines 11–16) is hardcoded to `src/content/rubric.ts`, which is a **four-criterion generic checklist** with description strings that reference "el patrón" generically (e.g. *"¿Reduce el acoplamiento que el patrón busca resolver?"*). It never names the actors.
- The acceptance-criteria block (lines 18–20) does come from the pattern JSON, but it is the *user-facing* criteria, not evaluator guidance.
- The "Instrucciones de Respuesta" block (lines 43–56) asks for a JSON shape with the four generic criteria and a free-text `feedback` field. **Nothing in the prompt tells the LLM which terminology to use or which actors are expected in this pattern.**
- The `correction-correction` JSON response has no field for `codeReferences`, so the LLM cannot structurally cite the user's code.

### 2. The mock corrector path (`src/lib/mock-corrector.ts`)

`mockCorrect(code)` is regex-based (`/interface\s+\w+/i`, `/class\s+\w+/i`, comment regex) and bins code into `empty | minimal | partial | good | excellent`. The score table and all the Spanish feedback strings are hardcoded **inside the file**, with the worst terminology leaks living here:

- `feedbackMap.excellent` (line 52): *"las **estrategias concretas** implementan correctamente el contrato, y el código es claro y mantenible. ... considerá agregar validación en el **contexto** para manejar **estrategias nulas**"* — this is literally Strategy vocabulary, used unconditionally for every pattern's mock output (including Factory Method).
- `commentMap.excellent.pattern` (line 81): *"la estructura es limpia y sigue fielmente al patrón"* — generic, fine.
- `feedbackMap.partial` (line 48): *"...faltan las implementaciones concretas y la integración con el **contexto**"* — wrong noun for Factory Method (the actor is "Creador"/"Producto", not "Contexto").
- The mock corrector receives only `code` (a string). It does **not** receive `patternSlug` today (see `route.ts:29`), so it has no way to look up the right vocabulary even if it wanted to.

### 3. Where the prompt is built (`src/app/api/correction/route.ts`)

Lines 46–53 already pass `pattern.title`, `pattern.exercise.statement`, etc. The `pattern` object loaded via `getPatternBySlug` is the full `PatternContent` (see `src/content/index.ts`), which already contains rich pattern-specific content (`sections.howItWorks.description` literally lists the actors with names, `codeBefore`/`codeAfter` are full code samples, `codeTag` is a category-scoped ID). **The plumbing has the data; `buildCorrectionPrompt` simply does not ask for it.**

## Affected Areas

- `src/lib/prompt.ts` — root of the problem. Only consumes `patternTitle`. Needs to receive and inject glossary + few-shot examples.
- `src/lib/mock-corrector.ts` — hardcoded Spanish strings that leak Strategy vocabulary. Needs to be pattern-aware OR move strings to a per-pattern template map.
- `src/content/rubric.ts` — generic descriptions. Two paths: (a) keep generic, wrap each criterion's `description` per-pattern in the prompt; (b) make rubric data-driven per pattern. (a) is much smaller blast radius.
- `src/content/patterns/*.json` (22 files) — already contain `sections.howItWorks.description` which lists the actors explicitly. Can be **parsed** for glossary terms, OR a new `glossary` field can be added (cheapest: parse existing prose with a simple regex at load time; cleanest: explicit `glossary` field, but that's 22 manual edits).
- `src/content/index.ts` — `PatternContent` type would need a new optional `glossary` field if we add one.
- `src/app/api/correction/route.ts` — already has the full `pattern` object; just needs to forward more fields. Mock branch (line 29) needs `patternSlug` to do anything pattern-aware.
- `src/lib/claude.ts` — model is `claude-sonnet-4-20250514`, `max_tokens: 2048`. No changes needed.
- `src/lib/schemas.ts` — `CorrectionResultSchema` could optionally grow a `codeReferences` field (low priority — see Risks).
- `src/lib/__tests__/prompt.test.ts` — assertions on the current generic strings will need updating (e.g. the `"Aplicación del Patrón"` and `"Desacoplamiento"` checks still pass because those rubric labels are unchanged, but the prompt will grow).
- `src/lib/__tests__/mock-corrector.test.ts` — line 24 asserts the partial feedback contains `"interfaz"`; line 31 asserts excellent feedback contains `"Excelente"`. Both will keep passing if we keep Strategy-vocabulary text behind a `if slug === "strategy"` guard, or we add a new test that runs `mockCorrect` with `patternSlug: "factory-method"` and asserts Strategy-specific strings are absent.
- `src/app/api/correction/__tests__/route.test.ts` — uses `patternSlug: "strategy"` and a generic `class Foo {}` body, so the success path is not sensitive to pattern vocabulary. Safe.

## Approaches

### Option A — Add a `glossary` field to each pattern JSON (manual, explicit)

Add a `glossary` object to each of the 22 pattern JSONs:

```json
{
  "slug": "factory-method",
  "glossary": {
    "actors": ["Producto", "Producto Concreto", "Creador", "Creador Concreto"],
    "keyConcept": "diferir la instanciación a subclases",
    "forbiddenSynonyms": ["estrategia", "contexto", "observador", "sujeto"]
  }
}
```

Pass this into `buildCorrectionPrompt` and inject a new section:

```
## Glosario del Patrón
- Actores esperados: Producto, Producto Concreto, Creador, Creador Concreto.
- Concepto clave: diferir la instanciación a subclases.
- Evitá usar: "estrategia", "contexto", etc. (estos pertenecen a otros patrones).
```

- **Pros**: explicit, type-safe, content team controls the vocabulary. Forbids-synonyms list is a strong guardrail.
- **Cons**: 22 manual edits to JSON; risk of drift between `glossary` and the prose in `sections.howItWorks.description`.
- **Effort**: Low–Medium (~22 small JSON edits + a new `Glossary` interface + prompt injection + tests). Total ~3–4 hours of focused work.

### Option B — Derive glossary programmatically from existing JSON (no edits)

Each pattern's `sections.howItWorks.description` already contains a numbered list of actors (e.g. *"1. **Producto**... 2. **Producto Concreto**... 3. **Creador**... 4. **Creadores Concretos**"*). A small parser at `src/lib/glossary.ts` can:

1. Extract the **bold actor names** (regex `/\*\*([^*]+)\*\*/g`) from that field.
2. Collect the **other patterns' actor names** as a `forbiddenSynonyms` set.
3. Pass this glossary into the prompt the same way Option A would.

- **Pros**: zero content-team burden. The data is already there. Self-correcting if `howItWorks` is updated.
- **Cons**: regex on free-form Spanish prose is brittle. Some patterns nest the actor list (e.g. `iterator` may have Cursor, Aggregate, ConcreteIterator, Client — not always a clean `**Name**` bullet). Need unit tests per pattern, or accept some false negatives.
- **Effort**: Low (1 new file ~40 LOC, 1 prompt change, ~3 tests). ~2 hours.

### Option C — Add few-shot examples to the prompt (using existing `codeBefore`/`codeAfter`)

Each pattern JSON has `codeBefore` (the "before" code with the anti-pattern's `if/else` monolith) and `codeAfter` (the "after" code with the pattern applied). Inject these as a "Ejemplo canónico":

```
## Ejemplo de referencia
Código problemático (NO hacerlo así):
<codeBefore>

Código bien estructurado (SÍ así):
<codeAfter>
```

- **Pros**: anchors the LLM in real pattern-specific code. Uses content the team already curated. No new fields needed.
- **Cons**: `codeAfter` is **prose-as-comment**, not always a full runnable refactor — see factory-method.json:62–67 where `codeAfter` is illustrative, not the same shape as the `__solutions__/factory-method.ts` reference. Also, prompt size grows. The 2048-token `max_tokens` (claude.ts:17) is **output**, not input, so input-side growth is fine.
- **Effort**: Low (~10 LOC in `prompt.ts`, optional toggle in `route.ts`). ~1 hour.

### Option D — Force the LLM to cite user code via a new schema field

Add `codeReferences: string[]` to `CorrectionResultSchema`, ask the prompt to list identifiers (`"class:EmailNotification"`, `"method:send"`, `"interface:Notification"`). Render these in the UI as clickable chips.

- **Pros**: makes the "the LLM suggests enums when the user already has them" failure mode detectable. The structured field is easier to test than free-text feedback.
- **Cons**: schema change. The LLM compliance is not 100%; you need a fallback. The UI in `FeedbackPanel.tsx` would need to render the new field.
- **Effort**: Medium (~30 LOC schema + 20 LOC prompt + 30 LOC UI + tests). ~3 hours.

### Option E — Make `mock-corrector.ts` pattern-aware via a per-pattern template map

Replace the `commentMap`/`feedbackMap` (lines 42–86) with a `Map<slug, { excellent: { ... }, good: { ... }, ... }>` keyed by pattern slug, plus a `default` fallback. Pass `patternSlug` from `route.ts:29` into `mockCorrect(code, patternSlug)`.

- **Pros**: kills the "contexto" / "estrategia" leaks in dev. Honest mock output per pattern.
- **Cons**: 22 × 5 = 110 Spanish strings to write and maintain. Could be derived from the same glossary the LLM uses (if we go with A or B), so the strings stay in one place.
- **Effort**: Medium-High without derivation; Low if combined with A or B (templates reuse glossary nouns). ~2–6 hours depending on whether templates are hand-written or generated.

## Recommendation

**Combine Option B + C + E in a single change**, in this order:

1. **B (derivation first)** — no content-team burden, gives you a glossary with forbidden synonyms from day one. Add `src/lib/glossary.ts` (~40 LOC) that parses `sections.howItWorks.description` for each pattern. Unit-test the parser against all 22 patterns.
2. **C (few-shot)** — inject `codeBefore` + `codeAfter` into the prompt. Use it to anchor the LLM. Single file edit in `prompt.ts` plus a small test in `prompt.test.ts`.
3. **E (mock)** — pass `patternSlug` into `mockCorrect`, replace the `commentMap`/`feedbackMap` with a registry of templates indexed by slug. Use the derived glossary nouns to fill in template slots (`"los {actor.plural} concretos"`).

**Defer**:
- Option A (manual `glossary` field) — useful as a content-team escape hatch, but only worth it if derivation fails for ≥2 patterns.
- Option D (forced code references) — nice-to-have, but the bigger win is pattern-specific vocabulary. Add a follow-up change if the corrected LLM still hallucinates.

**Defer the rubric refactor** (`src/content/rubric.ts`): keeping it generic is fine if the prompt wraps it. The four criterion labels (`patternApplication`, `decoupling`, `naming`, `functionality`) are pattern-agnostic **on purpose** — they apply to every GoF pattern. The descriptions can be tightened in Spanish without making the rubric data-driven.

## Risks

- **Glossary derivation brittleness.** Parsing Spanish prose with `/\*\*([^*]+)\*\*/g` will miss actors that aren't bolded or that span multiple lines. Mitigation: add a `glossary` field (Option A) as an **override** layer — if `pattern.glossary` is present, use it; else derive. Two patterns may need the override to start; the rest can ride on derivation.
- **Prompt-size growth.** Injecting `codeBefore` + `codeAfter` + glossary can push the prompt to ~3–4k tokens for 22 patterns. `max_tokens: 2048` is output, so this is fine, but cost and latency rise. Mitigation: only inject few-shot for the pattern at hand (don't dump all 22 examples). The current design already scopes per request.
- **Mock-corrector backward compatibility.** `mockCorrect(code: string = "")` is called from `route.ts:29` with no slug. If we make the second arg required, we have to update `route.ts`. The `mock-corrector.test.ts` calls it with one arg (line 7) — those tests need `patternSlug: "strategy"` added to remain deterministic. Low blast radius.
- **Schema change to `CorrectionResultSchema`.** If we go with Option D, every test that does `safeParse` (storage, mock-corrector, prompt, route) needs to be aware. The four-criterion + totalScore + feedback shape is wired into the UI (`FeedbackPanel.tsx`); changing it requires UI work.
- **Forbidden-synonyms list can backfire.** Telling the LLM *"no uses 'contexto'"* on a Factory Method prompt is fine, but a future pattern (e.g. State) might legitimately use the word "contexto" in some implementations. The list must come from "other patterns' actors" not from a hardcoded blacklist — which is exactly what Option B's derived set gives you.
- **The "suggests enums when the user already has them" failure mode is not solely a terminology problem.** It is a **code-referencing** problem: the LLM did not read the user's code carefully. Even perfect pattern vocabulary will not fix this. Mitigation: combine with a code-reference requirement (Option D) or a more explicit prompt directive like *"Citá al menos una clase del usuario antes de sugerir un cambio"*. The current prompt has no such directive.
- **Rubric weights vs pattern fit.** Some patterns weight "decoupling" higher than others in practice. Factory Method is **about** decoupling; Singleton is not. The current flat 35/30/20/15 weights are a deliberate simplification. A future change could let patterns override weights; flag this in a follow-up.
- **The current `codeTag` field is unused by the prompt.** `codeTag: "CREATIONAL_01"` etc. is metadata only. It could anchor a "category-aware" glossary ("Creador" is a Creational-pattern concept; "Sujeto" is a Behavioral one), but that's a stretch. Mention as a future opportunity, not a current change.

## Glossary source comparison (concrete)

Pulled from the existing JSONs (no edits needed to derive):

| Pattern slug | Actors (from `sections.howItWorks.description`) |
| --- | --- |
| `factory-method` | Producto, Producto Concreto, Creador, Creadores Concretos |
| `strategy` | Contexto, Interfaz Strategy, Estrategias Concretas |
| `observer` | Sujeto, Observador, Sujeto Concreto, Observador Concreto |
| `abstract-factory` | Interfaz Abstract Factory, Fábricas Concretas, Interfaces Abstractas de Producto, Productos Concretos |
| `command` | Command, ConcreteCommand, Invoker, Receiver, Client |

The parser needs to handle both singular and plural forms (Creador / Creadores Concretos), and skip section headers that use bold formatting but are not actor names (e.g. *"1. **Producto**: Define la interfaz..."* — actor is `Producto`, not `Producto: Define la interfaz...`). A small allow-list of common actor-noun suffixes (`Concreto`, `Abstract`, `Factory`, `Strategy`, `Observer`) plus a denylist of non-actor bolded phrases (`Antes`, `Después`, `Ejemplo`, `Uso`) covers ~90% of cases.

## Ready for Proposal

**Yes.** The change is well-scoped:

- One new file: `src/lib/glossary.ts` (~40 LOC) with derivation logic and a unit test that exercises all 22 patterns.
- One file edit: `src/lib/prompt.ts` accepts `glossary`, `codeBefore`, `codeAfter` and injects two new sections.
- One file edit: `src/app/api/correction/route.ts` passes the new fields (it already has the `pattern` object in scope).
- One file edit: `src/lib/mock-corrector.ts` becomes pattern-aware (small refactor of the maps into a per-slug registry, plus new signature `mockCorrect(code, patternSlug)`).
- Test updates: `prompt.test.ts` (add glossary-injection assertion), `mock-corrector.test.ts` (pass `patternSlug` to existing calls, add a new test asserting Strategy-vocabulary is absent on a Factory Method call), `route.test.ts` (no change needed, uses `strategy` slug which still works).

Estimated total: ~6–8 hours of focused work, including testing and content verification. No schema changes, no UI changes, no Next.js API-route surface changes (Next.js 16 caveat from `AGENTS.md` is irrelevant — the existing `POST` handler is preserved verbatim).
