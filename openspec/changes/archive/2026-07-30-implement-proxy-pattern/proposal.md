# Proposal: Implement Proxy Pattern

## Intent

Proxy is the last structural pattern missing exercise infrastructure: no reference solution, no Vitest tests, no sandbox test definition, no registry entry, and no guided mode. Bring it to parity with flyweight (most recent complete structural pattern).

## Scope

### In Scope
- **Reference solution**: `__solutions__/proxy.ts` — 3 exports (`Image` abstract class, `HighResImage`, `ImageProxy`) implementing 4 acceptance criteria
- **Vitest tests**: `__tests__/proxy.test.ts` — behavioral tests per AC + negative tests + content-shape validation
- **Sandbox test definition**: `lib/test-runner/tests/proxy.ts` — 4 criterion checks verifying behavior, not implementation
- **Registry entry**: add `proxy` lazy-import to `lib/test-runner/registry.ts`
- **Guided mode**: `content/guided/proxy.ts` — 4 progressive steps with `buildGuidedExercise`
- **Guided index**: add `proxyGuided` import + map entry to `content/guided/index.ts`

### Out of Scope
- Editing `proxy.json` (already complete)
- New capability specs (uses existing `pattern-exercise-tests` and `sandbox-test-runner`)

## Capabilities

### New Capabilities
- None — this uses existing test infrastructure.

### Modified Capabilities
- **pattern-exercise-tests**: adding Proxy reference solution and behavioral test suite
- **sandbox-test-runner**: adding Proxy test definition + registry entry

## Approach

Mirror the `flyweight` pattern exactly: `__solutions__` → `__tests__` → sandbox test def → registry → guided mode → guided index. Use `abstract class Image` (not `interface`) — Sucrase strips interfaces at runtime, breaking `instanceof` checks in the sandbox Worker. Same decision as `CharacterFlyweight` in flyweight.

| Area | Impact | Description |
|------|--------|-------------|
| `src/content/patterns/__solutions__/proxy.ts` | New | `Image` abstract class, `HighResImage`, `ImageProxy` with lazy loading |
| `src/content/patterns/__tests__/proxy.test.ts` | New | Vitest behavioral tests + negative + content-shape |
| `src/lib/test-runner/tests/proxy.ts` | New | Serializable criterion checks for sandbox Worker |
| `src/lib/test-runner/registry.ts` | Modified | Add `proxy` lazy-import entry |
| `src/content/guided/proxy.ts` | New | 4-step guided exercise using `buildGuidedExercise` |
| `src/content/guided/index.ts` | Modified | Add `proxyGuided` import + map entry |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `Image` could clash with browser `Image` constructor in Worker | Low | Sandbox runs in isolated Worker; `Image` is user export, not global |
| `abstract class` vs `interface` for Image | Low | Follow flyweight precedent: `abstract class` for runtime `instanceof`; Sucrase strips `interface` |

## Rollback Plan

Remove 5 new files, revert 2 modified files (registry.ts and guided/index.ts). Zero data migration, zero config changes.

## Dependencies

- `flyweight` pattern as implementation template (complete)
- `buildGuidedExercise` from `@/lib/guided-mode/build` (existing)
- `sandbox-test-runner` spec (existing capability)

## Success Criteria

- [ ] `npx vitest run` passes all proxy tests (behavioral + content-shape)
- [ ] `npx tsc --noEmit` compiles with zero errors
- [ ] 4 sandbox criterion checks load via registry and verify behavior
- [ ] All 5 new files + 2 edits follow flyweight pattern conventions exactly
- [ ] `ImageProxy` correctly lazy-inits `realImage` on first `display()` call
