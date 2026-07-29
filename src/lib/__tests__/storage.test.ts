import { describe, it, expect, beforeEach, vi } from "vitest";
import { createLocalStorageStore } from "@/lib/storage";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});

describe("ProgressStore", () => {
  let store: ReturnType<typeof createLocalStorageStore>;

  beforeEach(() => {
    localStorageMock.clear();
    store = createLocalStorageStore();
  });

  it("returns empty array initially", () => {
    expect(store.getCompletedExercises()).toEqual([]);
  });

  it("marks exercise as completed", () => {
    store.markExerciseCompleted("strategy-exercise");
    expect(store.getCompletedExercises()).toContain("strategy-exercise");
  });

  it("does not duplicate completed exercises", () => {
    store.markExerciseCompleted("strategy-exercise");
    store.markExerciseCompleted("strategy-exercise");
    expect(store.getCompletedExercises()).toHaveLength(1);
  });

  it("calculates pattern progress", () => {
    store.markExerciseCompleted("strategy-exercise");
    expect(store.getPatternProgress("strategy")).toBe(100);
    expect(store.getPatternProgress("factory-method")).toBe(0);
  });

  it("clears progress", () => {
    store.markExerciseCompleted("strategy-exercise");
    store.clearProgress();
    expect(store.getCompletedExercises()).toEqual([]);
  });
});
