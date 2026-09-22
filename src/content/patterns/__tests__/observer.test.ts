import { describe, it, expect, vi } from "vitest";
import {
  StockObserver,
  StockTicker,
  Buyer,
  Seller,
} from "@/content/patterns/__solutions__/observer";

describe("Acceptance Criterion 1: StockObserver base class", () => {
  it("StockObserver is a class with update(stock, price) method", () => {
    const observer = new StockObserver();
    expect(typeof observer.update).toBe("function");
  });

  it("update() can be called without throwing", () => {
    const observer = new StockObserver();
    expect(() => observer.update("AAPL", 100)).not.toThrow();
  });
});

describe("Acceptance Criterion 2: StockTicker as subject", () => {
  it("StockTicker has subscribe, unsubscribe, and setPrice methods", () => {
    const ticker = new StockTicker();
    expect(typeof ticker.subscribe).toBe("function");
    expect(typeof ticker.unsubscribe).toBe("function");
    expect(typeof ticker.setPrice).toBe("function");
  });

  it("subscribe adds an observer that gets notified", () => {
    const ticker = new StockTicker();
    const observer = new StockObserver();
    const spy = vi.spyOn(observer, "update");

    ticker.subscribe(observer);
    ticker.setPrice("AAPL", 150);

    expect(spy).toHaveBeenCalledWith("AAPL", 150);
  });

  it("unsubscribe removes an observer so it no longer gets notified", () => {
    const ticker = new StockTicker();
    const observer = new StockObserver();
    const spy = vi.spyOn(observer, "update");

    ticker.subscribe(observer);
    ticker.setPrice("AAPL", 150);
    expect(spy).toHaveBeenCalledTimes(1);

    ticker.unsubscribe(observer);
    ticker.setPrice("AAPL", 160);
    expect(spy).toHaveBeenCalledTimes(1); // not called again
  });
});

describe("Acceptance Criterion 3: Buyer extends StockObserver", () => {
  it("Buyer is a subclass of StockObserver", () => {
    const buyer = new Buyer("Alice", 100);
    expect(buyer).toBeInstanceOf(StockObserver);
    expect(buyer).toBeInstanceOf(Buyer);
  });

  it("Buyer records 'buying' when price drops below threshold", () => {
    const buyer = new Buyer("Alice", 100);
    const ticker = new StockTicker();
    ticker.subscribe(buyer);

    ticker.setPrice("AAPL", 90);
    expect(buyer.getLastAction()).toBe("buying");
  });

  it("Buyer does NOT react when price is above threshold", () => {
    const buyer = new Buyer("Alice", 100);
    const ticker = new StockTicker();
    ticker.subscribe(buyer);

    ticker.setPrice("AAPL", 150);
    expect(buyer.getLastAction()).toBe("");
  });
});

describe("Acceptance Criterion 4: Seller extends StockObserver", () => {
  it("Seller is a subclass of StockObserver", () => {
    const seller = new Seller("Bob", 150);
    expect(seller).toBeInstanceOf(StockObserver);
    expect(seller).toBeInstanceOf(Seller);
  });

  it("Seller records 'selling' when price rises above threshold", () => {
    const seller = new Seller("Bob", 150);
    const ticker = new StockTicker();
    ticker.subscribe(seller);

    ticker.setPrice("AAPL", 160);
    expect(seller.getLastAction()).toBe("selling");
  });

  it("Seller does NOT react when price is below threshold", () => {
    const seller = new Seller("Bob", 150);
    const ticker = new StockTicker();
    ticker.subscribe(seller);

    ticker.setPrice("AAPL", 100);
    expect(seller.getLastAction()).toBe("");
  });
});

describe("Acceptance Criterion 5: Both observers receive notifications", () => {
  it("Both Buyer and Seller are notified when price changes", () => {
    const ticker = new StockTicker();
    const buyer = new Buyer("Alice", 100);
    const seller = new Seller("Bob", 150);

    ticker.subscribe(buyer);
    ticker.subscribe(seller);

    // Price 90: Buyer should react (90 <= 100), Seller should not (90 < 150)
    ticker.setPrice("AAPL", 90);
    expect(buyer.getLastAction()).toBe("buying");
    expect(seller.getLastAction()).toBe("");

    // Price 160: Seller should react (160 >= 150), Buyer still has previous action
    ticker.setPrice("AAPL", 160);
    expect(seller.getLastAction()).toBe("selling");
  });

  it("Multiple observers of the same type all get notified", () => {
    const ticker = new StockTicker();
    const buyer1 = new Buyer("Alice", 100);
    const buyer2 = new Buyer("Charlie", 80);

    ticker.subscribe(buyer1);
    ticker.subscribe(buyer2);

    ticker.setPrice("AAPL", 90);
    expect(buyer1.getLastAction()).toBe("buying"); // 90 <= 100
    expect(buyer2.getLastAction()).toBe(""); // 90 > 80

    ticker.setPrice("AAPL", 75);
    expect(buyer2.getLastAction()).toBe("buying"); // 75 <= 80
  });
});

describe("Content-shape validation", () => {
  it("observer.json has exercise.acceptanceCriteria with exactly 5 entries", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../observer.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise).toBeDefined();
    expect(patternData.exercise.acceptanceCriteria).toBeDefined();
    expect(Array.isArray(patternData.exercise.acceptanceCriteria)).toBe(true);
    expect(patternData.exercise.acceptanceCriteria).toHaveLength(5);
  });

  it("exercise.starterCode is a non-empty string", () => {
    const fs = require("fs");
    const path = require("path");
    const jsonPath = path.resolve(__dirname, "../observer.json");
    const patternData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

    expect(patternData.exercise.starterCode).toBeDefined();
    expect(typeof patternData.exercise.starterCode).toBe("string");
    expect(patternData.exercise.starterCode.length).toBeGreaterThan(0);
  });
});
