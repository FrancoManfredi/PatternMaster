# Design: Implement Flyweight Pattern

## Technical Approach

Clone the composite blueprint exactly: create 5 new artifacts (reference solution, Vitest tests, sandbox test definition, guided exercise, guided index entry) and modify 2 registry files. `flyweight.json` already has 4 acceptance criteria and starter code; this design fills the executable pipeline around it.

## Architecture Decisions

### Decision: `CharacterFlyweight` as abstract class vs interface

| Option | Tradeoff | Decision |
|---|---|---|
| `interface` (idiomatic) | Erased by Sucrase — sandbox cannot verify `instanceof` | Rejected |
| `abstract class` | Runtime-visible, allows `instanceof` checks; less idiomatic for the "interface" role | **Chosen** |

### Decision: `Document` factory coupling

| Option | Tradeoff | Decision |
|---|---|---|
| Internal factory (`private factory = new CharacterFactory()`) | Matches starter code and educational examples exactly; harder to verify reuse in `Document` tests | **Chosen** |
| Injectable factory (constructor param) | Better testability but diverges from starter code | Rejected |
| Expose `getPoolSize()` on `Document` | Leaks abstraction; not in acceptance criteria | Rejected |

## Data Flow

```
User Code Editor ──→ Sucrase stripTS() ──→ Web Worker ──→ eval() + export capture ──→ criteria checks
       │                                                                              │
       └─ flyweight.json (metadata, starterCode)                                  └─ PatternTestDef
       │
       └─ __solutions__/flyweight.ts (reference for Vitest + display)
       │
       └─ guided/flyweight.ts (step-by-step incremental code)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/content/patterns/__solutions__/flyweight.ts` | Create | Reference solution: `CharacterFlyweight`, `ConcreteCharacter`, `CharacterFactory`, `Document` |
| `src/content/patterns/__tests__/flyweight.test.ts` | Create | 4 AC describe blocks + content-shape validation + negative tests |
| `src/lib/test-runner/tests/flyweight.ts` | Create | `PatternTestDef` with 4 criteria checks |
| `src/lib/test-runner/registry.ts` | Modify | Add `flyweight` lazy-import entry |
| `src/content/guided/flyweight.ts` | Create | 4-step `buildGuidedExercise` |
| `src/content/guided/index.ts` | Modify | Register `flyweightGuided` import + map entry |

## Interfaces / Contracts

### Reference Solution (`__solutions__/flyweight.ts`)

```typescript
export abstract class CharacterFlyweight {
  abstract render(x: number, y: number): void;
}

export class ConcreteCharacter extends CharacterFlyweight {
  constructor(
    private char: string,
    private font: string,
    private size: number,
    private color: string
  ) { super(); }
  render(x: number, y: number) {
    console.log(`Render '${this.char}' at (${x},${y}) with ${this.font} ${this.size}px ${this.color}`);
  }
}

export class CharacterFactory {
  private pool = new Map<string, CharacterFlyweight>();
  getCharacter(char: string, font: string, size: number, color: string): CharacterFlyweight {
    const key = `${char}-${font}-${size}-${color}`;
    if (!this.pool.has(key)) {
      this.pool.set(key, new ConcreteCharacter(char, font, size, color));
    }
    return this.pool.get(key)!;
  }
  getPoolSize(): number { return this.pool.size; }
}

export class Document {
  private characters: Array<{ flyweight: CharacterFlyweight; x: number; y: number }> = [];
  private factory = new CharacterFactory();
  addCharacter(char: string, x: number, y: number, font: string, size: number, color: string) {
    const flyweight = this.factory.getCharacter(char, font, size, color);
    this.characters.push({ flyweight, x, y });
  }
  render() {
    this.characters.forEach(({ flyweight, x, y }) => flyweight.render(x, y));
  }
}
```

### Sandbox Test Def (`test-runner/tests/flyweight.ts`)

- `expectedNamedExports`: `["CharacterFlyweight", "ConcreteCharacter", "CharacterFactory", "Document"]`
- **Criterion 0**: `CharacterFlyweight` exists; `ConcreteCharacter` is `instanceof` it; `render` is a function.
- **Criterion 1**: `ConcreteCharacter` stores intrinsic state; `render(10, 20)` executes without throwing.
- **Criterion 2**: `CharacterFactory` reuses flyweights (`getCharacter` same params returns same instance); `getPoolSize()` tracks count correctly.
- **Criterion 3**: `Document` has `addCharacter` and `render`; `render()` does not throw; `addCharacter` accepts all required parameters.

### Guided Mode (`guided/flyweight.ts`)

4 `GuidedStepInput` entries:
- **Step 0**: `CharacterFlyweight` abstract class with `render(x, y)`.
- **Step 1**: `ConcreteCharacter` leaf with intrinsic state (`char`, `font`, `size`, `color`).
- **Step 2**: `CharacterFactory` with `Map` pool, `getCharacter()`, and `getPoolSize()`.
- **Step 3**: `Document` with extrinsic positions + demo showing pool reuse.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit (Vitest) | AC 0–3 behavioral correctness | `instanceof` checks; `render()` non-throwing; `getPoolSize()` after reuse; `Document.render()` delegation |
| Unit (Vitest) | Content-shape validation | `fs.readFileSync` on `flyweight.json`; assert 4 criteria + non-empty `starterCode` |
| Unit (Vitest) | Negative tests | Broken factory returns new instances; broken document bypasses factory |
| Integration | Sandbox test def against reference | `runUserTests(referenceCode, flyweightTestDef)` asserts `allPassed === true` |
| E2E (guided) | Diff highlighting | `buildGuidedExercise` computes `computedNewLines`; verify step 3 includes full demo |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Additive change: 5 new files, 2 registry imports. Rollback = delete new files + revert 2 modified files.

## Open Questions

- [ ] Should `Document` expose the factory or accept it via constructor to improve testability? **Resolution**: Keep internal factory to match starter code; test `CharacterFactory` directly and `Document` behavior separately.
- [ ] Does `render()` need to return `string` instead of `void` for better testability? **Resolution**: Keep `void` to match starter code; sandbox checks verify existence and non-throwing execution only.
