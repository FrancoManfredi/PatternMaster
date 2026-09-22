# Spec: Bugfix — Guided Mode UX + Language Loss

## Bug 1: Language switch pierde código al alternar TS/JS

**Comportamiento actual**: Cambiar de TypeScript a JavaScript y volver a TypeScript reemplaza el código con un placeholder genérico "// Write your TypeScript solution here".

**Causa raíz**: `onClick` del pill-switch usa `LANGUAGE_STARTERS[lang]` que tiene mapeos genéricos. El starterCode real del ejercicio (con TODOs pedagógicos) está solo en `pattern.exercise.starterCode` pero nunca se preserva entre cambios de idioma.

**Fix — Decisión de producto**: Opción (b) aprobada — estado de código separado por idioma. El usuario puede tener progreso distinto en TS y JS simultáneamente, y cambiar de idioma solo cambia qué código se muestra sin perder ninguno.

**Comportamiento nuevo**:
1. Al cargar: `codeByLanguage["TypeScript"] = pattern.exercise.starterCode` (el starter real del ejercicio con TODOs).
2. Al cambiar de TS a JS por primera vez: se genera un JS starter automáticamente a partir del TS starter, preservando TODOs pero sin tipo anotaciones.
3. Al cambiar entre idiomas: el código del idioma actual se guarda en `codeByLanguage[langActual]`, y se muestra `codeByLanguage[nuevoLang]` (que ya existe si el usuario estuvo antes en ese idioma).
4. LANGUAGE_STARTERS se elimina — su propósito queda cubierto por el starter real del ejercicio + generación automática de JS starter.

## Bug 2: El toggle de Modo desaparece en Modo Guiado

**Comportamiento actual**: Al activar "Modo Guiado", el componente GuidedExerciseSection se renderiza y el toggle "Modo Libre / Modo Guiado" que está en el header de ExerciseSection no se renderiza porque el early return (`if (guidedMode) return <GuidedExerciseSection />`) saltea todo el JSX.

**Comportamiento nuevo**: El toggle de modo debe ser visible SIEMPRE que el patrón sea factory-method, sin importar qué modo esté activo. Ubicado fuera del render condicional, compartido entre ambos modos.

## Mejora 3: Feedback visual de hover/cursor en pill-switches

**Comportamiento actual**: Los botones no seleccionados en los pill-switches (idioma y modo) no muestran `cursor: pointer` y el hover `hover:bg-surface-variant` es muy sutil.

**Comportamiento nuevo**: Todos los botones no seleccionados en pill-switches deben tener `cursor: pointer`, un hover más visible (ej. `hover:bg-surface-dim` o intensificar el contraste), y la transición `transition-colors` que ya existe se mantiene.
