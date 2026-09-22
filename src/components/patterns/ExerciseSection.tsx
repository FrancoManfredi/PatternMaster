"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { PatternContent } from "@/content";
import type { TestSuiteResult } from "@/lib/test-runner/types";
import { useProgress } from "@/components/ProgressContext";
import { highlightCode } from "@/lib/syntax-highlight";
import TestSuiteStatus from "./TestSuiteStatus";
import GuidedExerciseSection from "./GuidedExerciseSection";
import { getGuidedExercise } from "@/content/guided";
import ErrorBoundary from "@/components/ErrorBoundary";

const LANGUAGES = ["TypeScript", "JavaScript"];

interface ExerciseSectionProps {
  pattern: PatternContent;
}

export default function ExerciseSection({ pattern }: ExerciseSectionProps) {
  // Check if this pattern has a guided exercise available
  const hasGuided = getGuidedExercise(pattern.slug) !== undefined;

  const [guidedMode, setGuidedMode] = useState(false);
  const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>({
    TypeScript: pattern.exercise.starterCode,
    JavaScript: pattern.exercise.starterCodeJS ?? pattern.exercise.starterCode,
  });
  const [language, setLanguage] = useState("TypeScript");
  const code = codeByLanguage[language] ?? "";

  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestSuiteResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { markCompleted } = useProgress();
  const exerciseId = `${pattern.slug}-exercise`;

  // AbortController ref — one per run, cancelled on language change or unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      abortControllerRef.current?.abort();
      setCodeByLanguage((prev) => ({
        ...prev,
        [language]: code,
        [newLang]: prev[newLang] ?? pattern.exercise.starterCodeJS,
      }));
      setLanguage(newLang);
    },
    [language, code, pattern.exercise.starterCodeJS]
  );

  // Editor ref for scroll sync
  const editorRef = useRef<HTMLDivElement>(null);
  const handleEditorScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    const pre = editorRef.current?.querySelector("pre");
    if (pre) {
      pre.scrollTop = e.currentTarget.scrollTop;
      pre.scrollLeft = e.currentTarget.scrollLeft;
    }
  }, []);

  // Cancel any running test when language changes or component unmounts
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [language]);

  const handleRunTests = useCallback(async () => {
    // Cancel any previous run
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsRunning(true);
    setTestResult(null);
    setErrorMessage(null);

    try {
      // 1. Determine sandbox support for this language
      const { isSandboxSupported } = await import("@/lib/test-runner/runner");
      const supported = isSandboxSupported(language);

      let suiteResult: TestSuiteResult;

      if (supported) {
        // Run sandbox tests (TS/JS only)
        try {
          const { runUserTests } = await import("@/lib/test-runner/runner");
          const { getTestDef } = await import("@/lib/test-runner/registry");

          const loadTestDef = getTestDef(pattern.slug);

          if (loadTestDef) {
            const testDef = await loadTestDef();
            suiteResult = await runUserTests(code, testDef as any, {
              signal: controller.signal,
            });
          } else {
            // No test def for this pattern — empty result
            suiteResult = {
              criterionResults: [],
              allPassed: false,
              sandboxStatus: "skipped",
            };
          }
        } catch (runnerError) {
          console.error("Sandbox runner error:", runnerError);
          suiteResult = {
            criterionResults: [],
            allPassed: false,
            sandboxStatus: "error",
          };
        }
      } else {
        // Unsupported language — skip sandbox
        suiteResult = {
          criterionResults: [],
          allPassed: false,
          sandboxStatus: "skipped",
        };
      }

      // Check if aborted during sandbox execution
      if (controller.signal.aborted) return;

      setTestResult(suiteResult);

      // Mark exercise as completed when all tests pass
      if (suiteResult.allPassed) {
        markCompleted(exerciseId);
      }
    } catch (error) {
      console.error("Request failed:", error);
      setErrorMessage("Error de conexión. Verificá tu conexión e intentá de nuevo.");
    } finally {
      setIsRunning(false);
    }
  }, [code, language, pattern, exerciseId, markCompleted]);

  const lineCount = code.split("\n").length;

  return (
    <ErrorBoundary>
      {/* Mode toggle — visible for patterns that have a guided exercise */}
      {hasGuided && (
        <div className="flex justify-end px-[24px] max-w-[1280px] mx-auto mb-2">
          <div className="flex items-center gap-2">
            <span className="font-body text-label-caps text-on-surface-variant">Modo:</span>
            <div className="flex rounded-md border border-outline-variant/30 overflow-hidden">
              <button
                onClick={() => setGuidedMode(false)}
                className={`px-3 py-1 text-xs font-body transition-colors cursor-pointer ${
                  !guidedMode
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-dim"
                }`}
              >
                Modo Libre
              </button>
              <button
                onClick={() => setGuidedMode(true)}
                className={`px-3 py-1 text-xs font-body transition-colors cursor-pointer ${
                  guidedMode
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-dim"
                }`}
              >
                Modo Guiado
              </button>
            </div>
          </div>
        </div>
      )}

      {guidedMode && hasGuided ? (
        <GuidedExerciseSection pattern={pattern} />
      ) : (
    <section className="w-full max-w-[1280px] mx-auto px-[24px] relative z-10">
      <div className="bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-2xl flex flex-col">
        {/* Challenge Header */}
        <div className="bg-surface-container-high border-b border-outline-variant/30 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
              <span className="material-symbols-outlined text-[24px]">
                terminal
              </span>
            </div>
            <div>
              <h3 className="font-headline text-headline-sm text-on-surface m-0 leading-tight">
                {pattern.exercise.title}
              </h3>
              <span className="font-body text-code-sm text-on-surface-variant">
                {pattern.exercise.fileName}
              </span>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <span className="px-3 py-1 bg-surface-variant text-on-surface-variant font-body text-[11px] uppercase">
              Dificultad: {pattern.difficulty}
            </span>
            <span className="px-3 py-1 bg-surface-variant text-on-surface-variant font-body text-[11px] uppercase">
              {language}
            </span>
          </div>
        </div>

        {/* Main Challenge Body */}
        <div className="flex flex-col lg:flex-row min-h-[500px]">
          {/* Briefing Panel */}
          <div className="w-full lg:w-1/3 bg-surface-container p-6 border-r border-outline-variant/30 flex flex-col gap-6">
            <div>
              <h4 className="text-on-surface font-headline text-lg mb-2">
                Objetivo
              </h4>
              <p className="font-body text-body-md text-on-surface-variant mb-4">
                {pattern.exercise.statement}
              </p>
              <p className="font-body text-body-md text-on-surface-variant">
                {pattern.exercise.instructions}
              </p>
              <ul className="list-disc pl-4 space-y-2 mt-4 text-on-surface-variant font-body text-body-md">
                {pattern.exercise.acceptanceCriteria.map((criterion, i) => (
                  <li key={i}>{criterion}</li>
                ))}
              </ul>

              {/* Language Selector */}
              <div className="mt-6 pt-4 border-t border-outline-variant/20">
                <div className="flex rounded-md border border-outline-variant/30 overflow-hidden">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`flex-1 px-4 py-2 text-sm font-body transition-colors cursor-pointer ${
                        language === lang
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface-dim"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Suite Status — replaces the static checklist */}
            <TestSuiteStatus
              criteria={pattern.exercise.acceptanceCriteria}
              result={testResult}
              isRunning={isRunning && testResult === null}
            />
          </div>

          {/* Editor Panel */}
          <div className="w-full lg:w-2/3 flex flex-col bg-carbon-surface relative">
            {/* Editor Tabs */}
            <div className="flex border-b border-outline-variant/20 bg-surface-container-lowest">
              <div className="px-4 py-2 border-r border-outline-variant/20 flex items-center gap-2 bg-carbon-surface border-t-2 border-t-primary">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  data_object
                </span>
                <span className="font-body text-code-sm text-on-surface">
                  {pattern.exercise.fileName}
                </span>
              </div>
            </div>

            {/* Code Area */}
            <div ref={editorRef} className="flex-1 p-4 overflow-hidden font-body text-code-sm leading-[1.7] relative">
              <div className="flex h-full">
                {/* Line numbers */}
                <div className="text-outline-variant/50 select-none text-right pr-4 border-r border-outline-variant/20 flex flex-col py-0">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <span key={i} className="leading-[1.7]">{i + 1}</span>
                  ))}
                </div>
                {/* Editor with syntax highlighting */}
                <div className="pl-4 flex-1 relative">
                  {/* Highlight overlay */}
                  <pre
                    className="absolute inset-0 pl-4 pointer-events-none whitespace-pre-wrap break-all font-body text-code-sm leading-[1.7] m-0"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(code) + "\n",
                    }}
                  />
                  {/* Actual textarea */}
                  <textarea
                    value={code}
                    onChange={(e) => setCodeByLanguage((prev) => ({ ...prev, [language]: e.target.value }))}
                    onScroll={handleEditorScroll}
                    className="relative w-full bg-transparent text-transparent caret-on-surface font-body text-code-sm leading-[1.7] resize-none outline-none border-none"
                    rows={lineCount}
                    spellCheck={false}
                    style={{ backgroundColor: "transparent" }}
                  />
                </div>
              </div>
            </div>

            {/* Editor Actions */}
            <div className="border-t border-outline-variant/30 bg-surface-container-low p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  {isRunning ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-amber opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-warning-amber" />
                    </>
                  ) : testResult ? (
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                  ) : (
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-warning-amber" />
                  )}
                </span>
                <span className="font-body text-[11px] text-on-surface-variant uppercase tracking-widest">
                  {isRunning
                    ? "COMPILANDO_"
                    : testResult
                      ? "VERIFICADO"
                      : "Esperando ejecución..."}
                </span>
              </div>
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="px-6 py-2 bg-on-surface text-surface font-body text-code-sm font-bold uppercase hover:bg-primary transition-colors hover:text-on-primary disabled:opacity-50 disabled:pointer-events-none"
              >
                {isRunning ? "Ejecutando..." : "Ejecutar Tests"}
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-error/10 border border-error/20 text-error px-4 py-3 font-body text-code-sm">
                {errorMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
      )}
    </ErrorBoundary>
  );
}
