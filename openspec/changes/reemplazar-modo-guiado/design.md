# Design: Replace Guided Mode with Informational Walkthrough

## Technical Approach

Rewrite `GuidedExerciseSection` from an interactive editor/sandbox into a read-only sequential walkthrough. Simplify the `GuidedStep` data schema by deleting `starterCode`, `check`, and renaming `solutionCode` → `code`. Strip all sandbox imports (`runUserTests`, `isSandboxSupported`), verification state (`stepResult`, `finalResult`), and the textarea editor. Replace it with a static `<pre>` block fed by `highlightCode()` using the same dark-background visual style as theory-section `structureCode` blocks, plus a line-numbers column carried over from the current editor layout.

The `ExerciseSection` toggle and Modo Libre remain completely untouched.

## Architecture Decisions

| Decision | Options | Tradeoffs | Choice |
|----------|---------|-----------|--------|
| Read-only vs editable | (a) Keep editable textarea (b) Read-only walkthrough | (a) Retains sandbox complexity; pedagogical friction remains. (b) Removes 200+ lines of editor/sandbox code; better for learning. | **Read-only walkthrough** |
| Code display style | (a) Reuse editor overlay (textarea + highlight pre) (b) Pure `<pre>` like `structureCode` | (a) Needs scroll sync, caret handling, line-count state. (b) Simpler, consistent with theory sections. | **Pure `<pre>` with line numbers** — hybrid of `structureCode` dark bg and current editor line-number column |
| Navigation lock | (a) Linear progression (b) Free navigation | (a) Matches old verification flow but adds friction. (b) Users can revisit any step instantly. | **Free navigation** — all steps clickable, no `cursor-not-allowed` |
| State migration | (a) Migrate old `completed`/`revealed` → `read` (b) Detect old schema and clear | (a) Fragile, one-off mapping logic. (b) Simpler, loss is cosmetic (step position resets). | **Detect and clear** — on init, if saved states contain old keys, wipe and reset to default |
| Final button behavior | (a) Run final sandbox verification (b) No-op "mark visited" | (a) Reintroduces sandbox dependency we are deleting. (b) Aligns with read-only intent. | **No-op** — "Finalizar" only marks the exercise as visited; no `ProgressContext.markCompleted` |

## Data Flow

```
PatternPage ──→ ExerciseSection ──→ [guidedMode=true]
                                    │
                                    ├── getGuidedExercise(pattern.slug)
                                    │       └── factory-method guided data (4 steps, code per step)
                                    │
                                    ├── localStorage (`guided-progress-factory-method`)
                                    │       └── { 0: "current", 1: "unread", ... }
                                    │
                                    └── GuidedExerciseSection
                                            ├── Step Sidebar (click → setCurrentStep)
                                            │       └── icons: unread (○), current (●), read (✓)
                                            ├── Step Content
                                            │       ├── Badge: "Paso X de N"
                                            │       ├── Explanation (rich text)
                                            │       └── Code Block (read-only, highlightCode())
                                            └── Navigation (Previous / Next / Finalizar)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/content/guided/factory-method.ts` | Modify | Remove `starterCode`, `check`, `CriterionCheck` import; rename `solutionCode` → `code`; simplify `GuidedStep` interface |
| `src/content/guided/index.ts` | Modify | Update re-exports if `GuidedStep`/`GuidedExercise` interfaces move to a separate types file |
| `src/components/patterns/GuidedExerciseSection.tsx` | Modify | **Rewrite**: remove editor, sandbox, verification, result states; add read-only code block, free navigation, new state icons |
| `src/lib/storage.ts` | Modify | Change `GuidedStepState` to `"unread" \| "current" \| "read"`; add old-schema detection in `getGuidedStepProgress` |
| `src/lib/test-runner/__tests__/guided-starters-verification.test.ts` | Delete | Tests behavior that no longer exists |

## Interfaces / Contracts

```typescript
// src/content/guided/factory-method.ts
export interface GuidedStep {
  index: number;
  title: string;
  explanation: string;
  code: { typescript: string; javascript: string };
}

export interface GuidedExercise {
  slug: string;
  title: string;
  steps: GuidedStep[];
}

// src/lib/storage.ts
export type GuidedStepState = "unread" | "current" | "read";

export function getGuidedStepProgress(slug: string): Record<number, GuidedStepState> {
  // Detect legacy schema and auto-clear
  const raw = localStorage.getItem(`guided-progress-${slug}`);
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  const values = Object.values(parsed);
  const hasLegacy = values.some((v) => v === "pending" || v === "active" || v === "completed" || v === "revealed");
  if (hasLegacy) {
    localStorage.removeItem(`guided-progress-${slug}`);
    return {};
  }
  return parsed;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `getGuidedStepProgress` clears legacy schema | Vitest — mock `localStorage` with old `completed`/`revealed` values, assert returned `{}` and key removed |
| Unit | `GuidedExerciseSection` renders step sidebar with correct icons | Vitest + React Testing Library — pass mocked `guided` data, assert `○`/`●`/`✓` icons present |
| Unit | Code block is `<pre>`, not `<textarea>` | Assert `textarea` is absent and `pre` with `dangerouslySetInnerHTML` exists |
| Integration | Free navigation updates state and persists | Fire sidebar click → assert `currentStep` change → assert `localStorage` written with `"read"` for visited step |
| E2E (manual) | Full walkthrough flow | Visit Factory Method → toggle Guided → click through 4 steps → assert no sandbox activity, no "Verificar paso" button |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

1. **localStorage**: Old guided-progress keys are auto-detected and wiped on first load. Loss is cosmetic (step state resets to step 0).
2. **No feature flag needed**: Changes are isolated to `GuidedExerciseSection`; Modo Libre is untouched.
3. **Rollback**: Revert commit. Only 4 files modified + 1 test file deleted.

## Open Questions

- None.
