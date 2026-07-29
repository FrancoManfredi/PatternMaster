"use client";

import { useState, useMemo } from "react";
import type { PatternContent } from "@/content";
import { getGuidedExercise } from "@/content/guided";
import GuidedCodeBlock from "@/components/guided/GuidedCodeBlock";
import {
  getGuidedStepProgress,
  saveGuidedStepProgress,
  type GuidedStepState,
} from "@/lib/storage";

interface GuidedExerciseSectionProps {
  pattern: PatternContent;
}

export default function GuidedExerciseSection({ pattern }: GuidedExerciseSectionProps) {
  const guided = getGuidedExercise(pattern.slug);

  // Single source of truth: stepStates + currentStep derived from it
  const [stepStates, setStepStates] = useState<Record<number, GuidedStepState>>(() => {
    if (!guided) return {};
    const saved = getGuidedStepProgress(pattern.slug);
    const hasData = Object.keys(saved).length > 0;
    const hasCurrent = Object.values(saved).includes("current");
    const allValid = hasData
      ? Object.values(saved).every(
          (v) => v === "unread" || v === "current" || v === "read"
        )
      : true;

    if (!hasData || !hasCurrent || !allValid) {
      const initial: Record<number, GuidedStepState> = {};
      guided.steps.forEach((_, i) => {
        initial[i] = i === 0 ? "current" : "unread";
      });
      return initial;
    }
    return saved;
  });

  // Derive currentStep from stepStates (single source)
  const currentStep = useMemo(() => {
    for (const [idx, state] of Object.entries(stepStates)) {
      if (state === "current") return parseInt(idx);
    }
    return 0;
  }, [stepStates]);

  const step = guided?.steps[currentStep];

  if (!guided || !step) {
    return (
      <section className="w-full max-w-[1280px] mx-auto px-[24px] relative z-10">
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 text-center">
          <p className="font-body text-on-surface-variant text-body-md">
            Modo guiado no disponible para este patrón.
          </p>
        </div>
      </section>
    );
  }

  const navigateToStep = (index: number) => {
    setStepStates((prev) => {
      const next = { ...prev };
      // Mark previous "current" as "read"
      for (const [key, state] of Object.entries(next)) {
        if (state === "current") {
          next[parseInt(key)] = "read";
          break;
        }
      }
      // Mark target as "current"
      next[index] = "current";
      // Persist immediately (no useEffect)
      saveGuidedStepProgress(pattern.slug, next);
      return next;
    });
  };

  const goToPrevious = () => {
    if (currentStep > 0) navigateToStep(currentStep - 1);
  };

  const goToNext = () => {
    if (currentStep < guided.steps.length - 1) navigateToStep(currentStep + 1);
  };

  const getStepIcon = (index: number) => {
    const state = stepStates[index];
    switch (state) {
      case "current": return "●";
      case "read": return "✓";
      default: return "○";
    }
  };

  const getStepLabel = (index: number) => {
    const state = stepStates[index];
    switch (state) {
      case "current": return "Paso actual";
      case "read": return "Visto";
      default: return "No visto";
    }
  };

  const isLastStep = currentStep === guided.steps.length - 1;
  const currentCode = step.code.typescript;

  return (
    <section className="w-full max-w-[1280px] mx-auto px-[24px] relative z-10">
      <div className="bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-surface-container-high border-b border-outline-variant/30 p-6">
          <h3 className="font-headline text-headline-sm text-on-surface m-0">
            {guided.title}
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Column: Objective + Step Sidebar */}
          <div className="w-full lg:w-72 bg-surface-container p-4 border-r border-outline-variant/30 flex flex-col gap-4 shrink-0">
            {/* Objective Block (same literal text as Modo Libre) */}
            <div>
              <h4 className="text-on-surface font-headline text-lg mb-2">
                Objetivo
              </h4>
              <p className="font-body text-body-md text-on-surface-variant mb-3">
                {pattern.exercise.statement}
              </p>
              <p className="font-body text-body-md text-on-surface-variant">
                {pattern.exercise.instructions}
              </p>
            </div>

            {/* Separator */}
            <hr className="border-outline-variant/30" />

            {/* Step Sidebar with Numbers */}
            <div className="flex flex-col gap-1">
              {guided.steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => navigateToStep(i)}
                  className={`text-left px-3 py-2 rounded font-body text-sm transition-colors flex items-center gap-2 cursor-pointer ${
                    i === currentStep
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-on-surface-variant hover:bg-surface-variant"
                  }`}
                  title={getStepLabel(i)}
                >
                  <span className="text-sm w-8 text-center shrink-0 font-mono">
                    {i + 1}
                  </span>
                  <span className="text-sm w-4 text-center shrink-0">
                    {getStepIcon(i)}
                  </span>
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
            </div>

          </div>

          {/* Right Column: Step Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Step Badge + Explanation */}
            <div className="p-6 border-b border-outline-variant/20 bg-surface-container">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-primary/10 text-primary font-body text-xs uppercase tracking-wider">
                  Paso {currentStep + 1} de {guided.steps.length}
                </span>
              </div>
              <h4 className="font-headline text-on-surface mb-3">
                {step.title}
              </h4>
              <div
                className="font-body text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: step.explanation
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-on-surface">$1</strong>')
                    .replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre class="bg-surface-variant p-2 rounded text-code-sm my-2 overflow-x-auto">$2</pre>')
                    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-surface-variant text-primary text-sm rounded">$1</code>'),
                }}
              />
            </div>

            {/* Read-only Code Block with Diff Highlighting (reusable component) */}
            <GuidedCodeBlock code={currentCode} newLines={step.computedNewLines} />

            {/* Navigation */}
            <div className="border-t border-outline-variant/30 bg-surface-container-low p-4 flex justify-between items-center">
              <button
                onClick={goToPrevious}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-surface-container text-on-surface-variant font-body text-code-sm border border-outline-variant/30 hover:bg-surface-variant disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                ← Paso anterior
              </button>

              {isLastStep ? (
                <span className="px-4 py-2 text-on-surface-variant font-body text-code-sm">
                  Finalizado
                </span>
              ) : (
                <button
                  onClick={goToNext}
                  className="px-6 py-2 bg-on-surface text-surface font-body text-code-sm font-bold uppercase hover:bg-primary transition-colors hover:text-on-primary cursor-pointer"
                >
                  Siguiente paso →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
