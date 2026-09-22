# Tasks: Guided Mode + Product Improvements

## Review Workload Forecast
- Estimated changed lines: ~500-700
- 800-line budget risk: Bajo
- Chained PRs recommended: No
- Delivery strategy: single-pr (maintainer-approved)

## Phase 1: Eliminar Corrector LLM + ajustes
- [x] 1.1 Eliminar los 17 archivos del pipeline de corrección (ver lista en spec)
- [x] 1.2 Modificar ExerciseSection.tsx: remover correctionResult, showFeedback, import FeedbackPanel, llamada POST /api/correction
- [x] 1.3 markCompleted() ahora depende de testResult.allPassed === true
- [x] 1.4 Re-escribir ExerciseSection.test.tsx: eliminar mock de POST /api/correction
- [x] 1.5 Correr tests existentes para verificar que no se rompió nada fuera del pipeline

## Phase 2: Language Selector → Pill-Switch TS/JS
- [x] 2.1 Reemplazar <select> + LANGUAGES (13 entries) con pill-switch de 2 posiciones
- [x] 2.2 Reducir LANGUAGE_STARTERS a solo TS y JS
- [x] 2.3 Eliminar customLanguage y toda lógica de "Otro"
- [x] 2.4 Simplificar runner.ts: isSandboxSupported siempre true (opcional) — skipped, still works correctly
- [x] 2.5 Actualizar tests si es necesario — tests updated in 1.4

## Phase 3: Syntax Highlighting Overlay
- [x] 3.1 Reemplazar textarea plano por overlay pattern (textarea + pre>code sincronizado)
- [x] 3.2 Usar highlightCode() de syntax-highlight.ts
- [x] 3.3 Mantener line numbers sincronizados
- [x] 3.4 Verificar que funciona para TS y JS

## Phase 4: Modo Guiado (solo factory-method piloto)
- [x] 4.1 Crear GuidedExerciseSection.tsx: componente con pasos, progreso, verificación
- [x] 4.2 Crear src/content/guided/factory-method.ts con los 4 pasos (starterCode + solutionCode en TS y JS, checks)
- [x] 4.3 Agregar toggle "Modo Libre" / "Modo Guiado" en ExerciseSection.tsx
- [x] 4.4 Extender ProgressContext / storage para tracking de pasos
- [x] 4.5 Verificación final: al completar pasos, correr los 4 criterion checks originales

## Phase 5: Verificación completa
- [x] 5.1 Correr `npx vitest run` — sin regresiones (105 tests pass)
- [x] 5.2 Build: `npx next build` — sin errores de compilación
