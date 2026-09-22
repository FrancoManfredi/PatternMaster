# Design: Guided Mode + Product Improvements

## Architecture

### Cambio 1 — Borrado de pipeline LLM
- 17 archivos eliminados (ver spec para lista completa)
- ExerciseSection.tsx: remover imports de CorrectionResult, FeedbackPanel; remover estados correctionResult/showFeedback; markCompleted() depende de testResult.allPassed
- runner.ts: simplificar (siempre sandbox supported)

### Cambio 2 — Pill-switch TS/JS
- Componente inline en ExerciseSection.tsx (no componente separado)
- Switch visual con dos botones: TypeScript | JavaScript
- LANGUAGE_STARTERS: solo entries TS y JS
- Eliminar customLanguage y "Otro" del select

### Cambio 3 — Syntax Highlighting
- Patrón overlay sincronizado:
  ```html
  <div class="editor-container" style="position:relative">
    <pre><code class="highlight-overlay" aria-hidden="true" />
    <textarea class="editor-textarea" />
  </div>
  ```
- textarea semi-transparente, overlay con pointer-events:none
- onScroll sincronizado
- highlightCode() en syntax-highlight.ts ya produce spans coloreados

### Cambio 4 — Modo Guiado
- GuidedExerciseSection.tsx: nuevo componente
- GuidedStep: interface con index, title, explanation, starterCode (ts/js), solutionCode (ts/js), check
- Contenido estático versionado en src/content/guided/factory-method.ts
- Progreso: cada paso tiene estado (pending/active/completed/revealed)
- Tracking en localStorage (misma store que ProgressContext, extendida)
- Final: corre los 4 criteria originales del sandbox
