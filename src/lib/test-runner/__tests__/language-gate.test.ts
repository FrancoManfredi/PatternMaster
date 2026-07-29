/**
 * Language Gate + Sandbox Status Tests
 *
 * Verifies:
 * - isSandboxSupported truth table
 * - AbortSignal resolves with sandboxStatus "skipped"
 * - TestSuiteResult shape includes sandboxStatus
 */

import { describe, it, expect } from "vitest";
import { isSandboxSupported } from "@/lib/test-runner/runner";
import type { TestSuiteResult, SandboxStatus } from "@/lib/test-runner/types";

describe("isSandboxSupported", () => {
  // Truth table: language → expected
  const cases: [string, boolean][] = [
    // Supported
    ["TypeScript", true],
    ["JavaScript", true],
    ["typescript", true],
    ["javascript", true],
    ["ts", true],
    ["js", true],
    ["tsx", true],
    ["jsx", true],
    ["TS", true],
    ["JS", true],
    // Not supported
    ["Python", false],
    ["Java", false],
    ["C#", false],
    ["Go", false],
    ["Rust", false],
    ["PHP", false],
    ["Ruby", false],
    ["C++", false],
    ["Kotlin", false],
    ["Swift", false],
    ["Otro", false],
    ["Haskell", false],
  ];

  for (const [lang, expected] of cases) {
    it(`isSandboxSupported("${lang}") → ${expected}`, () => {
      expect(isSandboxSupported(lang)).toBe(expected);
    });
  }
});

describe("TestSuiteResult sandboxStatus", () => {
  it("has optional sandboxStatus field", () => {
    const result: TestSuiteResult = {
      criterionResults: [],
      allPassed: true,
    };
    // sandboxStatus is optional — defaults to undefined (treated as "ran")
    expect(result.sandboxStatus).toBeUndefined();
  });

  it("accepts 'ran' status", () => {
    const result: TestSuiteResult = {
      criterionResults: [],
      allPassed: true,
      sandboxStatus: "ran",
    };
    expect(result.sandboxStatus).toBe("ran");
  });

  it("accepts 'skipped' status", () => {
    const result: TestSuiteResult = {
      criterionResults: [],
      allPassed: false,
      sandboxStatus: "skipped",
    };
    expect(result.sandboxStatus).toBe("skipped");
  });

  it("accepts 'error' status", () => {
    const result: TestSuiteResult = {
      criterionResults: [
        { criterionIndex: 0, criterionLabel: "test", passed: false, error: "err" },
      ],
      allPassed: false,
      sandboxStatus: "error",
    };
    expect(result.sandboxStatus).toBe("error");
  });

  it("isSandboxSupported is case-insensitive", () => {
    expect(isSandboxSupported("TYPESCRIPT")).toBe(true);
    expect(isSandboxSupported("Javascript")).toBe(true);
    expect(isSandboxSupported("PYTHON")).toBe(false);
  });
});

describe("AbortSignal integration", () => {
  it("abort signal can be created and checked", () => {
    const controller = new AbortController();
    expect(controller.signal.aborted).toBe(false);
    controller.abort();
    expect(controller.signal.aborted).toBe(true);
  });

  it("runUserTests resolves with sandboxStatus 'skipped' when signal is pre-aborted", async () => {
    const { runUserTests } = await import("@/lib/test-runner/runner");
    const controller = new AbortController();
    controller.abort(); // Pre-abort

    const testDef = {
      slug: "test",
      expectedNamedExports: ["x"],
      criteria: [
        {
          index: 0,
          label: "test criterion",
          requiredExports: ["x"],
          check: "return true",
          failureMessage: "failed",
        },
      ],
    };

    const result = await runUserTests("const x = 1;", testDef, {
      signal: controller.signal,
    });

    expect(result.sandboxStatus).toBe("skipped");
    expect(result.criterionResults).toHaveLength(0);
    expect(result.allPassed).toBe(false);
  });
});
