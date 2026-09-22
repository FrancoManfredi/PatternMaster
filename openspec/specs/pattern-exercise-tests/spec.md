# Pattern Exercise Tests Specification

## Purpose

Pattern exercise tests define the behavioral contract for coding exercise solutions. Each pattern gets a reference solution (canonical correct implementation) and a behavioral test file that verifies the solution meets all acceptance criteria. These tests establish what "correct" means for each exercise, replacing LLM-only judgment with deterministic, spec-based validation.

## Requirements

### Requirement: Reference Solution Contract

The system MUST provide a reference solution module for each pattern exercise that correctly implements all acceptance criteria defined in the exercise JSON.

The reference solution MUST be a valid TypeScript module that:
- Exports all required interfaces, classes, and functions
- Implements the pattern according to the acceptance criteria
- Uses correct TypeScript syntax and type annotations
- Is importable via the `@/` path alias

#### Scenario: Reference solution satisfies all acceptance criteria

- GIVEN a pattern exercise with N acceptance criteria in its JSON definition
- WHEN the reference solution module is loaded and executed
- THEN all N acceptance criteria are satisfied by the reference solution
- AND the module exports all required symbols (interfaces, classes, functions)

#### Scenario: Reference solution uses correct path alias

- GIVEN a reference solution at `src/content/patterns/__solutions__/{pattern-slug}.ts`
- WHEN the solution is imported in a test file
- THEN the import uses the `@/` path alias (e.g., `import { ... } from '@/content/patterns/__solutions__/{pattern-slug}'`)
- AND the import resolves successfully without errors

### Requirement: Behavioral Test Coverage

The system MUST provide a behavioral test file for each pattern exercise that verifies each acceptance criterion programmatically.

The test file MUST:
- Import the reference solution
- Contain at least one test case per acceptance criterion
- Use descriptive test names that reference the criterion being tested
- Pass when run against the reference solution
- Use Vitest as the test framework

#### Scenario: All acceptance criteria have corresponding tests

- GIVEN a pattern exercise with acceptance criteria `[C1, C2, ..., CN]`
- WHEN the behavioral test file is executed
- THEN there exists at least one test case that verifies C1
- AND there exists at least one test case that verifies C2
- AND there exists at least one test case that verifies CN
- AND all tests pass

#### Scenario: Test names reference acceptance criteria

- GIVEN a behavioral test file for a pattern exercise
- WHEN the test file is inspected
- THEN each test name clearly indicates which acceptance criterion it verifies
- AND test names are human-readable and descriptive

### Requirement: Structural Validation

The system MUST verify that the reference solution contains the key structural elements required by the pattern.

Structural validation MUST check:
- Required interfaces exist and have the correct method signatures
- Required classes exist and implement the correct interfaces
- Required factory/creator methods exist and return the correct types
- Type relationships (implements, extends) are correct

#### Scenario: Interface structure validation

- GIVEN an acceptance criterion requiring interface `X` with method `y()`
- WHEN structural validation tests are executed
- THEN the test verifies interface `X` exists
- AND the test verifies method `y()` is defined on interface `X`
- AND the test verifies the method signature matches the specification

#### Scenario: Class implementation validation

- GIVEN an acceptance criterion requiring class `A` to implement interface `B`
- WHEN structural validation tests are executed
- THEN the test verifies class `A` exists
- AND the test verifies class `A` implements interface `B`
- AND the test verifies all required methods are present

### Requirement: Negative Testing

The system MUST verify that tests fail when an acceptance criterion is violated.

Negative testing MUST:
- Create mutated versions of the reference solution that violate specific criteria
- Verify that the corresponding tests fail for each mutation
- Ensure tests are sensitive to criterion violations (not trivially passing)

#### Scenario: Test fails when interface is missing

- GIVEN a reference solution with interface `Notification` and method `send()`
- WHEN a mutated version removes the `send()` method
- AND the behavioral tests are executed against the mutated version
- THEN at least one test fails
- AND the failure indicates the missing method

#### Scenario: Test fails when factory returns wrong type

- GIVEN a factory that should return `EmailNotification` for type "email"
- WHEN a mutated factory returns `SMSNotification` instead
- AND the behavioral tests are executed against the mutated version
- THEN the test verifying factory return types fails
- AND the failure indicates the incorrect return type

### Requirement: Content-Shape Validation

The system SHOULD validate that the exercise JSON has the correct structure for acceptance criteria.

Content-shape validation MUST check:
- The `exercise.acceptanceCriteria` field exists
- It is a non-empty array of strings
- Each criterion is a non-empty string

#### Scenario: Valid exercise JSON structure

- GIVEN an exercise JSON file with valid acceptance criteria
- WHEN content-shape validation is executed
- THEN the validation passes
- AND no errors are reported

#### Scenario: Invalid exercise JSON structure

- GIVEN an exercise JSON file where `acceptanceCriteria` is an empty array
- WHEN content-shape validation is executed
- THEN the validation fails
- AND an error indicates the acceptance criteria array is empty

### Requirement: Factory Method Specific Validation

For the Factory Method pattern exercise, the system MUST verify the four acceptance criteria:
1. A `Notification` interface with a `send()` method exists
2. `EmailNotification`, `SMSNotification`, and `PushNotification` classes implement `Notification`
3. A `NotificationFactory` returns the correct implementation based on type
4. `NotificationService` uses the factory instead of direct instantiation

#### Scenario: Notification interface exists with send method

- GIVEN the Factory Method reference solution
- WHEN structural tests are executed
- THEN the `Notification` interface is exported
- AND the interface defines a `send()` method
- AND the `send()` method accepts appropriate parameters

#### Scenario: Concrete notification classes implement interface

- GIVEN the Factory Method reference solution
- WHEN implementation tests are executed
- THEN `EmailNotification` implements `Notification`
- AND `SMSNotification` implements `Notification`
- AND `PushNotification` implements `Notification`
- AND each class provides a concrete `send()` implementation

#### Scenario: Factory returns correct notification type

- GIVEN the Factory Method reference solution
- WHEN factory behavior tests are executed
- THEN `NotificationFactory` returns an `EmailNotification` instance when type is "email"
- AND `NotificationFactory` returns an `SMSNotification` instance when type is "sms"
- AND `NotificationFactory` returns a `PushNotification` instance when type is "push"
- AND all returned instances implement the `Notification` interface

#### Scenario: NotificationService uses factory

- GIVEN the Factory Method reference solution
- WHEN integration tests are executed
- THEN `NotificationService` accepts a notification type parameter
- AND `NotificationService` uses `NotificationFactory` to create notification instances
- AND `NotificationService` does not directly instantiate concrete notification classes
- AND calling `NotificationService.notify()` with different types produces correct notification instances

### Requirement: Test Isolation

The system MUST ensure that each test is independent and does not rely on execution order or shared mutable state.

Test isolation MUST guarantee:
- Each test can run in isolation
- Tests do not modify shared state that affects other tests
- Test execution order does not affect results
- Each test sets up its own preconditions

#### Scenario: Tests run in random order

- GIVEN a behavioral test file with N test cases
- WHEN the tests are executed in random order multiple times
- THEN all tests pass in every execution
- AND no test depends on state from a previous test

#### Scenario: Test failure does not cascade

- GIVEN a behavioral test file where one test fails
- WHEN the test suite is executed
- THEN only the failing test reports failure
- AND other tests are not affected by the failure
- AND the failure message clearly identifies the failing test

### Requirement: Path Alias Configuration

The system MUST use the `@/` path alias for importing reference solutions in test files.

The path alias MUST:
- Be configured in `tsconfig.json` with `@/` mapping to `./src`
- Be recognized by Vitest via the existing configuration
- Allow imports like `import { X } from '@/content/patterns/__solutions__/pattern-slug'`

#### Scenario: Path alias resolves correctly in tests

- GIVEN a test file that imports from `@/content/patterns/__solutions__/factory-method`
- WHEN the test file is executed by Vitest
- THEN the import resolves to `./src/content/patterns/__solutions__/factory-method.ts`
- AND the imported symbols are accessible
- AND no module resolution errors occur

### Requirement: Reference Solution — Flyweight Pattern

For the Flyweight pattern exercise, the system SHALL provide a reference solution implementing 4 acceptance criteria from `flyweight.json`.

The solution MUST use `abstract class CharacterFlyweight` (not `interface` — Sucrase strips interfaces at runtime, breaking `instanceof` checks in the sandbox Worker) and export:
- `CharacterFlyweight` — abstract class with `render(x: number, y: number): void`
- `ConcreteCharacter` — flyweight class with intrinsic state (`char`, `font`, `size`, `color`), implementing `render(x, y)`
- `CharacterFactory` — factory with `pool: Map<string, CharacterFlyweight>`, `getCharacter(char, font, size, color)`, and `getPoolSize(): number`
- `Document` — client class with `characters: Array<{ flyweight, x, y }>`, `addCharacter()`, and `render()`

#### Scenario: CharacterFlyweight abstract contract

- GIVEN the reference solution file exists
- WHEN importing `CharacterFlyweight`, `ConcreteCharacter`, `CharacterFactory`, `Document`
- THEN `ConcreteCharacter` is `instanceof CharacterFlyweight`
- AND all four exports expose their documented methods

#### Scenario: ConcreteCharacter renders at position

- GIVEN a `ConcreteCharacter` created with `char='A'`, `font='Arial'`, `size=12`, `color='#000'`
- WHEN calling `render(10, 20)`
- THEN the render method outputs the character at position (10, 20) with the intrinsic properties

#### Scenario: CharacterFactory reuses flyweights with identical keys

- GIVEN a `CharacterFactory` instance
- WHEN calling `getCharacter('A', 'Arial', 12, '#000')` twice
- THEN both calls return the same `CharacterFlyweight` instance (reference equality)
- AND `getPoolSize()` returns `1`

#### Scenario: CharacterFactory creates distinct flyweights for different params

- GIVEN a `CharacterFactory` instance
- WHEN calling `getCharacter('A', 'Arial', 12, '#000')` and `getCharacter('B', 'Arial', 12, '#000')`
- THEN the two calls return different `CharacterFlyweight` instances
- AND `getPoolSize()` returns `2`

#### Scenario: Document stores extrinsic state and delegates rendering

- GIVEN a `Document` with 3 characters added at different positions using the same font/size/color
- WHEN calling `render()`
- THEN each character's flyweight is called with its own (x, y) extrinsic position
- AND `factory.getPoolSize()` is `1` (all share the same flyweight)

### Requirement: Vitest Test Suite — Flyweight Pattern

For the Flyweight pattern exercise, the system SHALL provide behavioral tests at `src/content/patterns/__tests__/flyweight.test.ts` validating the reference solution against all acceptance criteria.

The test suite MUST include:
- One `describe` block per acceptance criterion (4 blocks)
- A `describe` block validating `flyweight.json` content shape (4 criteria, starterCode present)
- Negative test cases: missing pool reuse, missing extrinsic state separation

#### Scenario: Criterion 1 — CharacterFlyweight definition

- GIVEN the reference solution is imported
- WHEN running the "Acceptance Criterion 1" test block
- THEN tests verify `ConcreteCharacter` extends `CharacterFlyweight`
- AND `render(x, y)` is a callable method

#### Scenario: Criterion 3 — Factory pool reuse

- GIVEN a `CharacterFactory` instance
- WHEN running the "Acceptance Criterion 3" test block
- THEN tests verify `getCharacter()` returns the same instance for identical params
- AND `getPoolSize()` reflects unique combinations only

#### Scenario: Content-shape validation

- GIVEN the `flyweight.json` file
- WHEN running the content-shape test block
- THEN `exercise.acceptanceCriteria` has exactly 4 entries
- AND `exercise.starterCode` is a non-empty string
