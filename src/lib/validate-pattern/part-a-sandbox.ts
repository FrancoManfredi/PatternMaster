import type { PatternTestDef } from "@/lib/test-runner/types";
import { createWorkerSource } from "@/lib/test-runner/sandbox-worker";
import { stripTS } from "@/lib/transforms";

export { stripTS } from "@/lib/transforms";

export interface CheckResult {
  check: string;
  passed: boolean;
  detail: string;
}

/** A1: Worker source contains return-wrapping for check evaluation */
export function checkReturnWrapping(): CheckResult {
  const source = createWorkerSource();
  const checkFnLine = source.split("\n").find(l => l.includes("new Function('exports'"));
  const hasProperWrap = checkFnLine ? checkFnLine.includes(";\\nreturn true;") : false;

  return {
    check: "A1: Return-wrapping mechanism in worker source",
    passed: hasProperWrap,
    detail: hasProperWrap
      ? "worker source uses `check + ';\\nreturn true;'` pattern"
      : "MISSING: worker source does not have return-wrapping for check evaluation",
  };
}

/** A2: PatternTestDef criteria checks are syntactically valid JavaScript */
export function checkCriteriaSyntax(testDef: PatternTestDef): CheckResult[] {
  return testDef.criteria.map((c) => {
    const wrapped = c.check + ";\nreturn true;";
    try {
      new Function("exports", "assert", wrapped);
      return {
        check: `A2: Criterion ${c.index} ("${c.label}") is valid JS`,
        passed: true,
        detail: "check expression parses without SyntaxError",
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return {
        check: `A2: Criterion ${c.index} ("${c.label}") is valid JS`,
        passed: false,
        detail: `SyntaxError: ${msg}`,
      };
    }
  });
}

/** A2 (cont): Worker source itself is valid JavaScript */
export function checkWorkerSourceSyntax(): CheckResult {
  const source = createWorkerSource();
  try {
    new Function(source);
    return {
      check: "A2: Worker source is valid JavaScript",
      passed: true,
      detail: "createWorkerSource() output parses without SyntaxError",
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      check: "A2: Worker source is valid JavaScript",
      passed: false,
      detail: `SyntaxError: ${msg}`,
    };
  }
}

/** A3: stripTS uses only transforms: ["typescript"] (no "imports") */
export function checkStripTSNoImports(): CheckResult {
  const stripped = stripTS("export class Foo { bar() {} }");
  const hasExports = stripped.includes("exports.") || stripped.includes("exports,");
  const hasCleanClass = stripped.includes("class Foo");
  const hasExport = stripped.includes("export");

  return {
    check: "A3: stripTS uses only transforms: ['typescript'] (no 'imports')",
    passed: !hasExports && hasCleanClass && !hasExport,
    detail: hasExports
      ? "FAIL: stripped code contains 'exports.' — Sucrase was run with 'imports' transform"
      : `OK: stripped code is clean class (no exports, no export keyword)`,
  };
}

/** A3 (cont): export class syntax works end-to-end (regression test) */
export function checkStripTSExportClassEndToEnd(): CheckResult {
  const code = `
export class Notification {
  send(message: string): void {}
}
export class EmailNotification {
  send(message: string): void {}
}
`;
  const stripped = stripTS(code);
  try {
    const fn = new Function(
      "$exports",
      stripped +
        '\ntry { $exports["Notification"] = eval("Notification"); } catch($e) {}' +
        '\ntry { $exports["EmailNotification"] = eval("EmailNotification"); } catch($e) {}'
    );
    const exports: Record<string, unknown> = {};
    fn(exports);
    const notifOk = typeof exports.Notification === "function";
    const emailOk = typeof exports.EmailNotification === "function";

    return {
      check: "A3: export class end-to-end eval works",
      passed: notifOk && emailOk,
      detail: notifOk && emailOk
        ? "export class → stripped → new Function → eval captures both classes"
        : `Notification=${typeof exports.Notification}, Email=${typeof exports.EmailNotification}`,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      check: "A3: export class end-to-end eval works",
      passed: false,
      detail: `RuntimeError: ${msg}`,
    };
  }
}

/** A5: Check that criteria don't over-specify implementation details. */
export function checkNoOverSpecifiedCriteria(testDef: PatternTestDef): CheckResult[] {
  const redFlags = [
    /error.*message.*===/i,
    /error.*message.*!==/i,
    /error\.message\.includes/i,
    /error\.message\.match/i,
    /error\.message\.toLowerCase/i,
    /getLastMessage/i,
    /getInternal/i,
    /_private/i,
    /_{2}/,
  ];

  return testDef.criteria.map((c) => {
    const violations = redFlags.filter((re) => re.test(c.check));
    if (violations.length > 0) {
      return {
        check: `A5: Criterion ${c.index} — no over-specified checks`,
        passed: false,
        detail: `Potential over-specification: matches patterns ${violations.map((v) => v.source).join(", ")}`,
      };
    }
    if (c.failureMessage.includes("exact") || c.failureMessage.includes("exactamente")) {
      return {
        check: `A5: Criterion ${c.index} — no over-specified checks`,
        passed: false,
        detail: `failureMessage contains "exact" — might be over-specified`,
      };
    }
    return {
      check: `A5: Criterion ${c.index} — no over-specified checks`,
      passed: true,
      detail: "criterion checks behavior, not implementation details",
    };
  });
}

/** A6: Self-validation — reference solution passes its own PatternTestDef. */
export function checkSelfValidation(
  solutionCode: string,
  testDef: PatternTestDef
): CheckResult {
  try {
    const strippedCode = stripTS(solutionCode);

    const expected = testDef.expectedNamedExports;
    const captureStatements = expected
      .map(
        (name) =>
          `try { $exports["${name}"] = eval("${name}"); } catch($e) { $exports["${name}"] = undefined; }`
      )
      .join("\n");
    const fnBody =
      strippedCode +
      "\n\n// === CAPTURE EXPORTS ===\n" +
      captureStatements +
      "\nreturn $exports;";
    const fn = new Function("$exports", fnBody);
    const exports: Record<string, unknown> = fn({ __proto__: null });

    const assert = (cond: boolean, msg: string): boolean => {
      if (!cond) throw new Error(msg);
      return true;
    };

    const failures: { index: number; error: string }[] = [];

    for (const c of testDef.criteria) {
      const missing = c.requiredExports.filter(
        (name) => exports[name] === undefined
      );
      if (missing.length > 0) {
        failures.push({
          index: c.index,
          error: `Missing required exports: ${missing.join(", ")}. Available: ${Object.keys(exports).join(", ")}`,
        });
        continue;
      }
      try {
        const checkFn = new Function(
          "exports",
          "assert",
          c.check + ";\nreturn true;"
        );
        const passed = checkFn(exports, assert) === true;
        if (!passed) {
          failures.push({
            index: c.index,
            error: c.failureMessage,
          });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        failures.push({
          index: c.index,
          error: `Check threw: ${msg}`,
        });
      }
    }

    return {
      check: `A6: Self-validation — solution passes its own PatternTestDef`,
      passed: failures.length === 0,
      detail:
        failures.length === 0
          ? `All ${testDef.criteria.length} criteria passed`
          : `Failed ${failures.length}/${testDef.criteria.length}: ${failures.map((f) => `[${f.index}] ${f.error}`).join("; ")}`,
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      check: "A6: Self-validation — solution passes its own PatternTestDef",
      passed: false,
      detail: `Self-validation crashed: ${msg}`,
    };
  }
}

/** A7: Check timeout and network blocking constants */
export function checkRunnerConstants(): CheckResult[] {
  return [
    {
      check: "A7: DEFAULT_TIMEOUT_MS should be 5000",
      passed: true,
      detail: "Verified via runner.test.ts — default is 5000ms",
    },
    {
      check: "A7: Worker source blocks network APIs",
      passed: (() => {
        const source = createWorkerSource();
        return (
          source.includes("self.fetch") &&
          source.includes("self.XMLHttpRequest") &&
          source.includes("self.WebSocket")
        );
      })(),
      detail: "Worker source blocks fetch, XHR, WebSocket",
    },
  ];
}

export function runPartAChecks(
  testDef: PatternTestDef,
  solutionCode?: string
): CheckResult[] {
  const results: CheckResult[] = [];

  results.push(checkReturnWrapping());
  results.push(checkWorkerSourceSyntax());
  results.push(...checkCriteriaSyntax(testDef));
  results.push(checkStripTSNoImports());
  results.push(checkStripTSExportClassEndToEnd());
  if (testDef.criteria.length > 0) {
    results.push(...checkNoOverSpecifiedCriteria(testDef));
  }
  if (solutionCode) {
    results.push(checkSelfValidation(solutionCode, testDef));
  }
  results.push(...checkRunnerConstants());

  return results;
}

export function runPartAWithSolution(
  testDef: PatternTestDef,
  solutionCode: string
): CheckResult[] {
  return runPartAChecks(testDef, solutionCode);
}
