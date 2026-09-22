/**
 * TestSuiteStatus Component Tests
 *
 * Verifies:
 * - Normal criterion display (pass/fail/pending/running)
 * - Unsupported language state (sandboxStatus="skipped")
 * - Neutral icon + Spanish message for skipped state
 * - Distinct from failure state
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import TestSuiteStatus from "@/components/patterns/TestSuiteStatus";
import type { TestSuiteResult } from "@/lib/test-runner/types";

const CRITERIA = [
  "Creates a Notification interface",
  "Implements concrete classes",
  "Factory returns correct type",
];

// Clean up after each test to prevent DOM accumulation
afterEach(() => {
  cleanup();
});

describe("TestSuiteStatus", () => {
  describe("normal states", () => {
    it("shows pending icons when no result and not running", () => {
      render(
        <TestSuiteStatus criteria={CRITERIA} result={null} isRunning={false} />
      );
      const icons = screen.getAllByText("pending");
      expect(icons).toHaveLength(3);
    });

    it("shows running state", () => {
      render(
        <TestSuiteStatus criteria={CRITERIA} result={null} isRunning={true} />
      );
      const icons = screen.getAllByText("sync");
      expect(icons).toHaveLength(3);
    });

    it("shows passed state", () => {
      const result: TestSuiteResult = {
        criterionResults: [
          { criterionIndex: 0, criterionLabel: CRITERIA[0], passed: true },
          { criterionIndex: 1, criterionLabel: CRITERIA[1], passed: true },
          { criterionIndex: 2, criterionLabel: CRITERIA[2], passed: true },
        ],
        allPassed: true,
      };
      render(
        <TestSuiteStatus criteria={CRITERIA} result={result} isRunning={false} />
      );
      const icons = screen.getAllByText("check_circle");
      expect(icons).toHaveLength(3);
      expect(screen.getByText("✓ Todos los tests pasaron")).toBeDefined();
    });

    it("shows failed state with error messages", () => {
      const result: TestSuiteResult = {
        criterionResults: [
          { criterionIndex: 0, criterionLabel: CRITERIA[0], passed: true },
          {
            criterionIndex: 1,
            criterionLabel: CRITERIA[1],
            passed: false,
            error: "No se encontró: EmailNotification",
          },
          { criterionIndex: 2, criterionLabel: CRITERIA[2], passed: false },
        ],
        allPassed: false,
      };
      render(
        <TestSuiteStatus criteria={CRITERIA} result={result} isRunning={false} />
      );
      const checkIcons = screen.getAllByText("check_circle");
      const errorIcons = screen.getAllByText("error");
      expect(checkIcons).toHaveLength(1);
      expect(errorIcons).toHaveLength(2);
      expect(screen.getByText("✗ 2 tests fallaron")).toBeDefined();
    });
  });

  describe("unsupported language (sandboxStatus=skipped)", () => {
    it("renders neutral info icon + Spanish message", () => {
      const result: TestSuiteResult = {
        criterionResults: [],
        allPassed: false,
        sandboxStatus: "skipped",
      };
      render(
        <TestSuiteStatus criteria={CRITERIA} result={result} isRunning={false} />
      );

      expect(screen.getAllByText("info")).toHaveLength(1);
      expect(
        screen.getByText(
          /Los tests automáticos deterministas solo están disponibles para/
        )
      ).toBeDefined();
      expect(
        screen.getByText(
          /TypeScript\/JavaScript por ahora/
        )
      ).toBeDefined();
      expect(
        screen.getByText(
          /validación es manual/
        )
      ).toBeDefined();
    });

    it("does NOT show criterion-by-criterion display", () => {
      const result: TestSuiteResult = {
        criterionResults: [],
        allPassed: false,
        sandboxStatus: "skipped",
      };
      const { container } = render(
        <TestSuiteStatus criteria={CRITERIA} result={result} isRunning={false} />
      );

      // Scope queries to this specific container to avoid cross-test pollution
      const criterionTexts = container.querySelectorAll(".flex-1");
      // The info message spans are the only .flex-1 elements; criteria are hidden
      const hasCriteria = Array.from(criterionTexts).some(
        (el) => el.textContent === "Creates a Notification interface"
      );
      expect(hasCriteria).toBe(false);
    });

    it("does NOT show pass/fail summary", () => {
      const result: TestSuiteResult = {
        criterionResults: [],
        allPassed: false,
        sandboxStatus: "skipped",
      };
      const { container } = render(
        <TestSuiteStatus criteria={CRITERIA} result={result} isRunning={false} />
      );

      // Check that no summary bar exists in this specific container
      const summaryBars = container.querySelectorAll(".border-t");
      expect(summaryBars).toHaveLength(0);
    });

    it("is visually distinct from failure state", () => {
      // Skipped state — should use "info" icon
      const skippedResult: TestSuiteResult = {
        criterionResults: [],
        allPassed: false,
        sandboxStatus: "skipped",
      };
      const { container: skippedContainer } = render(
        <TestSuiteStatus criteria={CRITERIA} result={skippedResult} isRunning={false} />
      );
      const skippedIcons = skippedContainer.querySelectorAll(".material-symbols-outlined");
      expect(skippedIcons.length).toBe(1);
      expect(skippedIcons[0].textContent).toBe("info");

      cleanup();

      // Failure state — should use "error" icon, not "info"
      const failedResult: TestSuiteResult = {
        criterionResults: [
          { criterionIndex: 0, criterionLabel: CRITERIA[0], passed: false },
          { criterionIndex: 1, criterionLabel: CRITERIA[1], passed: false },
          { criterionIndex: 2, criterionLabel: CRITERIA[2], passed: false },
        ],
        allPassed: false,
      };
      const { container: failedContainer } = render(
        <TestSuiteStatus criteria={CRITERIA} result={failedResult} isRunning={false} />
      );
      const failedIcons = failedContainer.querySelectorAll(".material-symbols-outlined");
      expect(failedIcons.length).toBe(3);
      expect(failedIcons[0].textContent).toBe("error");
      // Should NOT have info icon
      const infoIcons = Array.from(failedIcons).filter(
        (el) => el.textContent === "info"
      );
      expect(infoIcons).toHaveLength(0);
    });
  });
});
