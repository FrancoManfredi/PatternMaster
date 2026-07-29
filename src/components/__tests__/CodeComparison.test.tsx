import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CodeComparison from "@/components/patterns/CodeComparison";

describe("CodeComparison", () => {
  it("renders ANTI_PATTERN label", () => {
    render(<CodeComparison codeBefore="bad code" codeAfter="good code" />);
    expect(screen.getAllByText("ANTI_PATTERN").length).toBeGreaterThanOrEqual(1);
  });

  it("renders STRATEGY_PATTERN label", () => {
    render(<CodeComparison codeBefore="bad code" codeAfter="good code" />);
    expect(screen.getAllByText("STRATEGY_PATTERN").length).toBeGreaterThanOrEqual(1);
  });

  it("renders code before", () => {
    const { container } = render(<CodeComparison codeBefore="class Bad {}" codeAfter="class Good {}" />);
    // Text is wrapped in syntax highlight spans — check the pre element textContent
    const preElements = container.querySelectorAll("pre");
    expect(preElements[0]?.textContent).toContain("class Bad");
  });

  it("renders code after", () => {
    const { container } = render(<CodeComparison codeBefore="class Bad {}" codeAfter="class Good {}" />);
    const preElements = container.querySelectorAll("pre");
    expect(preElements[1]?.textContent).toContain("class Good");
  });

  it("renders evolution header", () => {
    render(<CodeComparison codeBefore="bad" codeAfter="good" />);
    expect(screen.getAllByText("Evolución del Código").length).toBeGreaterThanOrEqual(1);
  });
});
