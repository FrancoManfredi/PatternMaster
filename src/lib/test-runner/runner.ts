/**
 * Sandbox Test Runner
 *
 * Orchestrates a Web Worker to evaluate user code against per-pattern test
 * definitions in a sandboxed environment. Runs on the client side.
 *
 * Flow:
 *   1. Strips TypeScript → JavaScript via Sucrase (main thread)
 *   2. Creates Web Worker from inline blob (no separate file needed)
 *   3. Sends pre-stripped JS + PatternTestDef to the worker
 *   4. Waits for result with a configurable timeout
 *   5. On timeout: terminates worker, returns all-failed result
 *   6. Returns structured TestSuiteResult
 *
 * Abort support:
 *   Pass an AbortSignal to cancel the run. The worker is terminated and
 *   the result resolves with sandboxStatus "skipped".
 */

import type { TestSuiteResult, PatternTestDef, WorkerMessage } from "./types";
import { createWorkerSource } from "./sandbox-worker";
import { stripTS } from "../transforms";

const DEFAULT_TIMEOUT_MS = 5000;

/** Languages whose code can be stripped to JS and executed in the sandbox worker. */
const SUPPORTED_LANGUAGES = new Set([
  "typescript",
  "javascript",
  "ts",
  "js",
  "tsx",
  "jsx",
]);

/**
 * Pure function: returns true if the given language is supported by the
 * sandbox test runner (can be stripped to JS and evaluated).
 *
 * Comparison is case-insensitive.
 */
export function isSandboxSupported(language: string): boolean {
  return SUPPORTED_LANGUAGES.has(language.toLowerCase());
}

export interface TestRunnerOptions {
  timeoutMs?: number;
  /** AbortSignal to cancel the test run. Resolves with sandboxStatus "skipped". */
  signal?: AbortSignal;
}

/**
 * Runs the user's code through the sandbox test worker.
 * Returns a promise that resolves to TestSuiteResult.
 */
export function runUserTests(
  code: string,
  testDef: PatternTestDef,
  options: TestRunnerOptions = {}
): Promise<TestSuiteResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return new Promise<TestSuiteResult>((resolve) => {
    let settled = false;

    // Handle abort signal
    const onAbort = () => {
      if (settled) return;
      settled = true;
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      clearTimeout(timer);
      resolve({
        criterionResults: [],
        allPassed: false,
        sandboxStatus: "skipped",
      });
    };

    if (options.signal) {
      if (options.signal.aborted) {
        // Already aborted — resolve immediately
        resolve({
          criterionResults: [],
          allPassed: false,
          sandboxStatus: "skipped",
        });
        return;
      }
      options.signal.addEventListener("abort", onAbort, { once: true });
    }

    // Strip TypeScript on main thread via Sucrase
    let jsCode: string;
    try {
      jsCode = stripTS(code);
    } catch (err) {
      resolve({
        criterionResults: testDef.criteria.map((c) => ({
          criterionIndex: c.index,
          criterionLabel: c.label,
          passed: false,
          error: "Error al transpilar código: " + ((err as Error).message || String(err)),
        })),
        allPassed: false,
        sandboxStatus: "error",
      });
      return;
    }

    // Create worker from blob
    const workerSource = createWorkerSource();
    const blob = new Blob([workerSource], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    // Timeout handler
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      worker.terminate();
      URL.revokeObjectURL(workerUrl);

      const failedResults = testDef.criteria.map((c) => ({
        criterionIndex: c.index,
        criterionLabel: c.label,
        passed: false,
        error: "El código tardó demasiado en ejecutarse (posible loop infinito)",
      }));

      resolve({
        criterionResults: failedResults,
        allPassed: false,
        sandboxStatus: "error",
      });
    }, timeoutMs);

    // Message handler
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      URL.revokeObjectURL(workerUrl);

      if (options.signal) {
        options.signal.removeEventListener("abort", onAbort);
      }

      const msg = e.data;

      if (msg.type === "result") {
        resolve({ ...msg.payload, sandboxStatus: "ran" });
      } else if (msg.type === "error") {
        const failedResults = testDef.criteria.map((c) => ({
          criterionIndex: c.index,
          criterionLabel: c.label,
          passed: false,
          error: msg.payload,
        }));
        resolve({
          criterionResults: failedResults,
          allPassed: false,
          sandboxStatus: "error",
        });
      } else if (msg.type === "timeout") {
        // Worker signaled its own timeout (belt + suspenders)
        const failedResults = testDef.criteria.map((c) => ({
          criterionIndex: c.index,
          criterionLabel: c.label,
          passed: false,
          error: "El código tardó demasiado en ejecutarse (posible loop infinito)",
        }));
        resolve({
          criterionResults: failedResults,
          allPassed: false,
          sandboxStatus: "error",
        });
      }
    };

    // Error handler (worker failed to start / threw during message)
    worker.onerror = (err: ErrorEvent) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(workerUrl);

      if (options.signal) {
        options.signal.removeEventListener("abort", onAbort);
      }

      const failedResults = testDef.criteria.map((c) => ({
        criterionIndex: c.index,
        criterionLabel: c.label,
        passed: false,
        error: "Error interno del evaluador: " + (err.message || "Error desconocido"),
      }));

      resolve({
        criterionResults: failedResults,
        allPassed: false,
        sandboxStatus: "error",
      });
    };

    // Send pre-stripped JS + test definition to worker
    worker.postMessage({
      type: "run",
      payload: { code: jsCode, testDef },
    });
  });
}

/**
 * Creates a failed TestSuiteResult for all criteria (used when transpilation
 * itself fails before we can even run the worker).
 */
export function createAllFailedResult(
  testDef: PatternTestDef,
  errorMessage: string
): TestSuiteResult {
  return {
    criterionResults: testDef.criteria.map((c) => ({
      criterionIndex: c.index,
      criterionLabel: c.label,
      passed: false,
      error: errorMessage,
    })),
    allPassed: false,
    sandboxStatus: "error",
  };
}
