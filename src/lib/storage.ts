export interface ProgressStore {
  getCompletedExercises(): string[];
  markExerciseCompleted(exerciseId: string): void;
  getPatternProgress(slug: string): number;
  clearProgress(): void;
}

const STORAGE_KEY = "patternmaster_progress";

export function createLocalStorageStore(): ProgressStore {
  function getCompletedExercises(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function markExerciseCompleted(exerciseId: string): void {
    if (typeof window === "undefined") return;
    const current = getCompletedExercises();
    if (!current.includes(exerciseId)) {
      current.push(exerciseId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  }

  function getPatternProgress(slug: string): number {
    const completed = getCompletedExercises();
    const totalExercises = 1; // MVP: 1 exercise per pattern
    const completedForPattern = completed.filter((id) =>
      id.startsWith(slug)
    ).length;
    return Math.round((completedForPattern / totalExercises) * 100);
  }

  function clearProgress(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    getCompletedExercises,
    markExerciseCompleted,
    getPatternProgress,
    clearProgress,
  };
}

export type GuidedStepState = "unread" | "current" | "read";

export function getGuidedStepProgress(slug: string): Record<number, GuidedStepState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`guided-progress-${slug}`);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const values = Object.values(parsed) as string[];
    const hasLegacy = values.some((v) =>
      v === "pending" || v === "active" || v === "completed" || v === "revealed"
    );
    if (hasLegacy) {
      localStorage.removeItem(`guided-progress-${slug}`);
      return {};
    }
    return parsed as Record<number, GuidedStepState>;
  } catch {
    return {};
  }
}

export function saveGuidedStepProgress(slug: string, steps: Record<number, GuidedStepState>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`guided-progress-${slug}`, JSON.stringify(steps));
}

export function clearGuidedProgress(slug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`guided-progress-${slug}`);
}
