import { describe, it, expect } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import ExerciseSection from "@/components/patterns/ExerciseSection";
import { ProgressProvider } from "@/components/ProgressContext";
import type { PatternContent } from "@/content";

function renderWithProviders(ui: ReactNode) {
  return render(<ProgressProvider>{ui}</ProgressProvider>);
}

const mockPattern: PatternContent = {
  slug: "strategy",
  title: "Strategy",
  category: "COMPORTAMIENTO",
  categoryLabel: "Patrón de Comportamiento",
  difficulty: "Fácil",
  difficultyLevel: 1,
  description: "Test",
  codeTag: "BEHAVIORAL_03",
  theory: { problem: "test", problemDescription: "test", beforeAfter: { before: "A", after: "B" } },
  analogy: { title: "test", description: "test", quote: "test" },
  realCases: [],
  sections: {
    howItWorks: { title: "How it works", description: "Descripción del patrón\n\nMás detalles aquí", structureCode: "// code" },
    prosCons: { pros: ["Beneficio 1", "Beneficio 2"], cons: ["Contra 1"] },
    whenToUse: "Usá esto cuando necesites variantes.",
    whenNotToUse: "No uses esto si es muy simple.",
  },
  codeBefore: "code",
  codeAfter: "code",
  exercise: {
    title: "Reto de Implementación",
    fileName: "Tax_Calculator.ts",
    statement: "Implementa un calculador de impuestos.",
    instructions: "Refactorízalo para usar Strategy.",
    acceptanceCriteria: ["Crea interfaz", "Implementa estrategias"],
    starterCode: "// TODO: code here",
  },
};

describe("ExerciseSection", () => {
  it("renders exercise title", () => {
    renderWithProviders(<ExerciseSection pattern={mockPattern} />);
    expect(screen.getAllByText("Reto de Implementación").length).toBeGreaterThanOrEqual(1);
  });

  it("renders file name", () => {
    renderWithProviders(<ExerciseSection pattern={mockPattern} />);
    expect(screen.getAllByText("Tax_Calculator.ts").length).toBeGreaterThanOrEqual(1);
  });

  it("renders acceptance criteria", () => {
    renderWithProviders(<ExerciseSection pattern={mockPattern} />);
    expect(screen.getAllByText("Crea interfaz").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Implementa estrategias").length).toBeGreaterThanOrEqual(1);
  });

  it("renders run tests button", () => {
    renderWithProviders(<ExerciseSection pattern={mockPattern} />);
    expect(screen.getAllByText("Ejecutar Tests").length).toBeGreaterThanOrEqual(1);
  });
});
