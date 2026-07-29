import type { GuidedStep, GuidedExercise } from "./types";
import { computeNewLines } from "./diff";

/**
 * Input type for building a guided exercise step — same as GuidedStep but
 * without `computedNewLines`, which is computed automatically by this function.
 */
export type GuidedStepInput = Omit<GuidedStep, "computedNewLines">;

/**
 * Builds a GuidedExercise from raw step data, automatically computing
 * `computedNewLines` for each step by diffing against the previous step's
 * TypeScript code.
 *
 * Step 0 always has ALL lines marked as new (no previous step to diff against).
 * Steps 1+ use `computeNewLines` against the previous step.
 *
 * Usage (in a pattern data file):
 *
 * ```typescript
 * const steps: GuidedStepInput[] = [
 *   { index: 0, title: "Step 1", explanation: "...", code: { typescript: "...", javascript: "..." } },
 *   { index: 1, title: "Step 2", explanation: "...", code: { typescript: "...", javascript: "..." } },
 * ];
 * export const myGuided = buildGuidedExercise("my-pattern", "My Pattern", steps);
 * ```
 */
export function buildGuidedExercise(
  slug: string,
  title: string,
  steps: GuidedStepInput[]
): GuidedExercise {
  const computedSteps: GuidedStep[] = steps.map((step, i) => {
    const code = step.code.typescript;
    const newLines = i === 0
      ? Array.from({ length: code.split("\n").length }, (_, j) => j)
      : computeNewLines(steps[i - 1].code.typescript, code);

    return { ...step, computedNewLines: newLines };
  });

  return { slug, title, steps: computedSteps };
}
