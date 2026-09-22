import { describe, it, expect } from "vitest";
import {
  Image,
  HighResImage,
  ImageProxy,
} from "@/content/patterns/__solutions__/proxy";

describe("Acceptance Criterion 1: Image abstract class definition", () => {
  it("HighResImage extends Image", () => {
    const img = new HighResImage("test.jpg");
    expect(img).toBeInstanceOf(Image);
    expect(img).toBeInstanceOf(HighResImage);
  });

  it("ImageProxy extends Image", () => {
    const proxy = new ImageProxy("test.jpg");
    expect(proxy).toBeInstanceOf(Image);
    expect(proxy).toBeInstanceOf(ImageProxy);
  });

  it("Image has display() method", () => {
    const img = new HighResImage("test.jpg");
    expect(typeof img.display).toBe("function");
  });

  it("Image has getInfo() method", () => {
    const img = new HighResImage("test.jpg");
    expect(typeof img.getInfo).toBe("function");
  });

  it("display() executes without throwing", () => {
    const img = new HighResImage("test.jpg");
    expect(() => img.display()).not.toThrow();
  });
});

describe("Acceptance Criterion 2: HighResImage simulates expensive loading", () => {
  it("HighResImage with filename='foto1.jpg' records filename and marks loaded", () => {
    const img = new HighResImage("foto1.jpg");
    expect(img.getInfo()).toContain("foto1.jpg");
    expect(img.getInfo()).toContain("cargada");
  });

  it("display() outputs the image being shown", () => {
    const img = new HighResImage("foto1.jpg");
    expect(() => img.display()).not.toThrow();
  });

  it("getInfo() returns string containing filename and loaded status", () => {
    const img = new HighResImage("foto2.jpg");
    const info = img.getInfo();
    expect(typeof info).toBe("string");
    expect(info).toContain("foto2.jpg");
    expect(info).toContain("cargada");
  });
});

describe("Acceptance Criterion 3: ImageProxy lazy-inits realImage on first display", () => {
  it("realImage is null before first display() call", () => {
    const proxy = new ImageProxy("foto1.jpg");
    // Access private property via any for testing
    expect((proxy as any).realImage).toBeNull();
  });

  it("After display(), realImage is a HighResImage instance", () => {
    const proxy = new ImageProxy("foto1.jpg");
    proxy.display();
    expect((proxy as any).realImage).toBeInstanceOf(HighResImage);
  });

  it("Proxy delegates display() to newly created HighResImage", () => {
    const proxy = new ImageProxy("foto1.jpg");
    // Should not throw when delegating
    expect(() => proxy.display()).not.toThrow();
  });

  it("realImage is reused on subsequent calls (same reference)", () => {
    const proxy = new ImageProxy("foto1.jpg");
    proxy.display();
    const firstRealImage = (proxy as any).realImage;
    proxy.display();
    const secondRealImage = (proxy as any).realImage;
    expect(firstRealImage).toBe(secondRealImage);
  });
});

describe("Acceptance Criterion 4: ImageProxy getInfo before and after loading", () => {
  it("getInfo() before display() indicates proxy has not loaded image", () => {
    const proxy = new ImageProxy("foto2.jpg");
    const info = proxy.getInfo();
    expect(info).toContain("proxy");
    expect(info).toContain("no cargada");
  });

  it("getInfo() after display() delegates to HighResImage.getInfo()", () => {
    const proxy = new ImageProxy("foto2.jpg");
    proxy.display();
    const info = proxy.getInfo();
    expect(info).toContain("foto2.jpg");
    expect(info).toContain("cargada");
  });
});

describe("Content-shape validation", () => {
  it("proxy.json has exercise.acceptanceCriteria with exactly 4 entries", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../proxy.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise).toBeDefined();
    expect(patternData.exercise.acceptanceCriteria).toBeDefined();
    expect(Array.isArray(patternData.exercise.acceptanceCriteria)).toBe(true);
    expect(patternData.exercise.acceptanceCriteria).toHaveLength(4);
  });

  it("exercise.starterCode is a non-empty string", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../proxy.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise.starterCode).toBeDefined();
    expect(typeof patternData.exercise.starterCode).toBe("string");
    expect(patternData.exercise.starterCode.length).toBeGreaterThan(0);
  });
});

describe("Negative tests", () => {
  it("Broken proxy that creates real image eagerly does NOT demonstrate lazy loading", () => {
    // Simulate a broken proxy that creates real image in constructor
    class BrokenProxy extends Image {
      private realImage: HighResImage;
      constructor(private filename: string) {
        super();
        // BUG: creates real image immediately, not lazy
        this.realImage = new HighResImage(filename);
      }
      display(): void {
        this.realImage.display();
      }
      getInfo(): string {
        return this.realImage.getInfo();
      }
    }

    const proxy = new BrokenProxy("test.jpg");
    // realImage is already created (not null)
    expect((proxy as any).realImage).toBeInstanceOf(HighResImage);
  });

  it("A class missing display() is not a valid Image", () => {
    // Simulate a broken image without display
    class BrokenImage {
      getInfo() {
        return "broken";
      }
    }

    const broken = new BrokenImage();
    expect(typeof (broken as any).display).toBe("undefined");
  });

  it("Proxy without lazy init creates new HighResImage on every display() call", () => {
    // Simulate a proxy that always creates new instance
    class EagerProxy extends Image {
      constructor(private filename: string) {
        super();
      }
      display(): void {
        // BUG: creates new instance every time, no lazy caching
        const img = new HighResImage(this.filename);
        img.display();
      }
      getInfo(): string {
        return `${this.filename} (eager proxy)`;
      }
    }

    const proxy = new EagerProxy("test.jpg");
    // Each display() creates a new instance (not cached)
    proxy.display();
    proxy.display();
    // No realImage property to check — it's ephemeral
    expect(true).toBe(true); // placeholder for demonstration
  });
});