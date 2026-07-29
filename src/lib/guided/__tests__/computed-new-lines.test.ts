import { describe, it, expect } from "vitest";
import { computeNewLines } from "@/lib/guided-mode/diff";
import type { GuidedStep } from "@/lib/guided-mode/types";
import { factoryMethodGuided } from "@/content/guided/factory-method";

/**
 * Runs the full suite of computedNewLines validation tests on any GuidedExercise.
 * Export this function so future pattern test files can just call:
 *   import { testGuidedExercise } from "./helpers";
 *   testGuidedExercise(myPatternGuided);
 */
export function testGuidedExercise(guided: {
  slug: string;
  steps: GuidedStep[];
}) {
  describe(`${guided.slug}: guided computedNewLines`, () => {
    it("step 0 has all lines marked as new", () => {
      const step = guided.steps[0];
      const lineCount = step.code.typescript.split("\n").length;
      expect(step.computedNewLines).toEqual(
        Array.from({ length: lineCount }, (_, i) => i)
      );
    });

    it.each(guided.steps.slice(1).map((_, i) => i + 1))(
      "step %i computedNewLines match diff against previous step",
      (index) => {
        const step = guided.steps[index];
        const prev = guided.steps[index - 1];
        const expected = computeNewLines(prev.code.typescript, step.code.typescript);
        expect(step.computedNewLines).toEqual(expected);
      }
    );

    it("every newLine index is within valid range for its step", () => {
      for (const step of guided.steps) {
        const lineCount = step.code.typescript.split("\n").length;
        for (const lineIdx of step.computedNewLines) {
          expect(lineIdx).toBeGreaterThanOrEqual(0);
          expect(lineIdx).toBeLessThan(lineCount);
        }
      }
    });
  });
}

// Run for factory-method as first case of the reusable mechanism
testGuidedExercise(factoryMethodGuided);
