# Guided Walkthrough Specification

## Purpose

Defines the read-only sequential walkthrough replacing the current Guided Mode's interactive editor and sandbox. Users navigate freely through steps, reading explanations and viewing accumulated code with syntax highlighting. No editing, no verification.

## Requirements

### Requirement: Guided Step Data Schema

The system MUST represent each guided step using a `GuidedStep` interface with fields: `index` (number, zero-based), `title` (string), `explanation` (string), and `code` (object with `typescript` and `javascript` string fields).

The `GuidedStep` interface MUST NOT contain `starterCode`, `check` (CriterionCheck), or `solutionCode` fields.

The system MUST represent step progress using a `GuidedStepState` type with exactly three values: `"unread"`, `"current"`, `"read"`.

#### Scenario: Schema conformance for factory-method steps

- GIVEN the factory-method guided content
- WHEN loaded by the application
- THEN each step has `index`, `title`, `explanation`, and `code` with both `typescript` and `javascript` keys
- AND no step contains `starterCode`, `check`, or `solutionCode`

#### Scenario: GuidedStepState has exactly three values

- GIVEN the `GuidedStepState` type definition
- WHEN inspected
- THEN it allows only `"unread"`, `"current"`, and `"read"`

### Requirement: Read-Only Code Display

The system MUST render each step's code using `highlightCode()` from `syntax-highlight.ts` inside a non-editable container.

The system MUST NOT render an editable textarea in guided mode.

The system MUST NOT render "Verificar paso" or "Revelar solucion" buttons in guided mode.

#### Scenario: Code block is read-only with syntax highlighting

- GIVEN a user viewing any guided step
- WHEN the step's code block renders
- THEN the code is displayed with syntax highlighting via `highlightCode()`
- AND the code container is not editable

#### Scenario: No verification or reveal buttons present

- GIVEN a user in guided mode
- WHEN the step UI renders
- THEN no "Verificar paso" button is present
- AND no "Revelar solucion" button is present

### Requirement: Step Navigation and Sidebar

The system MUST display a step sidebar showing each step with a visual indicator matching its state: distinct indicators for `"unread"`, `"current"`, and `"read"`.

The system MUST provide Previous and Next navigation buttons at the bottom of the walkthrough.

The system MUST allow free navigation to any step regardless of current position. No step MAY be locked.

The "Modo Libre" / "Modo Guiado" toggle MUST remain visible in both modes within `ExerciseSection.tsx`.

#### Scenario: Sidebar reflects step states

- GIVEN step 0 is `"current"`, steps 1-3 are `"unread"`
- WHEN the sidebar renders
- THEN step 0 shows the "current" indicator
- AND steps 1-3 show the "unread" indicator

#### Scenario: Free navigation between any steps

- GIVEN a user on step 2
- WHEN the user clicks step 0 in the sidebar
- THEN step 0 becomes visible without any lock or barrier

#### Scenario: Toggle visible in both modes

- GIVEN a user in either guided or free mode
- WHEN the exercise section renders
- THEN the "Modo Libre" / "Modo Guiado" toggle is visible

### Requirement: Content Reuse from Existing Steps

The system MUST use the existing `solutionCode` entries from the 4 factory-method steps directly as the `code` field.

The system MUST NOT include `starterCode` or `check` data in the guided context.

#### Scenario: Factory-method code fields populated from solutionCode

- GIVEN the 4 factory-method guided steps
- WHEN content loads
- THEN each step's `code.typescript` matches the former `solutionCode.typescript`
- AND each step's `code.javascript` matches the former `solutionCode.javascript`

### Requirement: Simplified State Persistence

The system MUST persist step progress in localStorage using only `"unread"`, `"current"`, and `"read"` states. No `"completed"` or `"revealed"` states MAY exist.

On first visit, step 0 MUST be `"current"` and all remaining steps MUST be `"unread"`.

Navigating to a step MUST mark it as `"read"`. The previously `"current"` step MUST remain `"read"`.

The system MUST provide a "Clear progress" button in the sidebar that resets all states to initial.

#### Scenario: Initial state on first visit

- GIVEN no localStorage entry for guided progress
- WHEN the user opens the walkthrough
- THEN step 0 is `"current"` and all other steps are `"unread"`

#### Scenario: Navigating marks step as read

- GIVEN step 0 is `"current"`, step 1 is `"unread"`
- WHEN the user navigates to step 1
- THEN step 1 becomes `"current"` and step 0 becomes `"read"`

#### Scenario: Clear progress resets state

- GIVEN steps with mixed `"read"` and `"current"` states
- WHEN the user clicks "Clear progress"
- THEN all states reset to initial (step 0 `"current"`, rest `"unread"`)

### Requirement: Test File Removal

The system MUST NOT contain `src/lib/test-runner/__tests__/guided-starters-verification.test.ts`.

All other test suites MUST remain intact and passing.

#### Scenario: Removed test file does not exist

- GIVEN the project after this change
- WHEN the filesystem is inspected
- THEN `guided-starters-verification.test.ts` does not exist

#### Scenario: Remaining tests pass

- GIVEN the test file removal
- WHEN `npm test` runs
- THEN all remaining tests pass with no failures
