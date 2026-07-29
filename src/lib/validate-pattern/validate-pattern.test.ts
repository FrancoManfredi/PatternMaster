/**
 * Pattern Validation Test
 *
 * Runs ALL Part A + Part B checks on factory-method (control) and
 * singleton (new pattern). After validation, presents a comprehensive report.
 *
 * Run: npx vitest run src/lib/validate-pattern/
 */

import { describe, it, expect } from "vitest";
import { factoryMethodTestDef } from "@/lib/test-runner/tests/factory-method";
import { factoryMethodGuided } from "@/content/guided/factory-method";
import factoryMethodContent from "@/content/patterns/factory-method.json";
import { singletonTestDef } from "@/lib/test-runner/tests/singleton";
import { singletonGuided } from "@/content/guided/singleton";
import singletonContent from "@/content/patterns/singleton.json";
import {
  runPartAChecks,
  runPartBChecks,
  runPartAWithSolution,
} from "./checks";
import type { PatternContent } from "@/content/index";

const FM_CONTENT = factoryMethodContent as unknown as PatternContent;
const FM_SOLUTION = `
export class Notification {
  send(message: string): void {}
}
export class EmailNotification extends Notification {
  private lastMessage: string = "";
  send(message: string): void { this.lastMessage = message; }
  getLastMessage(): string { return this.lastMessage; }
}
export class SMSNotification extends Notification {
  private lastMessage: string = "";
  send(message: string): void { this.lastMessage = message; }
  getLastMessage(): string { return this.lastMessage; }
}
export class PushNotification extends Notification {
  private lastMessage: string = "";
  send(message: string): void { this.lastMessage = message; }
  getLastMessage(): string { return this.lastMessage; }
}
export class NotificationFactory {
  createNotification(type: string): Notification {
    switch (type.toLowerCase()) {
      case "email": return new EmailNotification();
      case "sms": return new SMSNotification();
      case "push": return new PushNotification();
      default: throw new Error(\`Unknown notification type: \${type}\`);
    }
  }
}
export class NotificationService {
  private factory: NotificationFactory;
  constructor(factory: NotificationFactory) { this.factory = factory; }
  notify(type: string, message: string): void {
    const notification = this.factory.createNotification(type);
    notification.send(message);
  }
}
`;

const SG_CONTENT = singletonContent as unknown as PatternContent;
const SG_SOLUTION = `
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, string>;

  private constructor() {
    this.config = {
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      API_KEY: 'secret-123',
    };
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  get(key: string): string | undefined {
    return this.config[key];
  }

  getAll(): Record<string, string> {
    return { ...this.config };
  }
}
`;

describe("Part A — Free Mode (Sandbox) Validations", () => {
  const results = runPartAWithSolution(factoryMethodTestDef, FM_SOLUTION);

  it("A1: Worker source uses return-wrapping for check evaluation", () => {
    const r = results.find((r) => r.check.startsWith("A1: Return-wrapping"));
    expect(r?.passed).toBe(true);
  });

  it("A2: Worker source is valid JavaScript", () => {
    const r = results.find((r) => r.check.startsWith("A2: Worker source is valid"));
    expect(r?.passed).toBe(true);
  });

  it("A2: All criterion checks are syntactically valid JS", () => {
    const syntaxResults = results.filter((r) =>
      r.check.startsWith("A2: Criterion")
    );
    const failed = syntaxResults.filter((r) => !r.passed);
    expect(failed, `Syntax errors: ${failed.map((f) => f.detail).join("; ")}`).toHaveLength(0);
  });

  it("A3: stripTS uses transforms: [\"typescript\"] only (no \"imports\")", () => {
    const r = results.find((r) => r.check.startsWith("A3: stripTS uses"));
    expect(r?.passed).toBe(true);
  });

  it("A3: export class works end-to-end in new Function", () => {
    const r = results.find((r) => r.check.startsWith("A3: export class end-to-end"));
    expect(r?.passed).toBe(true);
  });

  it("A5: Criteria don't over-specify implementation details", () => {
    const overSpecResults = results.filter((r) =>
      r.check.startsWith("A5:")
    );
    const failed = overSpecResults.filter((r) => !r.passed);
    expect(failed, `Over-specified: ${failed.map((f) => f.detail).join("; ")}`).toHaveLength(0);
  });

  it("A6: Solution code passes its own PatternTestDef (self-validation)", () => {
    const r = results.find((r) => r.check.startsWith("A6:"));
    expect(r?.passed).toBe(true);
  });

  it("A7: Worker blocks network APIs", () => {
    const r = results.find((r) => r.check.startsWith("A7: Worker source blocks"));
    expect(r?.passed).toBe(true);
  });
});

describe("Part B — Guided Mode Validations", () => {
  const results = runPartBChecks(factoryMethodGuided, FM_CONTENT);

  it("B1: Step 0 explains the exercise objective", () => {
    const r = results.find((r) => r.check.startsWith("B1:"));
    expect(r?.passed).toBe(true);
  });

  it("B2: No sandbox/evaluator/verificar vocabulary in explanations", () => {
    const vocabResults = results.filter((r) => r.check.startsWith("B2:"));
    const failed = vocabResults.filter((r) => !r.passed);
    expect(failed, `Vocabulary violations: ${failed.map((f) => `Step ${f.check.match(/Step (\d+)/)?.[1]}: ${f.detail}`).join("; ")}`).toHaveLength(0);
  });

  it("B3: No truncated code in guided steps", () => {
    const truncationResults = results.filter((r) => r.check.startsWith("B3:"));
    const failed = truncationResults.filter((r) => !r.passed);
    expect(failed, `Truncation found: ${failed.map((f) => `Step ${f.check.match(/Step (\d+)/)?.[1]}: ${f.detail}`).join("; ")}`).toHaveLength(0);
  });

  it("B5: computedNewLines are properly computed (not hardcoded)", () => {
    const computedResults = results.filter((r) => r.check.startsWith("B5:"));
    const failed = computedResults.filter((r) => !r.passed);
    expect(failed, `computedNewLines issues: ${failed.map((f) => f.detail).join("; ")}`).toHaveLength(0);
  });

  it("B6: All step code (TS + JS) is syntactically valid", () => {
    const syntaxResults = results.filter((r) => r.check.startsWith("B6:"));
    const failed = syntaxResults.filter((r) => !r.passed);
    expect(failed, `Syntax errors: ${failed.map((f) => `[${f.check.match(/Step (\d+)/)?.[1]}] ${f.detail}`).join("; ")}`).toHaveLength(0);
  });

  it("B7: Acceptance criteria symbols present in final step code", () => {
    const r = results.find((r) => r.check.startsWith("B7:"));
    expect(r?.passed).toBe(true);
  });
});

// ─── Singleton Validations ────────────────────────────────────────

describe("Singleton — Part A (Sandbox) Validations", () => {
  const results = runPartAWithSolution(singletonTestDef, SG_SOLUTION);

  it("A2: All criterion checks are syntactically valid JS", () => {
    const syntaxResults = results.filter((r) =>
      r.check.startsWith("A2: Criterion")
    );
    const failed = syntaxResults.filter((r) => !r.passed);
    expect(failed, `Syntax errors: ${failed.map((f) => f.detail).join("; ")}`).toHaveLength(0);
  });

  it("A5: Criteria don't over-specify implementation details", () => {
    const overSpecResults = results.filter((r) =>
      r.check.startsWith("A5:")
    );
    const failed = overSpecResults.filter((r) => !r.passed);
    expect(failed, `Over-specified: ${failed.map((f) => f.detail).join("; ")}`).toHaveLength(0);
  });

  it("A6: Solution code passes its own PatternTestDef (self-validation)", () => {
    const r = results.find((r) => r.check.startsWith("A6:"));
    expect(r?.passed).toBe(true);
  });
});

describe("Singleton — Part B (Guided) Validations", () => {
  const results = runPartBChecks(singletonGuided, SG_CONTENT);

  it("B1: Step 0 explains the exercise objective", () => {
    const r = results.find((r) => r.check.startsWith("B1:"));
    expect(r?.passed).toBe(true);
  });

  it("B2: No sandbox/evaluator/verificar vocabulary in explanations", () => {
    const vocabResults = results.filter((r) => r.check.startsWith("B2:"));
    const failed = vocabResults.filter((r) => !r.passed);
    expect(failed, `Vocabulary violations: ${failed.map((f) => `Step ${f.check.match(/Step (\d+)/)?.[1]}: ${f.detail}`).join("; ")}`).toHaveLength(0);
  });

  it("B3: No truncated code in guided steps", () => {
    const truncationResults = results.filter((r) => r.check.startsWith("B3:"));
    const failed = truncationResults.filter((r) => !r.passed);
    expect(failed, `Truncation found: ${failed.map((f) => `Step ${f.check.match(/Step (\d+)/)?.[1]}: ${f.detail}`).join("; ")}`).toHaveLength(0);
  });

  it("B5: computedNewLines are properly computed (not hardcoded)", () => {
    const computedResults = results.filter((r) => r.check.startsWith("B5:"));
    const failed = computedResults.filter((r) => !r.passed);
    expect(failed, `computedNewLines issues: ${failed.map((f) => f.detail).join("; ")}`).toHaveLength(0);
  });

  it("B6: All step code (TS + JS) is syntactically valid", () => {
    const syntaxResults = results.filter((r) => r.check.startsWith("B6:"));
    const failed = syntaxResults.filter((r) => !r.passed);
    expect(failed, `Syntax errors: ${failed.map((f) => `[${f.check.match(/Step (\d+)/)?.[1]}] ${f.detail}`).join("; ")}`).toHaveLength(0);
  });

  it("B7: Acceptance criteria symbols present in final step code", () => {
    const r = results.find((r) => r.check.startsWith("B7:"));
    expect(r?.passed).toBe(true);
  });
});

describe("Full Validation Report", () => {
  it("Part A: All checks pass", () => {
    const results = runPartAChecks(factoryMethodTestDef);
    const failures = results.filter((r) => !r.passed);
    console.log("\n=== PART A VALIDATION REPORT ===");
    for (const r of results) {
      console.log(`  ${r.passed ? "✅" : "❌"} ${r.check}`);
      if (!r.passed) console.log(`     ${r.detail}`);
    }
    console.log(`\n  Total: ${results.filter((r) => r.passed).length}/${results.length} passed`);
    console.log("================================\n");
    if (failures.length > 0) {
      console.log("FAILURES:");
      for (const f of failures) {
        console.log(`  ❌ ${f.check}: ${f.detail}`);
      }
    }
    expect(failures, `Part A failures: ${failures.map((f) => f.check).join("; ")}`).toHaveLength(0);
  });

  it("Part B: All checks pass", () => {
    const results = runPartBChecks(factoryMethodGuided, FM_CONTENT);
    const failures = results.filter((r) => !r.passed);
    console.log("\n=== PART B VALIDATION REPORT ===");
    for (const r of results) {
      console.log(`  ${r.passed ? "✅" : "❌"} ${r.check}`);
      if (!r.passed) console.log(`     ${r.detail}`);
    }
    console.log(`\n  Total: ${results.filter((r) => r.passed).length}/${results.length} passed`);
    console.log("================================\n");
    expect(failures, `Part B failures: ${failures.map((f) => f.check).join("; ")}`).toHaveLength(0);
  });
});
