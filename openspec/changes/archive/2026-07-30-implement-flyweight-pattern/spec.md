# Delta for Flyweight Pattern Exercise

## Purpose

This specification defines the complete implementation of the Flyweight design pattern exercise in PatternMaster. The exercise teaches memory optimization through intrinsic/extrinsic state separation using a text-editor domain, following the composite-pattern template.

## ADDED Requirements

### Requirement: Reference Solution

The system SHALL provide a reference solution at `src/content/patterns/__solutions__/flyweight.ts` implementing all 4 acceptance criteria from `flyweight.json`.

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

### Requirement: Vitest Test Suite

The system SHALL provide behavioral tests at `src/content/patterns/__tests__/flyweight.test.ts` validating the reference solution against all acceptance criteria.

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

### Requirement: Sandbox Test Definition

The system SHALL provide a serializable test definition at `src/lib/test-runner/tests/flyweight.ts` that validates user code in the sandbox worker.

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

### Requirement: Registry Integration

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

### Requirement: Guided Mode Exercise

The system SHALL provide a guided exercise at `src/content/guided/flyweight.ts` with 4 incremental steps that teach the Flyweight pattern.

The guided exercise MUST:
- Import `buildGuidedExercise` from `@/lib/guided-mode/build`
- Define 4 steps with `index`, `title`, `explanation`, and `code` (TypeScript + JavaScript)
- Step 0: Define `CharacterFlyweight` abstract class with `render(x, y)`
- Step 1: Implement `ConcreteCharacter` with intrinsic state (char, font, size, color)
- Step 2: Implement `CharacterFactory` with `Map` pool and `getCharacter()` reuse logic
- Step 3: Implement `Document` with extrinsic state tuples and render delegation
- Export as `flyweightGuided`

#### Scenario: Guided step progression

- GIVEN the guided exercise is loaded
- WHEN rendering step 0
- THEN the step shows the `CharacterFlyweight` abstract class definition
- AND the explanation introduces the Flyweight pattern concept (intrinsic vs extrinsic state)

#### Scenario: Pool reuse teaching moment

- GIVEN the user is on step 2
- WHEN the explanation describes the factory pool
- THEN the explanation emphasizes that identical params return the SAME instance
- AND the code demonstrates `getPoolSize()` staying at 1 after repeated identical calls

## Coverage

- **Happy paths**: All 4 acceptance criteria covered with positive scenarios
- **Edge cases**: Pool reuse with identical params, distinct flyweights for different params, extrinsic state separation
- **Error states**: Negative tests for missing pool reuse, missing exports, missing extrinsic state

## Next Step

Ready for design (sdd-design). If design already exists, ready for tasks (sdd-tasks).
