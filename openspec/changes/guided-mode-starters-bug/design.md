# Design: Starter Code Consistency

## PatternContent Interface
```typescript
exercise: {
  // ... existing fields ...
  starterCode: string;   // TS starter (existing)
  starterCodeJS: string; // NEW: explicit JS starter, static, hand-curated
}
```

## factory-method.json changes
Add `starterCodeJS` field to the exercise object with the equivalent JS starter:
- Mismos TODO comments que el TS starter
- Sin type annotations en parámetros
- NotificacionService sin tipos: `notify(type, message)`

## ExerciseSection.tsx changes
- Remove `import { generateJSStarter }` and its usage
- `handleLanguageChange`: instead of `generateJSStarter(starterCode)`, use `pattern.exercise.starterCodeJS`
- Initialize `codeByLanguage.JavaScript` with `pattern.exercise.starterCodeJS` (not generated)

## Guided content
Step 1 starterCode is already correct (TODO, no Notification class). Add verification test.

## js-starter.ts
Keep the file but it's no longer imported anywhere. Can be deleted or left orphaned.
