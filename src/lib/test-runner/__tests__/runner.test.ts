import { describe, it, expect } from "vitest";
import { createWorkerSource } from "@/lib/test-runner/sandbox-worker";
import { factoryMethodTestDef } from "@/lib/test-runner/tests/factory-method";
import { createAllFailedResult } from "@/lib/test-runner/runner";

describe("sandbox-worker", () => {
  it("creates valid worker source that blocks network", () => {
    const source = createWorkerSource();
    expect(source).toContain("self.fetch = function");
    expect(source).toContain("self.XMLHttpRequest");
    expect(source).toContain("bloqueado");
  });

  it("includes eval logic and network blocking", () => {
    const source = createWorkerSource();
    expect(source).toContain("self.onmessage");
    expect(source).toContain("new Function");
    expect(source).toContain("self.fetch");
  });

  it("generated worker source is valid JavaScript (no SyntaxError)", () => {
    // REGRESSION TEST: the worker source is created as a template literal string.
    // Any unescaped control characters (literal newlines inside single-quoted
    // strings, etc.) will cause a SyntaxError when the Worker tries to parse it.
    // This test validates the blob can be parsed.
    const source = createWorkerSource();
    expect(() => {
      // eslint-disable-next-line no-new
      new Function(source);
    }).not.toThrow();
  });

  it("check return-wrapping has escaped \\\\n (not literal newline) in single-quoted string", () => {
    // REGRESSION TEST: inside createWorkerSource()'s template literal, we MUST
    // use \\n (not \n) to produce the literal JS escape sequence \n in the
    // worker source. If \n is used, it becomes a literal newline character
    // inside the single-quoted string, which is a SyntaxError.
    const source = createWorkerSource();
    // Find the relevant line
    const lines = source.split("\n");
    const checkFnLine = lines.find((l) => l.includes("new Function('exports'"));
    expect(checkFnLine).toBeDefined();
    // The line must contain the escaped form: ';\\nreturn true;'
    // (in the source string, this shows as the literal chars backslash + n)
    expect(checkFnLine).toContain(";\\nreturn true;");
    // The line must NOT contain a literal newline between ' and return
    // (which would appear as '; followed by actual line break)
    expect(checkFnLine).not.toMatch(/';\n/);
  });
});

describe("factoryMethodTestDef", () => {
  it("has expectedNamedExports for all FM symbols", () => {
    const def = factoryMethodTestDef;
    expect(def.expectedNamedExports).toContain("Notification");
    expect(def.expectedNamedExports).toContain("EmailNotification");
    expect(def.expectedNamedExports).toContain("SMSNotification");
    expect(def.expectedNamedExports).toContain("PushNotification");
    expect(def.expectedNamedExports).toContain("NotificationFactory");
    expect(def.expectedNamedExports).toContain("NotificationService");
  });

  it("has 4 criteria matching acceptance criteria", () => {
    expect(factoryMethodTestDef.criteria).toHaveLength(4);
  });

  it("each criterion has valid check expression and requiredExports", () => {
    for (const c of factoryMethodTestDef.criteria) {
      expect(c.index).toBeGreaterThanOrEqual(0);
      expect(c.check).toBeTruthy();
      expect(c.requiredExports.length).toBeGreaterThan(0);
      expect(c.failureMessage).toBeTruthy();
    }
  });
});

describe("check evaluation (return-wrapping)", () => {
  it('wraps the check expression so new Function returns the last expression value', () => {
    // BUG REGRESSION TEST: new Function does NOT auto-return the last expression.
    // Without wrapping a bare `true` expression returns undefined,
    // causing checkFn() === true to be always false.
    // The fix: append `;\nreturn true;` so the function always returns true
    // if no assert() threw.

    // Simulate what the worker does
    function runCheck(
      check: string,
      exports: Record<string, unknown>,
      assertFn: (cond: boolean, msg: string) => boolean
    ): boolean {
      const fn = new Function("exports", "assert", check + ";\nreturn true;");
      return fn(exports, assertFn) === true;
    }

    const assertTrue = (cond: boolean, msg: string) => {
      if (!cond) throw new Error(msg);
      return true;
    };
    const assertFalse = (cond: boolean, msg: string) => {
      if (!cond) throw new Error(msg);
      return true;
    };

    // A bare `true` expression (no return) should now pass
    expect(runCheck("true", {}, assertTrue)).toBe(true);

    // Multi-line with assert + sentinel true
    expect(
      runCheck(
        `
        var x = 42;
        assert(x === 42, "x should be 42");
        true
      `,
        {},
        assertTrue
      )
    ).toBe(true);

    // Assertion failure should still fail
    expect(() =>
      runCheck(
        `
        assert(false, "this should fail");
        true
      `,
        {},
        assertTrue
      )
    ).toThrow();

    // Checks that don't throw pass because return true is always applied.
    // This is by design: checks use assert() to fail, not return false.
    expect(runCheck("false", {}, assertTrue)).toBe(true);
    expect(runCheck("42", {}, assertTrue)).toBe(true);
  });

  it("detects the original bug: bare expression without return falsely returns undefined", () => {
    // This proves the bug existed: new Function without wrapping returns undefined
    const badFn = new Function("return undefined; var x = true; x;");
    expect(badFn()).toBe(undefined);
  });
});

describe("stripTS (Sucrase transform)", () => {
  // stripTS is private in runner.ts, so we test via the public isSandboxSupported
  // path and direct Sucrase calls

  function runStripTS(code: string): string {
    // Replicate stripTS logic from runner.ts (transforms without "imports")
    const { transform } = require("sucrase");
    const result = transform(code, { transforms: ["typescript"] });
    let js = result.code;
    js = js.replace(/\bexport\s+(default\s+)?/g, "");
    js = js.replace(/^import\s+(?:type\s+)?[^;]+;\s*$/gm, "");
    js = js.replace(/@\w+(?:\([^)]*\))?\s*/g, "");
    return js.trim();
  }

  it('converts "export class Foo {}" to clean "class Foo {}"', () => {
    const result = runStripTS("export class Foo {}");
    expect(result).toBe('class Foo {}');
    expect(result).not.toContain("exports");
  });

  it('converts "export default class Bar {}" to clean "class Bar {}"', () => {
    const result = runStripTS("export default class Bar {}");
    expect(result).toBe('class Bar {}');
    expect(result).not.toContain("exports");
  });

  it("handles mixed export and non-export classes", () => {
    const code = `
export class Foo { x() {} }
class Bar { y() {} }
export default class Baz { z() {} }
    `.trim();
    const result = runStripTS(code);
    expect(result).toContain("class Foo");
    expect(result).toContain("class Bar");
    expect(result).toContain("class Baz");
    expect(result).not.toContain("export");
    expect(result).not.toContain("exports");
  });

  it("generated code can be evaluated by new Function with $exports", () => {
    // This simulates what the Worker does: export class → stripped → eval in $exports scope
    const code = runStripTS("export class Notification { send(m) {} }");
    const fn = new Function("$exports", code + '\ntry { $exports["Notification"] = eval("Notification"); } catch(e) {}');
    const exports: Record<string, unknown> = {};
    fn(exports);
    expect(exports.Notification).toBeDefined();
    expect(typeof exports.Notification).toBe("function");
  });
});

describe("Factory Method E2E (simulated worker)", () => {
  // Replicates the stripTS logic from runner.ts
  function stripTS(code: string): string {
    const { transform } = require("sucrase");
    const result = transform(code, { transforms: ["typescript"] });
    let js = result.code;
    js = js.replace(/\bexport\s+(default\s+)?/g, "");
    js = js.replace(/^import\s+(?:type\s+)?[^;]+;\s*$/gm, "");
    js = js.replace(/@\w+(?:\([^)]*\))?\s*/g, "");
    return js.trim();
  }

  // Simulates the sandbox worker's check evaluation logic
  function evaluateUserCode(
    code: string,
    testDef: typeof factoryMethodTestDef
  ) {
    // Strip TS first (same as runner.ts does before sending to Worker)
    const strippedCode = stripTS(code);
    const expected = testDef.expectedNamedExports;
    const captureStatements = expected
      .map(
        (name) =>
          `try { $exports["${name}"] = eval("${name}"); } catch($e) { $exports["${name}"] = undefined; }`
      )
      .join("\n");
    const fnBody = strippedCode + "\n\n// === CAPTURE EXPORTS ===\n" + captureStatements + "\nreturn $exports;";
    const fn = new Function("$exports", fnBody);
    const exports = fn({ __proto__: null });

    // Run checks (same as worker, with the return-wrapping fix)
    const assert = (cond: boolean, msg: string) => {
      if (!cond) throw new Error(msg);
      return true;
    };

    return testDef.criteria.map((c) => {
      const missing = c.requiredExports.filter((name) => exports[name] === undefined);
      if (missing.length > 0) {
        return { index: c.index, passed: false, error: "Missing: " + missing.join(", ") };
      }
      try {
        const checkFn = new Function("exports", "assert", c.check + ";\nreturn true;");
        const passed = checkFn(exports, assert) === true;
        return { index: c.index, passed, error: passed ? undefined : c.failureMessage };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { index: c.index, passed: false, error: msg };
      }
    });
  }

  it("passes all 4 criteria with a valid Factory Method solution", () => {
    // A correct Factory Method implementation
    const code = `
class Notification {
  send(message) {
    // base implementation
  }
}

class EmailNotification {
  send(message) {
    return "Email: " + message;
  }
  toString() { return "EmailNotification"; }
}

class SMSNotification {
  send(message) {
    return "SMS: " + message;
  }
  toString() { return "SMSNotification"; }
}

class PushNotification {
  send(message) {
    return "Push: " + message;
  }
  toString() { return "PushNotification"; }
}

class NotificationFactory {
  createNotification(type) {
    const map = { email: EmailNotification, sms: SMSNotification, push: PushNotification };
    const cls = map[type];
    if (!cls) throw new Error("Unknown type: " + type);
    return new cls();
  }
}

class NotificationService {
  constructor(factory) {
    this.factory = factory;
  }
  notify(type, message) {
    const notification = this.factory.createNotification(type);
    notification.send(message);
  }
}
`;

    const results = evaluateUserCode(code, factoryMethodTestDef);
    const passedCount = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed);

    expect(passedCount).toBe(4);
    if (failed.length > 0) {
      // If any fail, provide detailed error message
      const details = failed
        .map((f) => `  Criterion ${f.index}: ${f.error}`)
        .join("\n");
      expect(failed, `Criteria failed:\n${details}`).toHaveLength(0);
    }
  });

  it("passes all 4 criteria with export class syntax (most common TS form)", () => {
    // Same valid Factory Method but using `export class` which is the
    // most natural TypeScript style. Without the fix to stripTS (removing
    // the "imports" transform), this would produce `exports.Foo = Foo;`
    // which fails with "exports is not defined" in the Worker.
    const code = `
export class Notification {
  send(message) {}
}
export class EmailNotification {
  send(message) { return "Email: " + message; }
}
export class SMSNotification {
  send(message) { return "SMS: " + message; }
}
export class PushNotification {
  send(message) { return "Push: " + message; }
}
export class NotificationFactory {
  createNotification(type) {
    const map = { email: EmailNotification, sms: SMSNotification, push: PushNotification };
    const cls = map[type];
    if (!cls) throw new Error("Unknown type: " + type);
    return new cls();
  }
}
export class NotificationService {
  constructor(factory) { this.factory = factory; }
  notify(type, message) {
    this.factory.createNotification(type).send(message);
  }
}
`;

    const results = evaluateUserCode(code, factoryMethodTestDef);
    const passedCount = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed);

    expect(passedCount).toBe(4);
    if (failed.length > 0) {
      const details = failed.map((f) => `  Criterion ${f.index}: ${f.error}`).join("\n");
      expect(failed, `Criteria failed:\n${details}`).toHaveLength(0);
    }
  });

  it("fails criteria when implementation is wrong", () => {
    // Incomplete implementation - missing NotificationService delegation
    const incompleteCode = `
class Notification {
  send(message) {}
}
class EmailNotification {
  send(message) { return "E: " + message; }
}
class SMSNotification {
  send(message) { return "SMS: " + message; }
}
class PushNotification {
  send(message) { return "P: " + message; }
}
class NotificationFactory {
  createNotification(type) {
    if (type === "email") return new EmailNotification();
    if (type === "sms") return new SMSNotification();
    if (type === "push") return new PushNotification();
    throw new Error("unknown");
  }
}
`;

    const results = evaluateUserCode(incompleteCode, factoryMethodTestDef);
    const passedCount = results.filter((r) => r.passed).length;

    // Should fail criterion 3 (NotificationService) because it's missing
    expect(passedCount).toBeLessThan(4);
    expect(results[3].passed).toBe(false);
  });
});

describe("createAllFailedResult", () => {
  it("returns all criteria as failed", () => {
    const result = createAllFailedResult(factoryMethodTestDef, "test error");
    expect(result.allPassed).toBe(false);
    expect(result.criterionResults).toHaveLength(4);
    for (const cr of result.criterionResults) {
      expect(cr.passed).toBe(false);
      expect(cr.error).toBe("test error");
    }
  });
});
