# Tasks: Bugfix — Guided Mode UX + Language Loss

## Review Workload Forecast
- Estimated changed lines: ~80-120
- Chained PRs recommended: No
- Delivery strategy: single-pr

## Phase 1: Bug 1 — Estado de código separado por idioma (opción b)
- [x] 1.1 ExerciseSection.tsx: reemplazar `const [code, setCode]` con `const [codeByLanguage, setCodeByLanguage]` + `const code = codeByLanguage[language]`
- [x] 1.2 ExerciseSection.tsx: reemplazar onClick del pill-switch de idioma — extraer lógica a `handleLanguageChange`, guardar código actual antes de cambiar
- [x] 1.3 Crear `src/lib/js-starter.ts` con `generateJSStarter(tsCode: string): string` — función pura que genera JS starter a partir del TS starter
- [x] 1.4 Eliminar `LANGUAGE_STARTERS` constante de ExerciseSection.tsx
- [ ] 1.5 Verificar manualmente flujo: TS con TODOs → cambiar a JS → código JS preserva TODOs pero sin tipos → volver a TS → código TS original intacto → escribir código propio en TS → cambiar a JS → escribir código JS → volver a TS → código TS propio preservado

## Phase 2: Bug 2 — Toggle de modo siempre visible
- [x] 2.1 ExerciseSection.tsx: eliminar early return `if (guidedMode) return <GuidedExerciseSection />`
- [x] 2.2 ExerciseSection.tsx: reestructurar return para que el toggle de modo esté SIEMPRE visible (fuera del condicional de modo)
- [x] 2.3 GuidedExerciseSection.tsx: el componente ya no necesita manejar el toggle (se maneja desde ExerciseSection)

## Phase 3: Mejora 3 — Pill-switch hover/cursor
- [x] 3.1 ExerciseSection.tsx: agregar `cursor-pointer` a botones no seleccionados en AMBOS pill-switches (idioma + modo)
- [x] 3.2 Cambiar `hover:bg-surface-variant` → `hover:bg-surface-dim` para mejor contraste visual

## Phase 4: Verificación
- [x] 4.1 Correr `npx vitest run` — sin regresiones
- [x] 4.2 Correr `npx next build` — sin errores de compilación
