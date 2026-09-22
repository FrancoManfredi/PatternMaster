"use client";

import type { TestSuiteResult, SandboxStatus } from "@/lib/test-runner/types";

interface TestSuiteStatusProps {
  criteria: string[];
  result: TestSuiteResult | null;
  isRunning: boolean;
}

const ICON_MAP = {
  pending: "pending",
  running: "sync",
  passed: "check_circle",
  failed: "error",
  unsupported: "info",
} as const;

const COLOR_MAP = {
  pending: "text-outline",
  running: "text-warning-amber animate-spin",
  passed: "text-primary",
  failed: "text-error",
  unsupported: "text-on-surface-variant",
} as const;

function getEffectiveStatus(
  result: TestSuiteResult | null,
  isRunning: boolean
): SandboxStatus | "pending" | "running" {
  if (isRunning) return "running";
  if (!result) return "pending";
  if (result.sandboxStatus === "skipped") return "skipped";
  return result.allPassed ? "ran" : "ran";
}

function getCriterionStatus(
  index: number,
  result: TestSuiteResult | null,
  isRunning: boolean
): keyof typeof ICON_MAP {
  if (isRunning) return "running";
  if (!result) return "pending";

  // When sandbox was skipped, all criteria show unsupported
  if (result.sandboxStatus === "skipped") return "unsupported";

  const cr = result.criterionResults[index];
  if (!cr) return "pending";
  return cr.passed ? "passed" : "failed";
}

export default function TestSuiteStatus({
  criteria,
  result,
  isRunning,
}: TestSuiteStatusProps) {
  const effectiveStatus = getEffectiveStatus(result, isRunning);

  return (
    <div className="mt-auto bg-carbon-surface p-4 border border-outline-variant/20">
      <div className="font-body text-label-caps text-on-surface mb-3 uppercase tracking-wider">
        Test Suite Status
      </div>
      <div className="flex flex-col gap-2 font-body text-code-sm">
        {effectiveStatus === "skipped" ? (
          // Unsupported language state: neutral icon + informational message
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span
              className={`material-symbols-outlined text-[16px] ${COLOR_MAP.unsupported}`}
            >
              {ICON_MAP.unsupported}
            </span>
            <span className="flex-1 text-on-surface-variant/80">
              Los tests automáticos deterministas solo están disponibles para
              TypeScript/JavaScript por ahora. Para otros lenguajes, la
              validación es manual.
            </span>
          </div>
        ) : (
          // Normal criterion-by-criterion display
          criteria.map((criterion, i) => {
            const status = getCriterionStatus(i, result, isRunning);
            return (
              <div
                key={i}
                className="flex items-center gap-2 text-on-surface-variant"
              >
                <span
                  className={`material-symbols-outlined text-[16px] ${COLOR_MAP[status]}`}
                >
                  {ICON_MAP[status]}
                </span>
                <span className="flex-1">{criterion}</span>
                {result && result.criterionResults[i]?.error && (
                  <span
                    className="text-[10px] text-error max-w-[400px] text-right leading-tight"
                    title={result.criterionResults[i].error}
                  >
                    {result.criterionResults[i].error.replace(/^Error interno del evaluador: /, "")}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {result && effectiveStatus !== "skipped" && (
        <div className="mt-3 pt-3 border-t border-outline-variant/10 flex justify-between items-center">
          <span className="font-body text-label-caps text-on-surface-variant uppercase tracking-wider">
            {result.allPassed
              ? "✓ Todos los tests pasaron"
              : `✗ ${result.criterionResults.filter((r) => !r.passed).length} tests fallaron`}
          </span>
          {!result.allPassed && (
            <span className="text-[10px] text-on-surface-variant/60 max-w-[200px] text-right truncate">
              Revisá los criterios marcados en rojo
            </span>
          )}
        </div>
      )}
    </div>
  );
}
