/**
 * Stripper Test Battery
 *
 * Tests the TS→JS stripping capability against a range of TypeScript patterns.
 * Decision: Regex stripper failed 15/15 cases (100% failure). Sucrase chosen.
 *
 * After stripping with Sucrase, we verify `new Function(stripped)` does not
 * throw SyntaxError. Sucrase handles all modern TS patterns natively.
 */

import { describe, it, expect } from "vitest";
import { transform } from "sucrase";

// ── Helper: Sucrase-based TS→JS strip ──

function stripTypes(code: string): string {
  const result = transform(code, {
    transforms: ["typescript", "imports"],
  });
  let js = result.code;

  // Sucrase converts `export` to variable assignments — we need to remove
  // the `export` keyword so the code works inside `new Function()` which
  // doesn't support module-level exports.
  js = js.replace(/\bexport\s+(default\s+)?/g, "");

  // Remove `import` statements (we inject exports ourselves in the worker)
  js = js.replace(/^import\s+(?:type\s+)?[^;]+;\s*$/gm, "");

  // Strip decorator syntax (@decorator or @decorator(args))
  // Sucrase leaves these as-is; they're not valid JS outside of TC39 stage 3
  js = js.replace(/@\w+(?:\([^)]*\))?\s*/g, "");

  return js.trim();
}

// ── Test Battery ──

type TestCase = {
  name: string;
  input: string;
};

const TEST_CASES: TestCase[] = [
  {
    name: "nested generics",
    input: `
      function process<T extends Map<string, Array<number>>>(data: T): T {
        return data;
      }
    `,
  },
  {
    name: "decorators",
    input: `
      function sealed(constructor: Function) {
        Object.seal(constructor);
      }

      @sealed
      class Greeter {
        greeting: string;
        constructor(message: string) {
          this.greeting = message;
        }
      }
    `,
  },
  {
    name: "type assertions (as)",
    input: `
      const input = document.getElementById("input") as HTMLInputElement;
      const value = (input as any).value;
    `,
  },
  {
    name: "arrow function return types",
    input: `
      const add = (a: number, b: number): number => a + b;
      const identity = <T>(x: T): T => x;
    `,
  },
  {
    name: "union types",
    input: `
      type Status = "idle" | "loading" | "error" | "success";
      function handleStatus(status: Status): string {
        return status;
      }
    `,
  },
  {
    name: "intersection types",
    input: `
      type A = { name: string };
      type B = { age: number };
      type C = A & B;
      const obj: C = { name: "test", age: 1 };
    `,
  },
  {
    name: "enums",
    input: `
      enum Direction {
        Up = "UP",
        Down = "DOWN",
        Left = "LEFT",
        Right = "RIGHT",
      }
      const dir = Direction.Up;
    `,
  },
  {
    name: "optional interface methods",
    input: `
      interface Logger {
        log(message: string): void;
        warn?(message: string): void;
      }
    `,
  },
  {
    name: "class generics with constraints",
    input: `
      class Container<T extends { id: number }> {
        items: T[] = [];
        add(item: T): void {
          this.items.push(item);
        }
        getById(id: number): T | undefined {
          return this.items.find(item => item.id === id);
        }
      }
    `,
  },
  {
    name: "export default class",
    input: `
      export default class MyComponent {
        render(): string {
          return "hello";
        }
      }
    `,
  },
  {
    name: "readonly properties",
    input: `
      class Config {
        readonly apiUrl: string;
        constructor(url: string) {
          this.apiUrl = url;
        }
      }
    `,
  },
  {
    name: "abstract class",
    input: `
      abstract class Shape {
        abstract area(): number;
        describe(): string {
          return "Area: " + this.area();
        }
      }
    `,
  },
  {
    name: "implements clause",
    input: `
      interface Printable {
        print(): void;
      }
      class Document implements Printable {
        print(): void {
          console.log("doc");
        }
      }
    `,
  },
  {
    name: "type assertion in function args",
    input: `
      function process<T>(value: T): T {
        return value as T;
      }
    `,
  },
  {
    name: "complex arrow with optional params",
    input: `
      const handler = (event?: Event, context?: object): void => {
        if (event) event.preventDefault();
      };
    `,
  },
];

describe("stripTypes battery (Sucrase)", () => {
  for (const tc of TEST_CASES) {
    it(`should strip: ${tc.name}`, () => {
      const stripped = stripTypes(tc.input);

      // The stripped code should be valid JavaScript
      expect(() => {
        new Function(stripped);
      }).not.toThrow(SyntaxError);

      // Verify type annotations are removed
      expect(stripped).not.toMatch(/:\s*(string|number|boolean|void|any|never)\b/);
      // Verify interface/type declarations are removed
      expect(stripped).not.toMatch(/\b(interface|type)\s+\w+/);
      // Verify export keyword is removed
      expect(stripped).not.toMatch(/\bexport\b/);
    });
  }

  it("reports overall pass rate", () => {
    let passed = 0;
    let failed = 0;
    const failures: string[] = [];

    for (const tc of TEST_CASES) {
      try {
        const stripped = stripTypes(tc.input);
        new Function(stripped);
        passed++;
      } catch (e) {
        failed++;
        failures.push(`${tc.name}: ${(e as Error).message}`);
      }
    }

    const total = passed + failed;
    const passRate = ((passed / total) * 100).toFixed(1);
    console.log(`\n=== Stripper Battery Results (Sucrase) ===`);
    console.log(`Passed: ${passed}/${total} (${passRate}%)`);
    if (failures.length > 0) {
      console.log(`Failures:`);
      failures.forEach((f) => console.log(`  - ${f}`));
    }
    console.log(`==========================================\n`);

    // Sucrase should handle all cases
    expect(failed).toBe(0);
  });
});
