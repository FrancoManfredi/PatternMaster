# Design: Implement Proxy Pattern

## Technical Approach

Mirror the `flyweight` pattern implementation exactly: reference solution → Vitest tests → sandbox test definition → registry entry → guided mode → guided index. The `proxy.json` exercise defines 4 acceptance criteria (ACs) around a virtual proxy for lazy-loading images. We implement an `Image` abstract class (not interface, to preserve runtime `instanceof` under Sucrase), `HighResImage` as the expensive real object, and `ImageProxy` as the lazy-loading surrogate.

## Architecture Decisions

### Decision: Image as abstract class vs interface

| Option | Tradeoff | Decision |
|--------|----------|----------|
| `interface Image` | Clean TS, erased by Sucrase; `instanceof` breaks in sandbox | **Rejected** |
| `abstract class Image` | Survives transpilation; `instanceof` works in Worker; consistent with flyweight | **Chosen** |

### Decision: Lazy-load trigger point

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Lazy-init in `getInfo()` | Would defer load until info is read, but breaks "0 images loaded at startup" demo | **Rejected** |
| Lazy-init in `display()` | Clear pattern semantics: visual consumption triggers creation; matches AC3 exactly | **Chosen** |

## Data Flow

```
proxy.json (ACs) ──→ __solutions__/proxy.ts (reference)
        │
        ├──→ __tests__/proxy.test.ts (Vitest behavioral + negative)
        │
        ├──→ lib/test-runner/tests/proxy.ts (sandbox checks)
        │         │
        │         └────→ registry.ts (lazy-import "proxy")
        │
        └──→ content/guided/proxy.ts (4 steps)
                    │
                    └────→ guided/index.ts (map entry)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/content/patterns/__solutions__/proxy.ts` | Create | `Image` abstract class, `HighResImage`, `ImageProxy` |
| `src/content/patterns/__tests__/proxy.test.ts` | Create | 4 AC test suites + content-shape + negative tests |
| `src/lib/test-runner/tests/proxy.ts` | Create | `PatternTestDef` with 4 criterion checks for Worker |
| `src/lib/test-runner/registry.ts` | Modify | Add `proxy` lazy-import entry |
| `src/content/guided/proxy.ts` | Create | 4-step guided exercise via `buildGuidedExercise` |
| `src/content/guided/index.ts` | Modify | Import `proxyGuided` + add to `guidedExercises` map |

## Interfaces / Contracts

```typescript
// src/content/patterns/__solutions__/proxy.ts
export abstract class Image {
  abstract display(): void;
  abstract getInfo(): string;
}

export class HighResImage extends Image {
  constructor(private filename: string) { /* simulated load */ }
  display(): void { /* show image */ }
  getInfo(): string { /* filename + status */ }
}

export class ImageProxy extends Image {
  private realImage: HighResImage | null = null;
  constructor(private filename: string) {}
  display(): void { /* lazy-init realImage, then delegate */ }
  getInfo(): string { /* proxy info or delegate */ }
}
```

Sandbox contract (`CriterionCheck.check` strings) verifies behavior via `exports.Image`, `exports.HighResImage`, `exports.ImageProxy`, checking `instanceof`, lazy-init timing, and gallery creation without loading.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | AC1–AC4 behavior | Vitest `describe` per AC; `expect().toBeInstanceOf()`, `toBe()` for reference equality |
| Integration | Sandbox criterion checks | `proxyTestDef` loaded via `registry.ts`; Worker evaluates JS expression strings |
| E2E | Content-shape | Validate `proxy.json` has 4 ACs and non-empty `starterCode` |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Feature is additive: 5 new files + 2 registry/index edits. Rollback removes new files and reverts the two edits.

## Open Questions

- None.
