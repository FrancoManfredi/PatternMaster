# Tasks: Fix JD P1/P2 Findings

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~200 new + ~600 moved = ~800 |
| 800-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | CSS + debug cleanup | PR 1 | `npx vitest run src/lib/test-runner/tests/` | N/A — pure deletion | Revert globals.css + 8 test files |
| 2 | Dead code + content type | PR 2 | `npx vitest run` | N/A — type change, no runtime | Revert 3 deleted files + content/index.ts |
| 3 | Dedupe stripTS + registry | PR 3 | `npx vitest run` | `npm run build` | Revert transforms.ts + ExerciseSection.tsx |
| 4 | Split checks.ts | PR 4 | `npx vitest run src/lib/validate-pattern/` | N/A — barrel re-export preserves path | Revert part-a + part-b, restore checks.ts |
| 5 | Nav + docs + config | PR 5 | `npm run build` | N/A — last in chain | Revert Header.tsx + page.tsx + README |

## Phase 1: CSS & Debug Cleanup (PR 1) ✅

- [x] 1.1 `src/app/globals.css` — Remove hidden-scrollbar rules (`.no-scrollbar`, `::-webkit-scrollbar`)
- [x] 1.2 `src/lib/test-runner/tests/adapter.ts` — Remove `console.log("[EVAL-TESTDEF-1]")`
- [x] 1.3 `src/lib/test-runner/tests/builder.ts` — Remove `console.log("[EVAL-TESTDEF-2]")`
- [x] 1.4 `src/lib/test-runner/tests/chain-of-responsibility.ts` — Remove `console.log("[EVAL-TESTDEF-3]")`
- [x] 1.5 `src/lib/test-runner/tests/decorator.ts` — Remove `console.log("[EVAL-TESTDEF-4]")`
- [x] 1.6 `src/lib/test-runner/tests/factory-method.ts` — Remove `console.log("[EVAL-TESTDEF-5]")`
- [x] 1.7 `src/lib/test-runner/tests/singleton.ts` — Remove `console.log("[EVAL-TESTDEF-6]")`
- [x] 1.8 `src/lib/test-runner/tests/strategy.ts` — Remove `console.log("[EVAL-TESTDEF-7]")`
- [x] 1.9 `src/lib/test-runner/tests/template-method.ts` — Remove `console.log("[EVAL-TESTDEF-8]")`

## Phase 2: Dead Code & Content Type (PR 2)

- [ ] 2.1 `src/components/ui/ProgressBadge.tsx` — Delete entire file
- [ ] 2.2 `src/lib/js-starter.ts` — Delete entire file
- [ ] 2.3 `src/app/patterns/[slug]/PatternDetailClient.tsx` — Remove "Guardar patrón" UI and `generateJSStarter` import
- [ ] 2.4 `src/content/index.ts` — Make `starterCodeJS` optional (`starterCodeJS?: string`)
- [ ] 2.5 `src/app/patterns/[slug]/PatternDetailClient.tsx` — Remove `generateJSStarter` call, update `starterCodeJS` access to use `??`

## Phase 3: Dedupe & Refactor (PR 3)

- [ ] 3.1 Create `src/lib/transforms.ts` — Extract `stripTS()` and `hexToRgba()` as shared exports
- [ ] 3.2 `src/lib/test-runner/runner.ts` — Replace inline `stripTS` with import from `transforms.ts`
- [ ] 3.3 `src/lib/validate-pattern/checks.ts` — Replace inline `stripTS` + `hexToRgba` with import from `transforms.ts`
- [ ] 3.4 `src/components/patterns/ExerciseSection.tsx` — Extract inline `patternTestDefs` map into shared config import
- [ ] 3.5 Create shared config file for `patternTestDefs` map

## Phase 4: Split checks.ts (PR 4)

- [ ] 4.1 Create `src/lib/validate-pattern/part-a-sandbox.ts` — Extract sandbox-related checks from `checks.ts`
- [ ] 4.2 Create `src/lib/validate-pattern/part-b-guided.ts` — Extract guided-mode checks from `checks.ts`
- [ ] 4.3 `src/lib/validate-pattern/checks.ts` — Replace content with barrel re-export of part-a + part-b
- [ ] 4.4 Remove stale imports from original `checks.ts` — verify no orphans remain

## Phase 5: Nav, Docs & Config (PR 5)

- [ ] 5.1 `src/components/layout/Header.tsx` — Remove dead nav links (`/progress`, `/community`)
- [ ] 5.2 `src/app/page.tsx` — Remove or repurpose "Iniciar Sesión" button
- [ ] 5.3 Replace `README.md` with project-specific docs (not boilerplate create-next-app)
- [ ] 5.4 Create `.env.example` with `MOCK_CORRECTOR` and `ANTHROPIC_API_KEY` documented
