# Sandbox Test Runner Specification

## Purpose

Client-side sandbox execution engine that evaluates user TypeScript code against per-pattern acceptance criteria in a Web Worker. Provides deterministic pass/fail results per criterion and degrades gracefully when the Worker API is unavailable.

## Requirements

### Requirement: Sandbox Isolation

User code MUST execute inside a Web Worker with network APIs blocked (fetch, XHR, WebSocket). The worker MUST be terminated within 5 seconds if execution exceeds the timeout.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Code within time limit | valid user code | worker executes | results returned before 5s timeout |
| Code exceeds timeout | user code with infinite loop | 5 seconds elapse | worker terminated, all criteria fail with timeout message |
| Network API blocked | user code calls `fetch()` | code runs in worker | fetch is undefined/blocked, no network request is made |

### Requirement: Code Evaluation

The runner MUST strip TypeScript type annotations and evaluate the resulting JavaScript. It MUST extract named exports by exact name. If a required symbol is missing, the criterion MUST fail with "No se encontró: {symbolName}".

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Valid TS code | user submits typed code | runner strips annotations and evaluates | exports extracted correctly |
| Missing export | required symbol `NotificationFactory` not in code | runner extracts exports | criterion fails with "No se encontró: NotificationFactory" |

### Requirement: Pattern Test Definition

Each pattern defines tests as a serializable `PatternTestDef`. Each criterion has a JS expression (`check`) evaluated in the worker context with access to `exports` and `assert()`.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Criterion check passes | check expression evaluates truthy | runner processes result | criterion marked as passed |
| Criterion check throws | check expression throws | runner catches error | criterion marked as failed with error message |

### Requirement: Structured Test Result

The runner MUST return a `TestSuiteResult` with per-criterion pass/fail and user-friendly error messages. Raw stack traces MUST NOT be exposed to the user.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| All pass | all criteria checks succeed | result returned | each criterion shows passed status |
| Mixed results | some criteria fail | result returned | failed criteria show friendly error, no stack traces |

### Requirement: UI Integration

The TestSuiteStatus component MUST show real-time status icons: ⏳ pending → 🔄 running → ✅ passed / ❌ failed. Failed criteria MUST display the error message.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Initial state | user opens exercise | component renders | all criteria show ⏳ pending |
| Running | user clicks "Ejecutar Tests" | tests executing | criteria show 🔄 running |
| Completed | tests finish | results rendered | ✅ or ❌ per criterion, error messages visible for failures |

### Requirement: Graceful Degradation

If the Worker API is unavailable OR the language is not TypeScript/JavaScript, sandbox tests MUST be skipped without crashing.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| No Worker support | old browser without Worker API | sandbox runner invoked | tests skipped, no crash, message shown to user |
| Non-TS language | user writes Python code | sandbox runner invoked | tests skipped, message: "Solo TypeScript/JavaScript tienen tests automaticos por ahora" |

### Requirement: Transpilation Failure

If user code has syntax errors preventing evaluation, the runner MUST return all criteria as failed with: "Tu código no compila: {error details}".

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Syntax error | user code has unclosed brace | runner attempts evaluation | all criteria fail with "Tu código no compila: ..." message |

### Requirement: Sandbox Test Definition — Flyweight Pattern

For the Flyweight pattern exercise, the system SHALL provide a serializable test definition at `src/lib/test-runner/tests/flyweight.ts` that validates user code in the sandbox worker.

The test definition MUST:
- Export `flyweightTestDef` of type `PatternTestDef`
- Define `expectedNamedExports: ["CharacterFlyweight", "ConcreteCharacter", "CharacterFactory", "Document"]`
- Include 4 criterion checks with JavaScript expression strings
- Use `exports` and `assert()` helper in check expressions
- Verify pool reuse behavior and extrinsic state separation

#### Scenario: Criterion 0 — CharacterFlyweight and ConcreteCharacter

- GIVEN user code with exported classes
- WHEN the sandbox evaluates criterion 0 check
- THEN the check verifies `ConcreteCharacter` is `instanceof CharacterFlyweight`
- AND `new ConcreteCharacter('A', 'Arial', 12, '#000').render(0, 0)` executes without error

#### Scenario: Criterion 2 — Factory pool reuse

- GIVEN user code with `CharacterFactory`
- WHEN the sandbox evaluates criterion 2 check
- THEN the check creates a factory, calls `getCharacter()` twice with identical params
- AND asserts both returns are `===` (same reference)
- AND the check fails if a new instance is created each time

#### Scenario: Missing exports handling

- GIVEN user code missing one of the required exports
- WHEN the sandbox test definition is loaded
- THEN `expectedNamedExports` ensures the worker validates export presence
- AND criteria checks fail gracefully with descriptive `failureMessage`

### Requirement: Registry Integration — Flyweight Pattern

The system SHALL register the Flyweight test definition in `src/lib/test-runner/registry.ts` using lazy loading, AND register the guided exercise in `src/content/guided/index.ts`.

#### Scenario: Test registry lookup

- GIVEN the registry includes the flyweight entry
- WHEN calling `getTestDef("flyweight")`
- THEN the function returns a non-undefined loader function
- AND calling the loader returns a Promise resolving to `flyweightTestDef`

#### Scenario: Guided index registration

- GIVEN the guided index file
- WHEN calling `getGuidedExercise("flyweight")`
- THEN the function returns the `flyweightGuided` exercise
