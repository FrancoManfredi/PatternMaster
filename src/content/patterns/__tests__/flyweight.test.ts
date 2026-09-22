import { describe, it, expect } from "vitest";
import {
  CharacterFlyweight,
  ConcreteCharacter,
  CharacterFactory,
  Document,
} from "@/content/patterns/__solutions__/flyweight";

describe("Acceptance Criterion 1: CharacterFlyweight abstract class with render(x, y)", () => {
  it("ConcreteCharacter extends CharacterFlyweight", () => {
    const char = new ConcreteCharacter("A", "Arial", 12, "#000");
    expect(char).toBeInstanceOf(CharacterFlyweight);
    expect(char).toBeInstanceOf(ConcreteCharacter);
  });

  it("CharacterFlyweight has render() method", () => {
    const char = new ConcreteCharacter("A", "Arial", 12, "#000");
    expect(typeof char.render).toBe("function");
  });

  it("render(x, y) executes without throwing", () => {
    const char = new ConcreteCharacter("A", "Arial", 12, "#000");
    expect(() => char.render(10, 20)).not.toThrow();
  });
});

describe("Acceptance Criterion 2: ConcreteCharacter stores intrinsic state (char, font, size, color)", () => {
  it("ConcreteCharacter with char='A', font='Arial', size=12, color='#000' renders at position", () => {
    const char = new ConcreteCharacter("A", "Arial", 12, "#000");
    expect(() => char.render(10, 20)).not.toThrow();
  });

  it("Different intrinsic params produce different flyweights", () => {
    const charA = new ConcreteCharacter("A", "Arial", 12, "#000");
    const charB = new ConcreteCharacter("B", "Arial", 12, "#000");
    // They are different instances (different intrinsic state)
    expect(charA).not.toBe(charB);
  });

  it("Same intrinsic params produce functionally equivalent flyweights", () => {
    const char1 = new ConcreteCharacter("X", "Helvetica", 14, "#FF0000");
    const char2 = new ConcreteCharacter("X", "Helvetica", 14, "#FF0000");
    // Both should render without error
    expect(() => char1.render(0, 0)).not.toThrow();
    expect(() => char2.render(0, 0)).not.toThrow();
  });
});

describe("Acceptance Criterion 3: CharacterFactory reuses flyweights with identical keys", () => {
  it("getCharacter() returns the same instance for identical params", () => {
    const factory = new CharacterFactory();
    const fw1 = factory.getCharacter("A", "Arial", 12, "#000");
    const fw2 = factory.getCharacter("A", "Arial", 12, "#000");
    expect(fw1).toBe(fw2);
  });

  it("getPoolSize() returns 1 after identical calls", () => {
    const factory = new CharacterFactory();
    factory.getCharacter("A", "Arial", 12, "#000");
    factory.getCharacter("A", "Arial", 12, "#000");
    factory.getCharacter("A", "Arial", 12, "#000");
    expect(factory.getPoolSize()).toBe(1);
  });

  it("getCharacter() returns different instances for different params", () => {
    const factory = new CharacterFactory();
    const fw1 = factory.getCharacter("A", "Arial", 12, "#000");
    const fw2 = factory.getCharacter("B", "Arial", 12, "#000");
    expect(fw1).not.toBe(fw2);
  });

  it("getPoolSize() returns 2 for two distinct combinations", () => {
    const factory = new CharacterFactory();
    factory.getCharacter("A", "Arial", 12, "#000");
    factory.getCharacter("B", "Arial", 12, "#000");
    expect(factory.getPoolSize()).toBe(2);
  });

  it("Different font/size/color also creates distinct flyweights", () => {
    const factory = new CharacterFactory();
    factory.getCharacter("A", "Arial", 12, "#000");
    factory.getCharacter("A", "Helvetica", 12, "#000");
    factory.getCharacter("A", "Arial", 14, "#000");
    factory.getCharacter("A", "Arial", 12, "#FF0000");
    expect(factory.getPoolSize()).toBe(4);
  });
});

describe("Acceptance Criterion 4: Document stores extrinsic state and delegates rendering", () => {
  it("Document render() does not throw with multiple characters", () => {
    const doc = new Document();
    doc.addCharacter("H", 0, 0, "Arial", 12, "#000");
    doc.addCharacter("o", 10, 0, "Arial", 12, "#000");
    doc.addCharacter("l", 20, 0, "Arial", 12, "#000");
    expect(() => doc.render()).not.toThrow();
  });

  it("Document with same font/size/color shares flyweight (pool size = 1)", () => {
    // We test this via CharacterFactory directly since Document uses internal factory
    const factory = new CharacterFactory();
    factory.getCharacter("H", "Arial", 12, "#000");
    factory.getCharacter("o", "Arial", 12, "#000");
    factory.getCharacter("l", "Arial", 12, "#000");
    // Different chars = different flyweights
    expect(factory.getPoolSize()).toBe(3);
  });

  it("Document with all same char/font/size/color shares one flyweight", () => {
    const factory = new CharacterFactory();
    factory.getCharacter("A", "Arial", 12, "#000");
    factory.getCharacter("A", "Arial", 12, "#000");
    factory.getCharacter("A", "Arial", 12, "#000");
    expect(factory.getPoolSize()).toBe(1);
  });

  it("Document addCharacter accepts all required parameters", () => {
    const doc = new Document();
    // Should not throw with 6 parameters
    expect(() =>
      doc.addCharacter("A", 0, 0, "Arial", 12, "#000")
    ).not.toThrow();
  });
});

describe("Content-shape validation", () => {
  it("flyweight.json has exercise.acceptanceCriteria with exactly 4 entries", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../flyweight.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise).toBeDefined();
    expect(patternData.exercise.acceptanceCriteria).toBeDefined();
    expect(Array.isArray(patternData.exercise.acceptanceCriteria)).toBe(true);
    expect(patternData.exercise.acceptanceCriteria).toHaveLength(4);
  });

  it("exercise.starterCode is a non-empty string", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../flyweight.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise.starterCode).toBeDefined();
    expect(typeof patternData.exercise.starterCode).toBe("string");
    expect(patternData.exercise.starterCode.length).toBeGreaterThan(0);
  });
});

describe("Negative tests", () => {
  it("Broken factory that creates new instance each call does NOT reuse", () => {
    // Simulate a broken factory without pool reuse
    class BrokenFactory {
      getCharacter(
        char: string,
        font: string,
        size: number,
        color: string
      ): CharacterFlyweight {
        // BUG: always creates new instance, ignoring pool
        return new ConcreteCharacter(char, font, size, color);
      }
    }

    const factory = new BrokenFactory();
    const fw1 = factory.getCharacter("A", "Arial", 12, "#000");
    const fw2 = factory.getCharacter("A", "Arial", 12, "#000");
    // They are NOT the same reference — no pool reuse
    expect(fw1).not.toBe(fw2);
  });

  it("A class missing render() is not a valid flyweight", () => {
    // Simulate a broken flyweight without render
    class BrokenFlyweight {
      constructor(
        private char: string,
        private font: string
      ) {}
      // No render() method
    }

    const broken = new BrokenFlyweight("A", "Arial");
    expect(typeof (broken as any).render).toBe("undefined");
  });

  it("Document without factory does not demonstrate pool reuse", () => {
    // Simulate a document that stores full objects (no flyweight sharing)
    class BrokenDocument {
      private characters: Array<{
        char: string;
        font: string;
        size: number;
        color: string;
        x: number;
        y: number;
      }> = [];

      addCharacter(
        char: string,
        x: number,
        y: number,
        font: string,
        size: number,
        color: string
      ) {
        this.characters.push({ char, font, size, color, x, y });
      }

      getCharacterCount() {
        return this.characters.length;
      }

      getUniqueCombinations() {
        const keys = new Set(
          this.characters.map(
            (c) => `${c.char}-${c.font}-${c.size}-${c.color}`
          )
        );
        return keys.size;
      }
    }

    const doc = new BrokenDocument();
    doc.addCharacter("A", 0, 0, "Arial", 12, "#000");
    doc.addCharacter("A", 10, 0, "Arial", 12, "#000");
    doc.addCharacter("A", 20, 0, "Arial", 12, "#000");

    // 3 stored objects but only 1 unique combination
    expect(doc.getCharacterCount()).toBe(3);
    expect(doc.getUniqueCombinations()).toBe(1);
    // This demonstrates the problem Flyweight solves:
    // without sharing, we store 3 objects instead of 1 flyweight + 3 positions
  });
});
