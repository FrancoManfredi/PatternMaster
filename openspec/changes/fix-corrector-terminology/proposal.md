# Proposal: Fix Corrector Terminology

## Intent

The LLM corrector and mock corrector leak Strategy-pattern terminology ("estrategias concretas", "contexto") into ALL pattern evaluations. The prompt lacks pattern-specific glossary injection, `codeBefore`/`codeAfter` few-shot examples, and enforcement to reference the user's actual code. Result: irrelevant suggestions (e.g., "add enums" when enums already exist).

## Scope

### In Scope
- `glossary.ts` — derive per-pattern actors from `sections.howItWorks.description` bolded names
- `prompt.ts` — inject glossary, few-shot codeBefore→codeAfter, cite-user-code directive
- `mock-corrector.ts` — accept `patternSlug`; use pattern-specific templates instead of hardcoded Strategy terms
- `route.ts` — forward `patternSlug` + glossary to prompt builder and mock corrector
- Tests for glossary derivation, prompt injection, mock cross-pollution prevention

### Out of Scope
- Manual glossary field per JSON (escape hatch deferred)
- `codeReferences` schema field (needs UI work)
- Rubric refactor (keep generic)
- UI changes

## Capabilities

### New Capabilities
None — fixes existing capability.

### Modified Capabilities
- `exercise-correction` — correction prompt now uses pattern-specific terminology and references actual user code

## Approach

1. **`glossary.ts`**: Regex-extract `**Actor Name**` patterns from `howItWorks.description`. Build a map: `actors` (this pattern's names) + `forbiddenSynonyms` (actors from OTHER patterns). Used for both prompt injection and mock template selection.

2. **`prompt.ts`**: Add `glossary` + `codeBefore`/`codeAfter` params. Inject three blocks:
   - **Glosario**: correct terminology + forbidden terms
   - **Ejemplo de referencia**: `codeBefore` → `codeAfter` transition
   - **Directiva**: "Citá al menos una clase concreta del código del usuario"

3. **`mock-corrector.ts`**: Pattern-specific template registry keyed by `patternSlug`. Fallback to generic if no template exists. Removes hardcoded "estrategias concretas" / "contexto".

4. **`route.ts`**: Derive glossary via `getPatternBySlug`, pass to both `buildCorrectionPrompt` and `mockCorrect`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/glossary.ts` | New | Regex derivation of pattern actors |
| `src/lib/prompt.ts` | Modify | Inject glossary + few-shot + directive |
| `src/lib/mock-corrector.ts` | Modify | Pattern-aware template registry |
| `src/app/api/correction/route.ts` | Modify | Forward slug + glossary |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Glossary regex misses actors in some patterns | Medium | Denylist non-actor bolded headers; allow-list actor suffixes (Concreto, Abstract, Factory) |
| Prompt size growth | Low | ~500 extra tokens per call, acceptable |
| Mock corrector signature change breaks tests | Low | Update all `mockCorrect()` calls to pass `patternSlug` |

## Rollback Plan

Revert changes to `prompt.ts`, `mock-corrector.ts`, `route.ts`. Delete `glossary.ts`.

## Dependencies

- Existing `PatternContent` type with `sections.howItWorks.description`, `codeBefore`, `codeAfter`

## Success Criteria

- [ ] `glossary.ts` correctly extracts actors for all 22 patterns
- [ ] Mock corrector for Strategy does NOT mention "Producto" or "Creador"
- [ ] Mock corrector for Factory Method does NOT mention "Contexto" or "Estrategias"
- [ ] Prompt includes glossary block, few-shot example, and cite-user-code directive
- [ ] Existing tests pass after signature changes
