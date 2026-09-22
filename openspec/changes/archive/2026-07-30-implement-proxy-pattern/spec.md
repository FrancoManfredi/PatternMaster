# Delta for Proxy Pattern Exercise

## Purpose

This specification defines the complete implementation of the Proxy design pattern exercise in PatternMaster. The exercise teaches lazy loading and access control through a virtual proxy for expensive image resources, following the flyweight-pattern template.

## ADDED Requirements

### Requirement: Reference Solution

The system SHALL provide a reference solution at `src/content/patterns/__solutions__/proxy.ts` implementing all 4 acceptance criteria from `proxy.json`.

The solution MUST use `abstract class Image` (not `interface` — Sucrase strips interfaces at runtime, breaking `instanceof` checks in the sandbox Worker) and export:
- `Image` — abstract class with `display(): void` and `getInfo(): string`
- `HighResImage` — real subject class with `filename: string` and `loaded: boolean`, simulating expensive construction, implementing `display()` and `getInfo()`
- `ImageProxy` — proxy class with `filename: string` and `realImage: Image | null`, lazy-initializing `realImage` on first `display()` call, implementing `display()` and `getInfo()`

#### Scenario: Image abstract contract

- GIVEN the reference solution file exists
- WHEN importing `Image`, `HighResImage`, `ImageProxy`
- THEN `HighResImage` and `ImageProxy` are both `instanceof Image`
- AND all three exports expose their documented methods

#### Scenario: HighResImage simulates expensive loading

- GIVEN a `HighResImage` created with `filename='foto1.jpg'`
- WHEN the constructor executes
- THEN the image records its filename and marks itself as loaded
- AND `display()` outputs the image being shown
- AND `getInfo()` returns a string containing the filename and loaded status

#### Scenario: ImageProxy lazy-inits realImage on first display

- GIVEN an `ImageProxy` created with `filename='foto1.jpg'`
- WHEN `display()` is called for the first time
- THEN `realImage` is `null` before the call and a `HighResImage` instance after
- AND the proxy delegates `display()` to the newly created `HighResImage`

#### Scenario: ImageProxy reuses realImage on subsequent calls

- GIVEN an `ImageProxy` that has already had `display()` called once
- WHEN `display()` is called again
- THEN no new `HighResImage` is created (same reference as first call)

#### Scenario: ImageProxy getInfo before and after loading

- GIVEN an `ImageProxy` created with `filename='foto2.jpg'`
- WHEN `getInfo()` is called before `display()`
- THEN it returns a string indicating the proxy has not loaded the image
- WHEN `display()` is called and then `getInfo()` is called again
- THEN it delegates to `HighResImage.getInfo()` returning loaded status

### Requirement: Vitest Test Suite

The system SHALL provide behavioral tests at `src/content/patterns/__tests__/proxy.test.ts` validating the reference solution against all acceptance criteria.

The test suite MUST include:
- One `describe` block per acceptance criterion (4 blocks)
- A `describe` block validating `proxy.json` content shape (4 criteria, starterCode present)
- Negative test cases: missing lazy initialization, proxy creating real image eagerly

#### Scenario: Criterion 1 — Image abstract class definition

- GIVEN the reference solution is imported
- WHEN running the "Acceptance Criterion 1" test block
- THEN tests verify `HighResImage` and `ImageProxy` extend `Image`
- AND `display()` and `getInfo()` are callable methods

#### Scenario: Criterion 3 — Lazy initialization behavior

- GIVEN an `ImageProxy` instance
- WHEN running the "Acceptance Criterion 3" test block
- THEN tests verify `realImage` is `null` before first `display()`
- AND after `display()`, `realImage` is a `HighResImage` instance

#### Scenario: Content-shape validation

- GIVEN the `proxy.json` file
- WHEN running the content-shape test block
- THEN `exercise.acceptanceCriteria` has exactly 4 entries
- AND `exercise.starterCode` is a non-empty string

### Requirement: Sandbox Test Definition

The system SHALL provide a serializable test definition at `src/lib/test-runner/tests/proxy.ts` that validates user code in the sandbox worker.

The test definition MUST:
- Export `proxyTestDef` of type `PatternTestDef`
- Define `expectedNamedExports: ["Image", "HighResImage", "ImageProxy"]`
- Include 4 criterion checks with JavaScript expression strings
- Use `exports` and `assert()` helper in check expressions
- Verify lazy loading behavior and proxy transparency

#### Scenario: Criterion 0 — Image abstract class and HighResImage

- GIVEN user code with exported classes
- WHEN the sandbox evaluates criterion 0 check
- THEN the check verifies `HighResImage` is `instanceof Image`
- AND `new HighResImage('test.jpg').display()` executes without error

#### Scenario: Criterion 2 — Lazy initialization in proxy

- GIVEN user code with `ImageProxy`
- WHEN the sandbox evaluates criterion 2 check
- THEN the check creates an `ImageProxy`, verifies `realImage` starts as `null`
- AND calls `display()`, then asserts `realImage` is now a `HighResImage` instance
- AND the check fails if `realImage` is created eagerly in the constructor

#### Scenario: Missing exports handling

- GIVEN user code missing one of the required exports
- WHEN the sandbox test definition is loaded
- THEN `expectedNamedExports` ensures the worker validates export presence
- AND criteria checks fail gracefully with descriptive `failureMessage`

### Requirement: Registry Integration

The system SHALL register the Proxy test definition in `src/lib/test-runner/registry.ts` using lazy loading, AND register the guided exercise in `src/content/guided/index.ts`.

#### Scenario: Test registry lookup

- GIVEN the registry includes the proxy entry
- WHEN calling `getTestDef("proxy")`
- THEN the function returns a non-undefined loader function
- AND calling the loader returns a Promise resolving to `proxyTestDef`

#### Scenario: Guided index registration

- GIVEN the guided index file
- WHEN calling `getGuidedExercise("proxy")`
- THEN the function returns the `proxyGuided` exercise

### Requirement: Guided Mode Exercise

The system SHALL provide a guided exercise at `src/content/guided/proxy.ts` with 4 incremental steps that teach the Proxy pattern.

The guided exercise MUST:
- Import `buildGuidedExercise` from `@/lib/guided-mode/build`
- Define 4 steps with `index`, `title`, `explanation`, and `code` (TypeScript + JavaScript)
- Step 0: Define `Image` abstract class with `display()` and `getInfo()`
- Step 1: Implement `HighResImage` with simulated loading delay in constructor
- Step 2: Implement `ImageProxy` with `realImage: null` and lazy-init in `display()`
- Step 3: Build gallery demo showing zero-load creation and on-demand loading
- Export as `proxyGuided`

#### Scenario: Guided step progression

- GIVEN the guided exercise is loaded
- WHEN rendering step 0
- THEN the step shows the `Image` abstract class definition
- AND the explanation introduces the Proxy pattern concept (controlling access to expensive objects)

#### Scenario: Lazy loading teaching moment

- GIVEN the user is on step 2
- WHEN the explanation describes `ImageProxy`
- THEN the explanation emphasizes that `realImage` stays `null` until `display()` is first called
- AND the code demonstrates the gallery being created with zero images loaded

## Coverage

- **Happy paths**: All 4 acceptance criteria covered with positive scenarios
- **Edge cases**: Lazy init on first display, realImage reuse on subsequent calls, getInfo before/after loading
- **Error states**: Negative tests for eager initialization, missing exports, missing lazy behavior

## Next Step

Ready for design (sdd-design). If design already exists, ready for tasks (sdd-tasks).
