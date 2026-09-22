# Tasks: Starter Code Consistency

## Review Workload Forecast
- Estimated changed lines: ~40-60
- Chained PRs recommended: No
- Delivery strategy: single-pr

## Phase 1: PatternContent interface + factory-method JSON
- [x] 1.1 Agregar `starterCodeJS: string` a `PatternContent.exercise` en src/content/index.ts
- [x] 1.2 Agregar `starterCodeJS` estático a src/content/patterns/factory-method.json con TODOs y saltos de línea reales

## Phase 2: ExerciseSection — eliminar generateJSStarter
- [x] 2.1 ExerciseSection.tsx: eliminar import de `generateJSStarter`
- [x] 2.2 ExerciseSection.tsx: cambiar `generateJSStarter(pattern.exercise.starterCode)` → `pattern.exercise.starterCodeJS`
- [x] 2.3 ExerciseSection.tsx: inicializar `codeByLanguage.JavaScript` con `pattern.exercise.starterCodeJS`

## Phase 3: Guided content verification
- [x] 3.1 Verificar que starterCode Step 1 NO contiene clase Notification (es solo TODO)
- [x] 3.2 Crear test en guided-steps-verification.test.ts que ejecuta starterCode Step 1 contra check y confirma mensaje de error correcto

## Phase 4: Verification
- [x] 4.1 `npx vitest run` — sin regresiones
- [x] 4.2 `npx next build` — sin errores
- [x] 4.3 Mostrar evidencia textual del starterCode JS estático con formato correcto
