# Design: Implement Bridge Pattern

## Technical Approach

Mirror the `prototype` pattern pipeline exactly: create 5 new artifacts (reference solution, Vitest tests, sandbox test definition, guided mode, guided index entry) and modify 2 registry files. `bridge.json` is already complete with 4 acceptance criteria and starter code; this design fills the executable pipeline around it.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| `Device` as interface vs abstract class | `interface` (idiomatic Bridge) vs `abstract class` (runtime-visible) | Interface is erased by Sucrase — sandbox cannot verify `instanceof Device`. Abstract class preserves runtime presence but is slightly less idiomatic for the "implementation" side of Bridge. | `export abstract class Device` with no-op body + abstract methods; concrete classes `extends Device` so `instanceof` works in worker |
| `RemoteControl` shape | `abstract class` (enforced methods + constructor) vs plain class (less strict) | Abstract class ensures `togglePower()` and `nextChannel()` are declared; sandbox can verify via `instanceof`. | `export abstract class RemoteControl` with `constructor(protected device: Device)` and abstract `togglePower()` / `nextChannel()` |
| AdvancedRemote extra API | `setVolume(v)` + `mute()` vs `setChannel(ch)` only | `setChannel` is already in the structureCode example and easy to test. Adding volume/mute requires Device to support it or AdvancedRemote to manage its own state. | AdvancedRemote adds `setChannel(ch: number)` only (mirrors structureCode); keeps tests deterministic and minimal |
| Speaker implementation | Custom `track` state vs reuse `channel` metaphor | All devices need `setChannel()` per AC. Speaker can map `channel` to `trackNumber` internally. | Speaker stores `private track = 1` and `setChannel(ch)` sets `track`; `getStatus()` returns `Speaker ON/OFF - Track N` |
| Deep-copy vs shallow-copy for device state | Not applicable for Bridge | Bridge does not involve cloning. Device state is mutated directly by remote delegation. | No copy logic needed; state is simple primitives |

## Data Flow

```
User Code Editor ──→ Sucrase stripTS() ──→ Web Worker ──→ eval() + export capture ──→ criteria checks
       │                                                                              │
       └─ bridge.json (metadata, starterCode)                                     └─ PatternTestDef (from registry)
       │
       └─ __solutions__/bridge.ts (reference for Vitest + display)
       │
       └─ guided/bridge.ts (step-by-step incremental code)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/content/patterns/__solutions__/bridge.ts` | Create | Reference solution: `Device` abstract class, `TV`/`Radio`/`Speaker`, `RemoteControl`, `BasicRemote`, `AdvancedRemote` |
| `src/content/patterns/__tests__/bridge.test.ts` | Create | 4 AC describe blocks + content-shape validation + negative tests (missing delegation, wrong inheritance) |
| `src/lib/test-runner/tests/bridge.ts` | Create | `PatternTestDef` with 4 criteria; checks behavior (delegation, `instanceof`, polymorphic mixing) |
| `src/lib/test-runner/registry.ts` | Modify | Add `bridge: () => import("./tests/bridge").then(m => m.bridgeTestDef)` |
| `src/content/guided/bridge.ts` | Create | 4 incremental steps: Device → TV/Radio/Speaker → RemoteControl + BasicRemote → AdvancedRemote + demo |
| `src/content/guided/index.ts` | Modify | Import `bridgeGuided` and add to `guidedExercises` record |

## Interfaces / Contracts

### Reference Solution (`__solutions__/bridge.ts`)

```typescript
export abstract class Device {
  abstract turnOn(): void;
  abstract turnOff(): void;
  abstract setChannel(channel: number): void;
  abstract getStatus(): string;
}

export class TV extends Device {
  private on = false;
  private channel = 1;
  turnOn() { this.on = true; }
  turnOff() { this.on = false; }
  setChannel(ch: number) { this.channel = ch; }
  getStatus() { return `TV ${this.on ? 'ON' : 'OFF'} - Canal ${this.channel}`; }
}

export class Radio extends Device {
  private on = false;
  private station = 88.5;
  turnOn() { this.on = true; }
  turnOff() { this.on = false; }
  setChannel(ch: number) { this.station = ch; }
  getStatus() { return `Radio ${this.on ? 'ON' : 'OFF'} - ${this.station}MHz`; }
}

export class Speaker extends Device {
  private on = false;
  private track = 1;
  turnOn() { this.on = true; }
  turnOff() { this.on = false; }
  setChannel(ch: number) { this.track = ch; }
  getStatus() { return `Speaker ${this.on ? 'ON' : 'OFF'} - Track ${this.track}`; }
}

export abstract class RemoteControl {
  constructor(protected device: Device) {}
  abstract togglePower(): void;
  abstract nextChannel(): void;
}

export class BasicRemote extends RemoteControl {
  togglePower() {
    const s = this.device.getStatus();
    if (s.includes('ON')) this.device.turnOff(); else this.device.turnOn();
  }
  nextChannel() { this.device.setChannel(2); }
}

export class AdvancedRemote extends RemoteControl {
  private channel = 1;
  togglePower() {
    const s = this.device.getStatus();
    if (s.includes('ON')) this.device.turnOff(); else this.device.turnOn();
  }
  nextChannel() { this.channel++; this.device.setChannel(this.channel); }
  setChannel(ch: number) { this.channel = ch; this.device.setChannel(ch); }
}
```

### Sandbox Test Def (`test-runner/tests/bridge.ts`)

- `expectedNamedExports`: `["Device", "TV", "Radio", "Speaker", "RemoteControl", "BasicRemote", "AdvancedRemote"]`
- **Criterion 0** (`index: 0`): `TV`, `Radio`, `Speaker` exist; each has `turnOn`, `turnOff`, `setChannel`, `getStatus`.
- **Criterion 1** (`index: 1`): `RemoteControl` exists; `BasicRemote` extends it; `togglePower` and `nextChannel` delegate to device (status changes after toggle).
- **Criterion 2** (`index: 2`): `AdvancedRemote` extends `RemoteControl`; has `setChannel`; delegation works.
- **Criterion 3** (`index: 3`): Polymorphic mixing — `BasicRemote(new TV())` and `AdvancedRemote(new Radio())` both work; any remote accepts any device.

### Guided Mode (`guided/bridge.ts`)

4 `GuidedStepInput` entries:
- **Step 0**: `Device` abstract class with `turnOn()`, `turnOff()`, `setChannel()`, `getStatus()`.
- **Step 1**: Add `TV`, `Radio`, `Speaker` extending `Device`.
- **Step 2**: Add `RemoteControl` abstract class + `BasicRemote` extending it with delegation.
- **Step 3**: Add `AdvancedRemote` with `setChannel()` + demo mixing any remote with any device.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (Vitest) | AC 0–3 behavioral correctness | Import reference solution; `expect(tv).toBeInstanceOf(Device)`; `remote.togglePower()` changes `device.getStatus()` |
| Unit (Vitest) | Content-shape validation | `fs.readFileSync` on `bridge.json`; assert 4 criteria + non-empty `starterCode` |
| Unit (Vitest) | Negative tests | Class missing `turnOn()` fails `typeof` check; remote that does NOT delegate fails status-change assertion |
| Integration | Sandbox test def against reference solution | Manual: call `runUserTests(referenceCode, bridgeTestDef)` and assert `allPassed === true` |
| E2E (guided) | Diff highlighting correctness | `buildGuidedExercise` computes `computedNewLines` automatically; verify step 3 includes all previous code plus new lines |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. This is a pure content-file addition.

## Migration / Rollout

No migration required. Additive change: 5 new files, 2 registry imports. Rollback = delete new files + revert 2 modified files.

## Open Questions

- [ ] Should `Radio.setChannel()` set `frequency` (as in `bridge.json` structureCode) or a generic `station` variable? **Resolution**: Use `station` (numeric, default 88.5) to keep the code simple and the `setChannel` contract uniform across all devices.
- [ ] Does `AdvancedRemote` need `volumeUp`/`volumeDown` or is `setChannel` sufficient for the exercise? **Resolution**: `setChannel` only — matches `bridge.json` structureCode and keeps acceptance criteria testable without over-engineering.
