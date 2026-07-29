import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PatternCard from "@/components/ui/PatternCard";
import type { PatternContent } from "@/content";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockPattern: PatternContent = {
  slug: "strategy",
  title: "Strategy",
  category: "COMPORTAMIENTO",
  categoryLabel: "Patrón de Comportamiento",
  difficulty: "Fácil",
  difficultyLevel: 1,
  description: "Define una familia de algoritmos.",
  codeTag: "BEHAVIORAL_03",
  theory: { problem: "test", problemDescription: "test", beforeAfter: { before: "A", after: "B" } },
  analogy: { title: "test", description: "test", quote: "test" },
  realCases: [],
  sections: {
    howItWorks: { title: "How it works", description: "Descripción", structureCode: "// code" },
    prosCons: { pros: ["Beneficio 1"], cons: ["Contra 1"] },
    whenToUse: "Usá cuando...",
    whenNotToUse: "No uses cuando...",
  },
  codeBefore: "code",
  codeAfter: "code",
  exercise: {
    title: "test",
    fileName: "test.ts",
    statement: "test",
    instructions: "test",
    acceptanceCriteria: [],
    starterCode: "code",
  },
};

describe("PatternCard", () => {
  it("renders pattern title", () => {
    render(<PatternCard pattern={mockPattern} progress={0} />);
    expect(screen.getAllByText("Strategy").length).toBeGreaterThanOrEqual(1);
  });

  it("renders category badge", () => {
    render(<PatternCard pattern={mockPattern} progress={0} />);
    expect(screen.getAllByText("COMPORTAMIENTO").length).toBeGreaterThanOrEqual(1);
  });

  it("renders difficulty", () => {
    render(<PatternCard pattern={mockPattern} progress={0} />);
    expect(screen.getAllByText("Fácil").length).toBeGreaterThanOrEqual(1);
  });

  it("renders progress percentage", () => {
    render(<PatternCard pattern={mockPattern} progress={50} />);
    expect(screen.getAllByText("50%").length).toBeGreaterThanOrEqual(1);
  });

  it("renders practice link with correct href", () => {
    render(<PatternCard pattern={mockPattern} progress={0} />);
    const links = screen.getAllByRole("link");
    const practiceLink = links.find((l) => l.getAttribute("href") === "/patterns/strategy");
    expect(practiceLink).toBeDefined();
  });
});
