# Design: Patrones de Comportamiento

## Technical Approach

Add 9 GoF behavioral patterns as static JSON content files, imported at build time by Next.js. Each file follows the existing `PatternContent` interface (unchanged). Registration is a single import + array push per file in `src/content/index.ts`. No UI, routing, state, or component changes.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| File naming | kebab-case vs camelCase | kebab-case matches 6 existing files (`factory-method.json`, `strategy.json`) | **kebab-case** |
| Exercise fileName | PascalCase .ts vs camelCase | PascalCase matches existing (`eCommerce_Tax_Calculator.ts`) | **PascalCase in Spanish** |
| Description length | 80 chars vs 150 chars | ~130 chars keeps card grid visually uniform | **120–150 chars** |
| structureCode scope | 20-line snippet vs 80-line example | 30–50 lines shows interfaces + concrete classes + usage without scroll fatigue | **30–50 lines** |
| codeBefore/codeAfter | Minimal vs full refactor | 5–15 lines before, 10–20 lines after fits inline viewport | **Short problem/solution pair** |
| Difficulty distribution | Flat vs tiered | Tiered maps pattern complexity realistically (Observer easy, Visitor hard) | **3 Fácil / 4 Medio / 2 Difícil** |

## Data Flow

No runtime data flow — content is static JSON resolved at build time by Next.js `import`.

```
src/content/patterns/*.json ──import──→ src/content/index.ts ──export──→ page components
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/content/patterns/chain-of-responsibility.json` | Create | Chain of Responsibility pattern content (BEHAVIORAL_04, Medio) |
| `src/content/patterns/command.json` | Create | Command pattern content (BEHAVIORAL_05, Fácil) |
| `src/content/patterns/iterator.json` | Create | Iterator pattern content (BEHAVIORAL_06, Fácil) |
| `src/content/patterns/mediator.json` | Create | Mediator pattern content (BEHAVIORAL_07, Difícil) |
| `src/content/patterns/memento.json` | Create | Memento pattern content (BEHAVIORAL_08, Medio) |
| `src/content/patterns/observer.json` | Create | Observer pattern content (BEHAVIORAL_09, Fácil) |
| `src/content/patterns/state.json` | Create | State pattern content (BEHAVIORAL_10, Medio) |
| `src/content/patterns/template-method.json` | Create | Template Method pattern content (BEHAVIORAL_11, Medio) |
| `src/content/patterns/visitor.json` | Create | Visitor pattern content (BEHAVIORAL_12, Difícil) |
| `src/content/index.ts` | Modify | Add 9 import statements + 9 array entries |

## Interfaces / Contracts

`PatternContent` interface in `src/content/index.ts` is sufficient — no changes required. All 28 fields remain mandatory per file. Spanish content throughout.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | TypeScript compilation | `tsc --noEmit` must pass with new JSON imports |
| Integration | `getPatternBySlug` resolves all 9 slugs | Iterate slugs, assert non-undefined return |
| E2E (visual) | Each pattern page renders without 404 | Visit `/patron/{slug}` for all 9 slugs |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Content is additive; existing slugs unaffected.

## Open Questions

- None
