# Tasks: Fix Corrector Terminology

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250–350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Glossary Engine

- [x] 1.1 Create `src/lib/glossary.ts` — export `PatternGlossary` interface (`actors: string[]`, `forbidden: string[]`) and `getPatternGlossary(slug: string): PatternGlossary`
- [x] 1.2 Regex-extract `\*\*([^*]+)\*\*` from `sections.howItWorks.description`; normalize (trim, collapse whitespace, strip backticks)
- [x] 1.3 Denylist filter: drop bolded text matching `/^(Antes|Después|Ejemplo|Uso|Nota|Importante|Código|Tabla|Diagrama|Paso|Etapa|Fase)/i`
- [x] 1.4 Deduplicate preserving first occurrence order; build `forbidden` = union of all other patterns' actors (exclude own)
- [x] 1.5 Create `src/lib/__tests__/glossary.test.ts` — assert known actor lists for at least 3 patterns (Factory Method, Strategy, Observer); verify self-exclusion in forbidden list

## Phase 2: Prompt Injection

- [x] 2.1 Extend `buildCorrectionPrompt()` signature to accept `glossary: PatternGlossary`, `codeBefore: string`, `codeAfter: string`
- [x] 2.2 Inject glossary block before rubric: correct terminology (`actors`) + forbidden terms (`forbidden`)
- [x] 2.3 Inject few-shot example: `codeBefore` → `codeAfter` transition from pattern content
- [x] 2.4 Add cite-user-code directive: "Citá al menos una clase concreta del código del usuario antes de sugerir mejoras"
- [x] 2.5 Update `src/lib/__tests__/prompt.test.ts` — assert glossary block, few-shot section, and cite directive presence in generated prompt

## Phase 3: Mock Corrector

- [x] 3.1 Refactor `mockCorrect()` to accept optional `patternSlug` param
- [x] 3.2 Build per-slug template registry: builder functions that interpolate actor names into Spanish-language feedback/criteria templates
- [x] 3.3 Implement fallback for unknown slugs: generic template without pattern-specific actor names
- [x] 3.4 Update `src/lib/__tests__/mock-corrector.test.ts` — cross-pollution test: `mockCorrect(code, "factory-method")` must NOT contain "Contexto" or "Estrategia"; unknown slug returns generic

## Phase 4: Route Wiring

- [x] 4.1 Update `src/app/api/correction/route.ts` — derive glossary via `getPatternGlossary(slug)` after loading pattern content
- [x] 4.2 Forward `glossary`, `codeBefore`, `codeAfter` from pattern content to `buildCorrectionPrompt()`
- [x] 4.3 Pass `patternSlug` to `mockCorrect()` when `USE_REAL_CLAUDE=false`

## Phase 5: Verification

- [x] 5.1 Run full test suite — all existing + new tests pass
- [ ] 5.2 Manual smoke: submit Factory Method code in mock mode — feedback uses "Producto"/"Creador", zero "Estrategia"/"Contexto"
