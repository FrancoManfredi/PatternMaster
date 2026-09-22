import { describe, it, expect } from "vitest";
import {
  Shape,
  Circle,
  Rectangle,
} from "@/content/patterns/__solutions__/prototype";

describe("Acceptance Criterion 1: Shape interface with clone() and describe()", () => {
  it("Circle has clone() method", () => {
    const circle = new Circle(5, "red", { x: 0, y: 0 }, []);
    expect(typeof circle.clone).toBe("function");
  });

  it("Circle has describe() method", () => {
    const circle = new Circle(5, "red", { x: 0, y: 0 }, []);
    expect(typeof circle.describe).toBe("function");
  });

  it("Rectangle has clone() method", () => {
    const rect = new Rectangle(10, 20, "blue", { x: 0, y: 0 }, []);
    expect(typeof rect.clone).toBe("function");
  });

  it("Rectangle has describe() method", () => {
    const rect = new Rectangle(10, 20, "blue", { x: 0, y: 0 }, []);
    expect(typeof rect.describe).toBe("function");
  });

  it("Circle extends Shape", () => {
    const circle = new Circle(5, "red", { x: 0, y: 0 }, []);
    expect(circle).toBeInstanceOf(Shape);
    expect(circle).toBeInstanceOf(Circle);
  });

  it("Rectangle extends Shape", () => {
    const rect = new Rectangle(10, 20, "blue", { x: 0, y: 0 }, []);
    expect(rect).toBeInstanceOf(Shape);
    expect(rect).toBeInstanceOf(Rectangle);
  });
});

describe("Acceptance Criterion 2: Circle with position, color, and points", () => {
  it("Circle stores radius, color, position, and points", () => {
    const circle = new Circle(5, "red", { x: 10, y: 20 }, [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
    expect(circle.radius).toBe(5);
    expect(circle.color).toBe("red");
    expect(circle.position).toEqual({ x: 10, y: 20 });
    expect(circle.points).toHaveLength(2);
  });

  it("Circle.clone() returns a new Circle instance", () => {
    const circle = new Circle(5, "red", { x: 0, y: 0 }, [{ x: 1, y: 1 }]);
    const clone = circle.clone();
    expect(clone).toBeInstanceOf(Circle);
    expect(clone).not.toBe(circle);
  });

  it("Circle.clone() copies all properties", () => {
    const circle = new Circle(5, "red", { x: 10, y: 20 }, [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
    const clone = circle.clone();
    expect(clone.radius).toBe(5);
    expect(clone.color).toBe("red");
    expect(clone.position).toEqual({ x: 10, y: 20 });
    expect(clone.points).toHaveLength(2);
  });

  it("Circle.describe() returns a string with shape info", () => {
    const circle = new Circle(5, "red", { x: 10, y: 20 }, [
      { x: 1, y: 1 },
    ]);
    const desc = circle.describe();
    expect(typeof desc).toBe("string");
    expect(desc).toContain("Circle");
    expect(desc).toContain("5");
    expect(desc).toContain("red");
  });
});

describe("Acceptance Criterion 3: Rectangle with position, color, and points", () => {
  it("Rectangle stores width, height, color, position, and points", () => {
    const rect = new Rectangle(10, 20, "blue", { x: 5, y: 15 }, [
      { x: 1, y: 1 },
    ]);
    expect(rect.width).toBe(10);
    expect(rect.height).toBe(20);
    expect(rect.color).toBe("blue");
    expect(rect.position).toEqual({ x: 5, y: 15 });
    expect(rect.points).toHaveLength(1);
  });

  it("Rectangle.clone() returns a new Rectangle instance", () => {
    const rect = new Rectangle(10, 20, "blue", { x: 0, y: 0 }, []);
    const clone = rect.clone();
    expect(clone).toBeInstanceOf(Rectangle);
    expect(clone).not.toBe(rect);
  });

  it("Rectangle.clone() copies all properties", () => {
    const rect = new Rectangle(10, 20, "blue", { x: 5, y: 15 }, [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
    const clone = rect.clone();
    expect(clone.width).toBe(10);
    expect(clone.height).toBe(20);
    expect(clone.color).toBe("blue");
    expect(clone.position).toEqual({ x: 5, y: 15 });
    expect(clone.points).toHaveLength(2);
  });

  it("Rectangle.describe() returns a string with shape info", () => {
    const rect = new Rectangle(10, 20, "blue", { x: 5, y: 15 }, []);
    const desc = rect.describe();
    expect(typeof desc).toBe("string");
    expect(desc).toContain("Rectangle");
    expect(desc).toContain("10");
    expect(desc).toContain("blue");
  });
});

describe("Acceptance Criterion 4: Deep copy — clone() produces independent copies", () => {
  it("Circle: mutating clone.position does NOT affect original", () => {
    const original = new Circle(5, "red", { x: 0, y: 0 }, []);
    const clone = original.clone();

    clone.position.x = 100;
    clone.position.y = 200;

    expect(original.position.x).toBe(0);
    expect(original.position.y).toBe(0);
    expect(clone.position.x).toBe(100);
    expect(clone.position.y).toBe(200);
  });

  it("Circle: mutating clone.points does NOT affect original", () => {
    const original = new Circle(5, "red", { x: 0, y: 0 }, [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]);
    const clone = original.clone();

    clone.points[0].x = 999;
    clone.points[1].y = 888;

    expect(original.points[0].x).toBe(1);
    expect(original.points[1].y).toBe(2);
    expect(clone.points[0].x).toBe(999);
    expect(clone.points[1].y).toBe(888);
  });

  it("Rectangle: mutating clone.position does NOT affect original", () => {
    const original = new Rectangle(10, 20, "blue", { x: 5, y: 15 }, []);
    const clone = original.clone();

    clone.position.x = 500;

    expect(original.position.x).toBe(5);
    expect(clone.position.x).toBe(500);
  });

  it("Rectangle: mutating clone.points does NOT affect original", () => {
    const original = new Rectangle(10, 20, "blue", { x: 0, y: 0 }, [
      { x: 1, y: 1 },
    ]);
    const clone = original.clone();

    clone.points[0].x = 777;

    expect(original.points[0].x).toBe(1);
    expect(clone.points[0].x).toBe(777);
  });

  it("Adding points to clone does NOT affect original", () => {
    const original = new Circle(5, "red", { x: 0, y: 0 }, [
      { x: 1, y: 1 },
    ]);
    const clone = original.clone();

    clone.points.push({ x: 99, y: 99 });

    expect(original.points).toHaveLength(1);
    expect(clone.points).toHaveLength(2);
  });
});

describe("Content-shape validation", () => {
  it("prototype.json has exercise.acceptanceCriteria with exactly 4 entries", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../prototype.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise).toBeDefined();
    expect(patternData.exercise.acceptanceCriteria).toBeDefined();
    expect(Array.isArray(patternData.exercise.acceptanceCriteria)).toBe(true);
    expect(patternData.exercise.acceptanceCriteria).toHaveLength(4);
  });

  it("exercise.starterCode is a non-empty string", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../prototype.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise.starterCode).toBeDefined();
    expect(typeof patternData.exercise.starterCode).toBe("string");
    expect(patternData.exercise.starterCode.length).toBeGreaterThan(0);
  });
});

describe("Negative tests", () => {
  it("A class missing clone() does not satisfy Shape interface", () => {
    class BadShape {
      describe() {
        return "bad";
      }
      // No clone() method
    }

    const bad = new BadShape();
    expect(typeof (bad as any).clone).toBe("undefined");
  });

  it("Shallow copy (spread) mutates original — demonstrates the bug Prototype solves", () => {
    // This demonstrates WHY we need deep copy
    const original = {
      radius: 5,
      position: { x: 0, y: 0 },
      points: [{ x: 1, y: 1 }],
    };

    // Shallow copy via spread
    const shallowCopy = { ...original };
    shallowCopy.position.x = 100;
    shallowCopy.points[0].x = 999;

    // BUG: original is affected because spread only copies top level
    expect(original.position.x).toBe(100); // ← This is the bug!
    expect(original.points[0].x).toBe(999); // ← This is the bug!
  });

  it("A class with wrong clone() returning same reference fails deep copy check", () => {
    // Simulate a broken clone that returns `this`
    class BrokenClone extends Shape {
      constructor(public value: number) {
        super();
      }
      clone(): Shape {
        return this; // BUG: returns same reference, not a copy
      }
      describe(): string {
        return `Broken(${this.value})`;
      }
    }

    const original = new BrokenClone(42);
    const clone = original.clone();

    // clone IS the same reference — this is the anti-pattern
    expect(clone).toBe(original);
  });
});
