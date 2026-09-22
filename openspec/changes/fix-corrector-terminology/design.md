# Design: Fix Corrector Terminology

## Technical Approach

Derive pattern-specific actor terminology from existing JSON content, inject it into the correction prompt, and replace the hardcoded Strategy-only mock corrector with a pattern-aware template registry. This maps directly to the proposal’s zero-content-change approach: we extract what already exists rather than adding new fields.

## Architecture Decisions

| Decision | Alternatives | Tradeoff | Choice |
|----------|-----------|----------|--------|
| Glossary source | Manual field per JSON | Self-maintaining, zero content changes | Derive from `**bolded**` actors in `howItWorks.description` |
| Forbidden scope | Category-based grouping | Simpler, no category ambiguity | All actors from all *other* patterns |
| Mock templates | 110 hardcoded strings (22×5 levels) | Maintainable, single source of truth | Per-slug builder function that interpolates actors into generic templates |
| Prompt injection point | Before rubric | Glossary must be seen before evaluation criteria | Before rubric block |

## Data Flow

```
POST /api/correction
       │
       ▼
   route.ts ──getPatternBySlug──► pattern JSON
       │                              │
       ▼                              ▼
   glossary.ts ◄──howItWorks.description──┘
       │
       ▼
   { actors: ["Producto", "Creador"], forbidden: ["Estrategia", "Contexto"] }
       │
       ▼
   prompt.ts ──► inject glossary + codeBefore/codeAfter + cite directive
       │
       ▼
   mock-corrector.ts or Claude
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/glossary.ts` | Create | Extract `**bolded**` actor names from `howItWorks.description`, filter denylisted headers, build `forbidden` from all other patterns |
| `src/lib/prompt.ts` | Modify | Accept `glossary`, `codeBefore`, `codeAfter`; inject three blocks before rubric |
| `src/lib/mock-corrector.ts` | Modify | Accept `patternSlug`; registry of builder functions keyed by slug; fallback generic template |
| `src/app/api/correction/route.ts` | Modify | Load glossary, pass to `buildCorrectionPrompt` and `mockCorrect` |
| `src/lib/__tests__/glossary.test.ts` | Create | Derivation accuracy + forbidden exclusion per pattern |
| `src/lib/__tests__/prompt.test.ts` | Modify | Assert glossary block, few-shot, and cite directive presence |
| `src/lib/__tests__/mock-corrector.test.ts` | Modify | Cross-pollution prevention + unknown-slug fallback |

## Interfaces / Contracts

```typescript
// src/lib/glossary.ts
export interface PatternGlossary {
  actors: string[];      // deduplicated, cleaned bolded names for this pattern
  forbidden: string[];   // actors from all OTHER patterns
}

export function getPatternGlossary(slug: string): PatternGlossary;

// src/lib/prompt.ts — extended signature
export function buildCorrectionPrompt(params: {
  patternTitle: string;
  exerciseStatement: string;
  exerciseInstructions: string;
  acceptanceCriteria: string[];
  code: string;
  language: string;
  glossary: PatternGlossary;
  codeBefore: string;
  codeAfter: string;
}): string;

// src/lib/mock-corrector.ts — extended signature
export function mockCorrect(code: string, patternSlug?: string): CorrectionResult;
```

## Glossary Derivation Algorithm

1. Regex extract all `\*\*([^*]+)\*\*` from `sections.howItWorks.description`
2. Normalize: trim, collapse whitespace, strip backticks and code spans
3. Denylist filter: drop entries matching `/^(Antes|Después|Ejemplo|Uso|Nota|Importante|Código|Tabla|Diagrama|Paso|Etapa|Fase)/i`
4. Deduplicate preserving first occurrence order
5. Forbidden = union of all actors from all patterns minus this pattern’s actors

## Mock Template Builder

Registry map: `Record<string, (actors: string[]) => { feedbackMap: Record<Quality, string>; commentMap: Record<Quality, Record<Criterion, string>> }>`

Builder interpolates actor names into Spanish-language templates. Example for Factory Method:
- feedback “partial”: “…faltan las implementaciones concretas del **Producto** y la integración con el **Creador**.”

Fallback generic template omits all actor references and uses neutral Spanish ("interfaz", "implementaciones").

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (glossary) | Extraction accuracy for 22 patterns | Assert known actor lists (e.g., Factory Method → Producto, Creador) |
| Unit (glossary) | Self-exclusion in forbidden list | `forbidden` must NOT contain any of the pattern’s own actors |
| Unit (prompt) | Block injection | String assertions for glossary, few-shot, and cite directive |
| Unit (mock) | Cross-pollution | `mockCorrect(code, "factory-method")` must NOT contain "Contexto" or "Estrategia" |
| Unit (mock) | Unknown slug fallback | `mockCorrect(code, "unknown")` returns generic template without actors |
| Integration | Route round-trip | Existing route tests continue to pass after signature changes |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary is introduced. This change modifies existing internal data flow within a single API route.

## Migration / Rollout

No migration required. Deploy is a simple code push. The prompt size increase (~500 tokens) is well within Claude context limits.

## Open Questions

- [ ] Exact denylist for non-actor bolded text — verify against all 22 patterns during task implementation; adjust if false positives surface.
