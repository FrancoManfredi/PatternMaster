# Design: Pilot Test for Factory Method Exercise

## Technical Approach

Build a reference solution and a Vitest test suite that codifies the Factory Method exercise acceptance criteria. The reference module exports the exact contracts a correct implementation must satisfy. The test file imports the reference and asserts structural, behavioral, and content-shape criteria. Negative tests verify failure when criteria are violated by injecting broken inline implementations. This approach maps directly to the spec's 8 requirements and 16 scenarios.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| File location | `src/content/patterns/__solutions__/` and `__tests__/` co-located with JSON | Keeps pattern content together. Scaling to other 21 patterns is mechanical: add `{slug}.ts` and `{slug}.test.ts`. |
| No infra changes | None needed | Vitest, jsdom, and `@/` alias are already configured. No `vitest.config.ts` or `package.json` edits. |
| Reference as contract | Reference solution defines "correct" | Tests import the reference and assert against its exports. This creates a deterministic, reproducible contract rather than LLM judgment. |
| Pattern-agnostic naming | `__solutions__/{slug}.ts` + `__tests__/{slug}.test.ts` | Enables future automation. A script can later discover tests by globbing `src/content/patterns/__tests__/*.test.ts`. |
| Test isolation | Fresh instances per test | Every test creates its own factory/service instances. No shared mutable module state. |
| Negative testing | Inline broken implementations | Each negative test defines a local "bad" class/factory that omits one criterion, then asserts the failure. No file mutations. |

## Data Flow

```
factory-method.json
  └─ exercise.acceptanceCriteria[]  → drives test structure & content-shape assertions

Reference solution (factory-method.ts)
  └─ exports Notification, EmailNotification, SMSNotification, PushNotification
  └─ exports NotificationFactory, NotificationService
       └─ imported by test file
            └─ Vitest assertions per export
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/content/patterns/__solutions__/factory-method.ts` | Create | Canonical implementation matching all 4 acceptance criteria |
| `src/content/patterns/__tests__/factory-method.test.ts` | Create | Structural, behavioral, negative, and content-shape tests |

## Interfaces / Contracts

Reference solution exports:

```typescript
export interface Notification {
  send(message: string): void;
}

export class EmailNotification implements Notification { … }
export class SMSNotification implements Notification { … }
export class PushNotification implements Notification { … }

export class NotificationFactory {
  createNotification(type: string): Notification { … }
}

export class NotificationService {
  constructor(private factory: NotificationFactory) {}
  notify(type: string, message: string): void { … }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Structural | Interface exists, classes implement it, factory method returns correct types | `typeof` checks, `instanceof`, `expect(x).toBeInstanceOf(Notification)` |
| Behavioral | Factory dispatches by string type; service delegates `notify()` to product's `send()` | Instantiate with `"email"`, `"sms"`, `"push"`; spy/mock `send` or check console output |
| Negative | Tests fail when criteria violated | Inline broken factory (returns plain object), broken service (ignores factory), assert `toThrow` or `not.toBeInstanceOf` |
| Content-shape | JSON has valid `exercise.acceptanceCriteria` array | `fs.readFileSync` or JSON import; assert `Array.isArray` and length `>= 4` |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. Adding the two files is a pure additive change. Rollback is `git rm` the two files.

## Open Questions

- [ ] Should `send()` in the reference use `console.log` for observable side effects, or should behavioral tests rely on method-call spies?
- [ ] For negative tests, is `toThrow` sufficient, or do we need to assert specific error messages?
