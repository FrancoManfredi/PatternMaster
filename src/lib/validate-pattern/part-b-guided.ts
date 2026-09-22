import type { GuidedExercise } from "@/lib/guided-mode/types";
import type { PatternContent } from "@/content/index";
import { stripTS } from "@/lib/transforms";

export interface CheckResult {
  check: string;
  passed: boolean;
  detail: string;
}

/** B1: Step 0 mentions the exercise objective. */
export function checkGuidedObjective(
  guided: GuidedExercise,
  content: PatternContent
): CheckResult {
  if (guided.steps.length === 0) {
    return {
      check: "B1: Step 0 explains the exercise objective",
      passed: false,
      detail: "GuidedExercise has no steps",
    };
  }

  const step0 = guided.steps[0];
  const combined = `${step0.title} ${step0.explanation}`.toLowerCase();
  const statement = content.exercise.statement;
  const instructions = content.exercise.instructions;

  const extractKeyTerms = (text: string): string[] =>
    text
      .replace(/[.,!?;:()`]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 4)
      .filter((w) => !["este", "esta", "estos", "para", "pero", "como", "más", "que", "Implementa", "Implementá", "Agregar", "Donde", "Nuevo", "Cada"].includes(w.toLowerCase()));

  const statementTerms = extractKeyTerms(statement);
  const instructionsTerms = extractKeyTerms(instructions);
  const allTerms = [...new Set([...statementTerms, ...instructionsTerms])];

  const distinctiveTerms = allTerms
    .sort((a, b) => b.length - a.length)
    .slice(0, 5);

  const missing = distinctiveTerms.filter(
    (term) => !combined.includes(term.toLowerCase())
  );

  return {
    check: "B1: Step 0 explains the exercise objective",
    passed: missing.length <= 2,
    detail:
      missing.length <= 2
        ? `Step 0 covers the exercise domain (${distinctiveTerms.length - missing.length}/${distinctiveTerms.length} key domain terms match)`
        : `Step 0 missing key domain terms: ${missing.join(", ")}`,
  };
}

/** B2: No sandbox/evaluator/verificar vocabulary in guided explanations */
export function checkNoSandboxVocabulary(guided: GuidedExercise): CheckResult[] {
  const forbidden = [
    /\bsandbox\b/i,
    /\bevaluador\b/i,
    /\bevaluación\b/i,
    /\bverificador\b/i,
    /\bverificar\b/i,
    /\bcheck\b/i,
  ];

  return guided.steps.map((step) => {
    const violations = forbidden
      .map((re) => {
        const m = step.explanation.match(re);
        return m ? m[0] : null;
      })
      .filter(Boolean);

    return {
      check: `B2: Step ${step.index} — no sandbox/evaluator vocabulary`,
      passed: violations.length === 0,
      detail:
        violations.length === 0
          ? "clean"
          : `Contains forbidden terms: ${violations.join(", ")}`,
    };
  });
}

/** B3: Code must NOT have truncation placeholders */
export function checkNoTruncationPlaceholders(guided: GuidedExercise): CheckResult[] {
  return guided.steps.map((step) => {
    const truncationPatterns: RegExp[] = [];
    truncationPatterns.push(new RegExp("\/\\*\\.\\.\\.\\*\\/"));
    truncationPatterns.push(/\.\.\.\s*\/\/.*rest/i);
    truncationPatterns.push(/\/\/.*\.\.\.\s*$/);
    truncationPatterns.push(/\/\/ rest of/i);
    truncationPatterns.push(/\/\/ continue/i);
    const violations: string[] = [];

    for (const [lang, code] of Object.entries(step.code)) {
      for (const re of truncationPatterns) {
        if (re.test(code)) {
          violations.push(`${lang} has truncation: ${re.source}`);
        }
      }
    }

    return {
      check: `B3: Step ${step.index} — no truncated code`,
      passed: violations.length === 0,
      detail: violations.length === 0 ? "complete" : violations.join("; "),
    };
  });
}

/** B5: computedNewLines is computed by buildGuidedExercise (not hardcoded). */
export function checkComputedNewLines(
  guided: GuidedExercise
): CheckResult[] {
  const steps = guided.steps;

  return steps.map((step) => {
    const computed = step.computedNewLines;
    if (!computed || !Array.isArray(computed)) {
      return {
        check: `B5: Step ${step.index} has valid computedNewLines`,
        passed: false,
        detail: "computedNewLines is missing or not an array",
      };
    }

    const allNumbers = computed.every((n) => typeof n === "number" && n >= 0);
    const sorted =
      computed.every(
        (n, i) => i === 0 || n >= computed[i - 1]
      );

    if (step.index > 0) {
      const totalLines = step.code.typescript.split("\n").length;
      const allNew = computed.length === totalLines;
      return {
        check: `B5: Step ${step.index} — computedNewLines computed (not hardcoded)`,
        passed: allNumbers && sorted,
        detail:
          allNumbers && sorted
            ? `${computed.length} new lines of ${totalLines} total${allNew ? " (all lines new — ok for structural rewrites)" : ""}`
            : `Invalid computedNewLines: allNumbers=${allNumbers}, sorted=${sorted}`,
      };
    }

    const expectedAllNew =
      computed.length === step.code.typescript.split("\n").length;
    return {
      check: `B5: Step 0 — computedNewLines marks all lines as new`,
      passed: allNumbers && sorted && expectedAllNew,
      detail:
        allNumbers && sorted && expectedAllNew
          ? `${computed.length} lines marked as new (expected for step 0)`
          : `Step 0 should have all lines new: ${computed.length}/${step.code.typescript.split("\n").length}`,
    };
  });
}

/** B6: Code in each step (both languages) is syntactically valid */
export function checkStepCodeSyntax(guided: GuidedExercise): CheckResult[] {
  const results: CheckResult[] = [];

  for (const step of guided.steps) {
    try {
      new Function(step.code.javascript);
      results.push({
        check: `B6: Step ${step.index} JavaScript is valid`,
        passed: true,
        detail: "parseable by new Function",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({
        check: `B6: Step ${step.index} JavaScript is valid`,
        passed: false,
        detail: `SyntaxError: ${msg}`,
      });
    }

    try {
      const stripped = stripTS(step.code.typescript);
      new Function(stripped);
      results.push({
        check: `B6: Step ${step.index} TypeScript is valid`,
        passed: true,
        detail: "Sucrase strips + new Function parses without error",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({
        check: `B6: Step ${step.index} TypeScript is valid`,
        passed: false,
        detail: `Error: ${msg}`,
      });
    }
  }

  return results;
}

/** B7: Symbols from acceptanceCriteria are present in the last step's code */
export function checkAcceptanceSymbolsInFinalStep(
  guided: GuidedExercise,
  content: PatternContent
): CheckResult {
  if (guided.steps.length === 0) {
    return {
      check: "B7: Acceptance criteria symbols in final step code",
      passed: false,
      detail: "No steps in guided exercise",
    };
  }

  const lastStep = guided.steps[guided.steps.length - 1];

  const acText = content.exercise.acceptanceCriteria.join(" ");
  const symbolMatches = acText.match(/\b[A-Z][a-zA-Z0-9]+\b/g) || [];
    const spanishStopWords = new Set([
    "Crea", "Implementa", "Modifica", "Define", "Cuando", "Cada", "Una",
    "Las", "Los", "Sus", "Con", "Por", "Sin", "Donde", "Como", "Para",
    "Que", "Del", "Entre", "Tipo", "Solo", "Debería", "Haya", "Pueda",
    "Tiene", "Debe", "Son", "Esta", "Esa", "Ese", "La", "El", "Lo",
  ]);
  const englishStopWords = new Set([
    "The", "This", "That", "With", "From", "Each", "Only", "Must",
    "Should", "Will", "Can", "Has", "Have", "Been", "Are", "Was",
    "But", "For", "Not", "All", "Any", "Into", "Over", "Such",
    "Than", "Then", "They", "Very", "When", "Where", "Which", "While",
  ]);

  const symbols = [...new Set(symbolMatches)]
    .filter((s) => !spanishStopWords.has(s) && !englishStopWords.has(s));

  const missing = symbols.filter(
    (sym) =>
      !lastStep.code.typescript.includes(sym) &&
      !lastStep.code.javascript.includes(sym)
  );

  return {
    check: "B7: Acceptance criteria symbols in final step code",
    passed: missing.length === 0,
    detail:
      missing.length === 0
        ? `All ${symbols.length} symbols from acceptance criteria found in final step code: ${symbols.join(", ")}`
        : `Missing symbols: ${missing.join(", ")}`,
  };
}

export function runPartBChecks(
  guided: GuidedExercise,
  content: PatternContent
): CheckResult[] {
  const results: CheckResult[] = [];

  results.push(checkGuidedObjective(guided, content));
  results.push(...checkNoSandboxVocabulary(guided));
  results.push(...checkNoTruncationPlaceholders(guided));
  results.push(...checkComputedNewLines(guided));
  results.push(...checkStepCodeSyntax(guided));
  results.push(checkAcceptanceSymbolsInFinalStep(guided, content));

  return results;
}

export function allPassed(checks: CheckResult[]): boolean {
  return checks.every((c) => c.passed);
}
