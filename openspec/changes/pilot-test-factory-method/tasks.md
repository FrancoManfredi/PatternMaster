# Tasks: Pilot Test for Factory Method Exercise

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~150-200 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Reference solution + test suite | PR 1 | `npx vitest run src/content/patterns/__tests__/factory-method.test.ts` | N/A — pure unit tests, no runtime scenario | Delete both new files |

## Phase 1: Reference Solution

- [x] 1.1 Create `src/content/patterns/__solutions__/factory-method.ts` exporting `Notification` interface with `send(message: string): void`
- [x] 1.2 Add `EmailNotification`, `SMSNotification`, `PushNotification` classes implementing `Notification` — each stores/logs the message
- [x] 1.3 Add `NotificationFactory` class with `createNotification(type: string): Notification` mapping "email"/"sms"/"push" to correct class, throwing on unknown type
- [x] 1.4 Add `NotificationService` class with `constructor(factory: NotificationFactory)` and `notify(type, message)` delegating to factory then calling `send()`

## Phase 2: Test Suite

- [x] 2.1 Create `src/content/patterns/__tests__/factory-method.test.ts` with `describe("Factory Method Exercise")` root block importing from `@/content/patterns/__solutions__/factory-method`
- [x] 2.2 Add "Acceptance Criterion 1: Notification interface" — assert `Notification` is exported as type, has `send` method signature
- [x] 2.3 Add "Acceptance Criterion 2: Concrete implementations" — assert each class implements `Notification`, each has callable `send()`, use `vi.spyOn` for behavioral observation
- [x] 2.4 Add "Acceptance Criterion 3: NotificationFactory" — assert correct type returned for "email"/"sms"/"push", assert `toThrow` for unknown type
- [x] 2.5 Add "Acceptance Criterion 4: NotificationService" — assert constructor takes factory, `notify` delegates to factory and calls `send` on result, works for all types
- [x] 2.6 Add "Content-shape validation" — import `factory-method.json`, assert `exercise.acceptanceCriteria` is array with >= 4 entries, `exercise.starterCode` is non-empty string
- [x] 2.7 Add "Negative tests" — inline broken implementations (missing interface, wrong factory return type), assert tests fail as expected

## Phase 3: Verification

- [x] 3.1 Run `npx vitest run src/content/patterns/__tests__/factory-method.test.ts` — all tests pass
- [x] 3.2 Verify negative tests fail when expected (temporarily break reference solution to confirm)
