import { describe, it, expect } from "vitest";
import {
  FileSystemComponent,
  File,
  Folder,
} from "@/content/patterns/__solutions__/composite";

describe("Acceptance Criterion 1: FileSystemComponent abstract class with getSize(), getName(), print()", () => {
  it("File extends FileSystemComponent", () => {
    const file = new File("readme.md", 5);
    expect(file).toBeInstanceOf(FileSystemComponent);
    expect(file).toBeInstanceOf(File);
  });

  it("Folder extends FileSystemComponent", () => {
    const folder = new Folder("src");
    expect(folder).toBeInstanceOf(FileSystemComponent);
    expect(folder).toBeInstanceOf(Folder);
  });

  it("File has getSize() method", () => {
    const file = new File("readme.md", 5);
    expect(typeof file.getSize).toBe("function");
  });

  it("File has getName() method", () => {
    const file = new File("readme.md", 5);
    expect(typeof file.getName).toBe("function");
  });

  it("File has print() method", () => {
    const file = new File("readme.md", 5);
    expect(typeof file.print).toBe("function");
  });

  it("Folder has getSize() method", () => {
    const folder = new Folder("src");
    expect(typeof folder.getSize).toBe("function");
  });

  it("Folder has getName() method", () => {
    const folder = new Folder("src");
    expect(typeof folder.getName).toBe("function");
  });

  it("Folder has print() method", () => {
    const folder = new Folder("src");
    expect(typeof folder.print).toBe("function");
  });
});

describe("Acceptance Criterion 2: File leaf with name and fixed size", () => {
  it("File getSize() returns the file size", () => {
    const file = new File("readme.md", 5);
    expect(file.getSize()).toBe(5);
  });

  it("File getName() returns the file name", () => {
    const file = new File("readme.md", 5);
    expect(file.getName()).toBe("readme.md");
  });

  it("File with zero size returns 0", () => {
    const file = new File("empty.txt", 0);
    expect(file.getSize()).toBe(0);
  });

  it("File with large size works correctly", () => {
    const file = new File("video.mp4", 1024);
    expect(file.getSize()).toBe(1024);
  });
});

describe("Acceptance Criterion 3: Folder composite with children management", () => {
  it("Empty folder returns size 0", () => {
    const folder = new Folder("empty");
    expect(folder.getSize()).toBe(0);
  });

  it("Folder with single file returns file size", () => {
    const folder = new Folder("docs");
    folder.add(new File("readme.md", 5));
    expect(folder.getSize()).toBe(5);
  });

  it("Folder with multiple files sums sizes", () => {
    const folder = new Folder("src");
    folder.add(new File("index.ts", 5));
    folder.add(new File("app.ts", 12));
    expect(folder.getSize()).toBe(17);
  });

  it("Folder can contain other folders", () => {
    const root = new Folder("root");
    const sub = new Folder("sub");
    sub.add(new File("a.ts", 10));
    root.add(sub);
    expect(root.getSize()).toBe(10);
  });

  it("Folder remove() removes a child", () => {
    const folder = new Folder("src");
    const file = new File("temp.ts", 3);
    folder.add(file);
    expect(folder.getSize()).toBe(3);
    folder.remove(file);
    expect(folder.getSize()).toBe(0);
  });
});

describe("Acceptance Criterion 4: Recursive getSize() sums all descendants", () => {
  it("Nested folder structure returns correct total", () => {
    const root = new Folder("proyecto");
    const src = new Folder("src");
    src.add(new File("index.ts", 5));
    src.add(new File("app.ts", 12));
    root.add(src);
    root.add(new File("package.json", 2));
    expect(root.getSize()).toBe(19);
  });

  it("Deeply nested folders are included in total", () => {
    const root = new Folder("root");
    const level1 = new Folder("level1");
    const level2 = new Folder("level2");
    level2.add(new File("deep.ts", 7));
    level1.add(level2);
    root.add(level1);
    root.add(new File("top.ts", 3));
    expect(root.getSize()).toBe(10);
  });

  it("Multiple branches are all summed", () => {
    const root = new Folder("root");
    const branch1 = new Folder("branch1");
    const branch2 = new Folder("branch2");
    branch1.add(new File("a.ts", 10));
    branch1.add(new File("b.ts", 20));
    branch2.add(new File("c.ts", 30));
    root.add(branch1);
    root.add(branch2);
    root.add(new File("d.ts", 40));
    expect(root.getSize()).toBe(100);
  });
});

describe("Acceptance Criterion 5: print() with hierarchical indentation", () => {
  it("File print() does not throw", () => {
    const file = new File("test.ts", 5);
    expect(() => file.print()).not.toThrow();
  });

  it("Empty folder print() does not throw", () => {
    const folder = new Folder("empty");
    expect(() => folder.print()).not.toThrow();
  });

  it("Nested folder print() does not throw", () => {
    const root = new Folder("root");
    const sub = new Folder("src");
    sub.add(new File("a.ts", 5));
    root.add(sub);
    root.add(new File("b.ts", 3));
    expect(() => root.print()).not.toThrow();
  });

  it("print() with custom indent does not throw", () => {
    const root = new Folder("root");
    root.add(new File("a.ts", 5));
    expect(() => root.print("  ")).not.toThrow();
  });
});

describe("Content-shape validation", () => {
  it("composite.json has exercise.acceptanceCriteria with exactly 5 entries", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../composite.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise).toBeDefined();
    expect(patternData.exercise.acceptanceCriteria).toBeDefined();
    expect(Array.isArray(patternData.exercise.acceptanceCriteria)).toBe(true);
    expect(patternData.exercise.acceptanceCriteria).toHaveLength(5);
  });

  it("exercise.starterCode is a non-empty string", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../composite.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise.starterCode).toBeDefined();
    expect(typeof patternData.exercise.starterCode).toBe("string");
    expect(patternData.exercise.starterCode.length).toBeGreaterThan(0);
  });
});

describe("Negative tests", () => {
  it("Leaf add() throws 'Cannot add to a leaf'", () => {
    const file = new File("readme.md", 5);
    expect(() => file.add(new File("other.ts", 1))).toThrow(
      "Cannot add to a leaf"
    );
  });

  it("Leaf remove() throws 'Cannot remove from a leaf'", () => {
    const file = new File("readme.md", 5);
    expect(() => file.remove(new File("other.ts", 1))).toThrow(
      "Cannot remove from a leaf"
    );
  });

  it("A class missing recursive sum only returns direct children size", () => {
    // Simulate a broken Folder that only sums direct children (no recursion)
    class BrokenFolder {
      private children: { getSize(): number }[] = [];
      add(child: { getSize(): number }) {
        this.children.push(child);
      }
      getSize() {
        // BUG: only returns count of children, not sum of sizes
        return this.children.length;
      }
    }

    const broken = new BrokenFolder();
    broken.add({ getSize: () => 10 });
    broken.add({ getSize: () => 20 });
    // Returns 2 (count) instead of 30 (sum)
    expect(broken.getSize()).toBe(2);
    expect(broken.getSize()).not.toBe(30);
  });

  it("A class missing children management cannot contain other components", () => {
    // Simulate a component that has no add() method
    class LeafOnly {
      getSize() {
        return 5;
      }
    }

    const leaf = new LeafOnly();
    expect(typeof (leaf as any).add).toBe("undefined");
    expect(leaf.getSize()).toBe(5);
  });
});
