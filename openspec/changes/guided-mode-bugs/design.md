# Design: Bugfix — Guided Mode UX + Language Loss

## Bug 1: Estado de código separado por idioma

### Data model
```tsx
// Reemplazar:
const [code, setCode] = useState(pattern.exercise.starterCode);

// Con:
const [codeByLanguage, setCodeByLanguage] = useState<Record<string, string>>({
  TypeScript: pattern.exercise.starterCode,
});
const code = codeByLanguage[language]; // derivado, no state aparte
```

### Language change handler
```tsx
const handleLanguageChange = (newLang: string) => {
  // Cancel any running test
  abortControllerRef.current?.abort();
  
  setCodeByLanguage(prev => {
    // Si el nuevo idioma no tiene código aún, generar JS starter
    if (!(newLang in prev)) {
      return { ...prev, [newLang]: generateJSStarter(pattern.exercise.starterCode) };
    }
    return prev;
  });
  setLanguage(newLang);
};
```

**Importante**: el cambio de código NO se hace con `setCode()` porque `code` es derivado. Al cambiar `codeByLanguage[language]`, el `code` derivado automáticamente muestra el contenido correcto del nuevo idioma.

### generateJSStarter(code: string): string
Función pura que toma el starter TS y devuelve un starter JS equivalente:
1. Elimina `: Tipo` (type annotations) — regex: `\s*:\s*\w+(?:<[^>]*>)?(?:\[\])?\b`
2. Convierte `interface X { ... }` → comentario `// Interfaz X: { ... }` (opcional, solo si aparece)
3. Preserva TODO comments, strings, y toda la estructura de código
4. NO usa Sucrase (sería dependencia pesada para el browser) — usa regex determinista
5. Ubicación: función helper en ExerciseSection.tsx o archivo separado `src/lib/js-starter.ts`

### Eliminar LANGUAGE_STARTERS
La constante `LANGUAGE_STARTERS` se elimina. El starter de TS siempre es `pattern.exercise.starterCode`. El starter de JS se genera automáticamente.

## Bug 2: Toggle de modo visible siempre

### Estructura del render

```tsx
export default function ExerciseSection({ pattern }: ExerciseSectionProps) {
  // ... state ...
  
  // NO más early return condicional. Envolver ambos modos en un fragment.
  return (
    <>
      {/* Modo toggle — SIEMPRE visible para factory-method */}
      {pattern.slug === "factory-method" && (
        /* ... pill-switch ... */
      )}
      
      {guidedMode && pattern.slug === "factory-method" ? (
        <GuidedExerciseSection pattern={pattern} />
      ) : (
        <section className="..."> ... contenido modo libre ... </section>
      )}
    </>
  );
}
```

Esto asegura que el toggle esté siempre en el DOM cuando el patrón es factory-method, sin importar el modo activo.

## Mejora 3: Pill-switch hover/cursor mejorado

### Classes CSS para ambos switches
```tsx
className={`px-4 py-2 text-sm font-body transition-colors cursor-pointer ${
  isSelected
    ? "bg-primary text-on-primary"
    : "bg-surface-container text-on-surface-variant hover:bg-surface-dim"
}`}
```

Cambios clave respecto al estado actual:
1. Agregar `cursor-pointer` a TODOS los botones no seleccionados (los seleccionados no lo necesitan explícitamente porque ya tienen interacción)
2. Cambiar `hover:bg-surface-variant` → `hover:bg-surface-dim` (más contraste)
3. Aplicar a AMBOS pill-switches (lenguaje + modo)
