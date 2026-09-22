# Design: Escalar Reto de Implementación a 22 Patrones GoF

## Technical Approach

Generate 3 executable artifacts per remaining pattern (21 total):
1. **PatternTestDef** — behavioral checks evaluated in sandbox Worker via `new Function`
2. **Reference solution** — export classes that satisfy all acceptance criteria
3. **GuidedExercise** — progressive walkthrough built with `buildGuidedExercise()`

Delivery is incremental by batch. Batch 1 (singleton, decorator, strategy) validates the pipeline across 3 categories and difficulty levels. Subsequent batches deliver 4-5 patterns grouped by category for consistency.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| Batch grouping | By category / By difficulty / Mixed | Category grouping keeps acceptance-criteria style consistent; mixed (Batch 1) proves pipeline variety | Batch 1 mixed; rest by category |
| Step count heuristic | Fixed 4 / Variable by complexity | Fixed 4 forces verbosity on Singleton; variable matches pattern complexity | Variable heuristic (see below) |
| Check style | Behavioral / Implementation-specific | Behavioral allows multiple valid solutions; implementation-specific blocks creativity | Behavioral only |
| Abstraction type | class / interface | JSON theory uses interface, but project confirmed **all abstractions use class** for eval compatibility | class |

### Step Count Heuristic

| Pattern complexity | Criteria count | Steps | Structure |
|-------------------|----------------|-------|-----------|
| Fácil (1-2 criteria) | 2-3 | 2-3 | 0: problem + objective; 1: core implementation; [2: complete solution] |
| Medio (3-4 criteria) | 4 | 3-4 | 0: problem + objective; 1-2: build components; final: full solution |
| Difícil (5+ criteria) | 5+ | 4-5 | 0: problem + objective; 1-3: build hierarchy/delegation; final: integration |

Rules:
- Step 0 MUST mention the exercise objective (B1)
- Final step MUST contain all acceptance-criteria symbols (B7)
- Non-final steps MAY contain pedagogical TODOs; final step MUST NOT
- `computedNewLines` is always computed by `buildGuidedExercise` (B5)

## Data Flow

```
JSON content ──→ acceptanceCriteria ──→ PatternTestDef (checks.ts)
       │                              │
       └──→ exercise.statement ──→ GuidedExercise (steps.ts)
       │                              │
       └──→ theory ──────────────→ Solution reference (__solutions__)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/lib/test-runner/tests/{slug}.ts` | Create ×21 | PatternTestDef per pattern |
| `src/content/patterns/__solutions__/{slug}.ts` | Create ×21 | Reference solution per pattern |
| `src/content/guided/{slug}.ts` | Create ×21 | GuidedExercise per pattern |
| `src/content/guided/index.ts` | Modify | Register each new guided exercise |
| `src/lib/validate-pattern/validate-pattern.test.ts` | Modify | Add batch patterns to validation suite |

## Interfaces / Contracts

PatternTestDef contract (existing, unchanged):
```typescript
export interface PatternTestDef {
  slug: string;
  expectedNamedExports: string[];
  criteria: CriterionCheck[];
}
```

Each new test file MUST export `const {slug}TestDef: PatternTestDef` and follow the factory-method template:
- `check` strings are JS expressions parsed by `new Function("exports", "assert", check)`
- `requiredExports` MUST be a subset of `expectedNamedExports`
- `failureMessage` MUST be user-friendly Spanish

GuidedExercise contract (existing, unchanged):
```typescript
export type GuidedStepInput = Omit<GuidedStep, "computedNewLines">;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Per-pattern self-validation (A6) | `stripTS(solution) → eval → run checks` |
| Integration | Batch validation via vitest | `npx vitest run src/lib/validate-pattern/validate-pattern.test.ts` |
| Gate | All checks 100% green before commit | Orchestrator blocks presentation on any failure |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

Incremental batch delivery:
1. **Batch 1** (singleton, decorator, strategy) — validate pipeline with varied patterns
2. **Batch 2-5** (4-5 patterns each, by category) — deliver remaining 18 patterns

Before each batch is presented to the user:
- Run `npx vitest run src/lib/validate-pattern/validate-pattern.test.ts`
- ALL Part A + Part B checks must pass for the batch
- If any check fails, fix before continuing

## Risk Mitigation (Known Bugs from Factory-Method)

| Risk | Mitigation | Validation Check |
|------|-----------|----------------|
| Over-specified checks | Check behavior only; never exact error text or internal state | A5 |
| Solution doesn't pass its own tests | Self-validation gate before any commit | A6 |
| Sandbox vocabulary in guided | Spanish explanations only; no "evaluar", "verificar", "check" | B2 |
| Truncated step code | Every step is complete runnable code; no `// ...` or `/* ... */` | B3 |
| Invalid step code syntax | `new Function(step.code.javascript)` must parse | B6 |
| Missing symbols in final step | Acceptance-criteria class names must appear in final step code | B7 |
| `computedNewLines` hardcoded | Always use `buildGuidedExercise()`; never manually set array | B5 |

## Open Questions

- [ ] Should Batch 1 include a "difícil" pattern to stress-test the 4-5 step heuristic, or keep all 3 as Fácil/Intermedio?
- [ ] For patterns with `interface` in their JSON `structureCode`, do we convert to `class` in the solution or keep the JSON theory as-is and only use `class` in the exercise?

