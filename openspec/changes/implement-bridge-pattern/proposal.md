# Proposal: Implement Bridge Pattern

## Intent

Bridge is one of the structural patterns missing **all** exercise infrastructure: no reference solution, no Vitest tests, no sandbox test definition, no registry entry, and no guided mode. This change fills every gap, bringing Bridge to parity with prototype (most recent complete pattern).

## Scope

### In Scope
- **Reference solution**: `__solutions__/bridge.ts` implementing 4 acceptance criteria (Device interface, TV/Radio/Speaker, RemoteControl abstraction, BasicRemote + AdvancedRemote)
- **Vitest tests**: `__tests__/bridge.test.ts` — behavioral tests per AC + negative tests + content-shape validation
- **Sandbox test definition**: `lib/test-runner/tests/bridge.ts` — 4 criterion checks verifying behavior, not implementation
- **Registry entry**: add `bridge` lazy-import to `lib/test-runner/registry.ts`
- **Guided mode**: `content/guided/bridge.ts` — 4 progressive steps with `buildGuidedExercise`
- **Guided index**: add `bridgeGuided` import + map entry to `content/guided/index.ts`

### Out of Scope
- Editing `bridge.json` (already complete)
- New capability specs (uses existing `pattern-exercise-tests` and `sandbox-test-runner`)

## Capabilities

### New Capabilities
- None — this uses existing test infrastructure.

### Modified Capabilities
- **pattern-exercise-tests**: adding Bridge reference solution and behavioral test suite
- **sandbox-test-runner**: adding Bridge test definition + registry entry

## Approach

Mirror the `prototype` pattern exactly: `__solutions__` → `__tests__` → sandbox test def → registry → guided mode → guided index. The `Device` interface + `RemoteControl` abstract class pattern follows bridge.json acceptance criteria. All lazy imports follow the established registry convention.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/content/patterns/__solutions__/bridge.ts` | New | Reference solution: Device interface, TV/Radio/Speaker, RemoteControl/BasicRemote/AdvancedRemote |
| `src/content/patterns/__tests__/bridge.test.ts` | New | Vitest behavioral tests with negative tests + content-shape validation |
| `src/lib/test-runner/tests/bridge.ts` | New | Serializable criterion checks for sandbox Worker |
| `src/lib/test-runner/registry.ts` | Modified | Add `bridge` lazy-import entry |
| `src/content/guided/bridge.ts` | New | 4-step guided exercise using `buildGuidedExercise` |
| `src/content/guided/index.ts` | Modified | Add `bridgeGuided` import + map entry |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Device interface could clash with Web Worker `navigator` API | Low | Sandbox runs in isolated Worker; `Device` is user export, not global |
| `abstract class` vs `interface` choice for Device/RmoteControl | Low | Follow prototype precedent: use `abstract class` for runtime `instanceof` checks (Sucrase strips `interface`) |

## Rollback Plan

Remove the 5 new files, revert the 2 modified files (registry.ts and guided/index.ts). Zero data migration, zero config changes.

## Dependencies

- `prototype` pattern as implementation template (complete)
- `buildGuidedExercise` from `@/lib/guided-mode/build` (existing)
- `sandbox-test-runner` spec (existing capability)

## Success Criteria

- [ ] `npx vitest run` passes all bridge tests (behavioral + content-shape)
- [ ] `npx tsc --noEmit` compiles with zero errors
- [ ] 4 sandbox criterion checks load via registry and verify behavior (not implementation)
- [ ] All 5 new files + 2 edits follow prototype pattern conventions exactly
