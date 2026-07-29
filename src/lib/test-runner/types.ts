// Types for the sandbox test runner

export type SandboxStatus = "ran" | "skipped" | "error";

export interface CriterionResult {
  criterionIndex: number;
  criterionLabel: string;
  passed: boolean;
  error?: string; // user-friendly message, NOT a raw stack trace
}

export interface TestSuiteResult {
  criterionResults: CriterionResult[];
  allPassed: boolean;
  /** Whether the sandbox actually ran tests.
   *  - "ran": sandbox executed tests normally
   *  - "skipped": language not supported, no deterministic tests ran
   *  - "error": sandbox failed to execute (transpile error, worker crash, etc.)
   *  Defaults to "ran" for backward compat.
   */
  sandboxStatus?: SandboxStatus;
}

// Communication protocol: Main → Worker
export interface RunRequest {
  type: "run";
  payload: {
    code: string;         // user's TypeScript code
    testDef: PatternTestDef;
  };
}

// Communication protocol: Worker → Main
export interface RunResultMessage {
  type: "result";
  payload: TestSuiteResult;
}

export interface RunErrorMessage {
  type: "error";
  payload: string; // user-friendly message
}

export interface RunTimeoutMessage {
  type: "timeout";
}

export type WorkerMessage = RunResultMessage | RunErrorMessage | RunTimeoutMessage;

// Serializable test definition sent to the worker
export interface CriterionCheck {
  index: number;
  label: string;
  /** JavaScript expression that evaluates to boolean.
   *  Has access to:
   *    - `exports` — object with named extracts from user code
   *    - `assert(condition, msg)` — helper that throws with friendly msg
   */
  check: string;
  /** Expected named exports that must exist in user code for this criterion */
  requiredExports: string[];
  /** Friendly message if check returns false */
  failureMessage: string;
}

export interface PatternTestDef {
  slug: string;
  /** All symbols the user must export for the tests to work */
  expectedNamedExports: string[];
  /** Per-criterion checks */
  criteria: CriterionCheck[];
}
