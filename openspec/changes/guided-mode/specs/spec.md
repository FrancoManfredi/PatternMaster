# Spec: Guided Mode + Product Improvements

## Change 1: Eliminar Corrector LLM

- Remover POST /api/correction, FeedbackPanel, y toda la pipeline de corrección LLM (17 archivos)
- La única fuente de verdad es TestSuiteStatus determinista (sandbox runner)
- markCompleted() se dispara con testResult.allPassed === true

## Change 2: Language Selector a Pill-Switch TS/JS

- Eliminar LANGUAGES (13 lenguajes), dropdown <select> y customLanguage
- Reemplazar con componente pill-switch de dos posiciones: TypeScript | JavaScript
- LANGUAGE_STARTERS reducido a solo TS y JS
- Eliminar isSandboxSupported (siempre true con TS/JS)

## Change 3: Syntax Highlighting en Editor

- Implementar overlay <pre><code> sincronizado con <textarea>
- Usar highlightCode() existente en syntax-highlight.ts
- Funciona para TS y JS

## Change 4: Modo Guiado (solo factory-method como piloto)

- Toggle "Modo Libre" / "Modo Guiado" en la UI
- GuidedExerciseSection con pasos secuenciales (4 pasos para factory-method)
- Cada paso: explicación, starterCode, solutionCode, check contra sandbox
- Botón "Verificar paso" y "Revelar solución"
- Progreso por paso: bloqueado/actual/completado/revelado
- Al completar todos los pasos, correr los 4 acceptance criteria completos
- Tracking: persistir estado de cada paso (resuelto/revelado)
- NOTA: los solutionCode usan class Notification (no interface) porque el sandbox evalúa en runtime y las interfaces TS desaparecen en Sucrase
