"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  createLocalStorageStore,
  type ProgressStore,
} from "@/lib/storage";

interface ProgressContextValue {
  completedExercises: string[];
  markCompleted: (exerciseId: string) => void;
  getProgress: (slug: string) => number;
  isCompleted: (exerciseId: string) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store] = useState<ProgressStore>(() => createLocalStorageStore());
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  useEffect(() => {
    setCompletedExercises(store.getCompletedExercises());
  }, [store]);

  const markCompleted = useCallback(
    (exerciseId: string) => {
      store.markExerciseCompleted(exerciseId);
      setCompletedExercises(store.getCompletedExercises());
    },
    [store]
  );

  const getProgress = useCallback(
    (slug: string) => {
      return store.getPatternProgress(slug);
    },
    [store]
  );

  const isCompleted = useCallback(
    (exerciseId: string) => {
      return completedExercises.includes(exerciseId);
    },
    [completedExercises]
  );

  return (
    <ProgressContext.Provider
      value={{ completedExercises, markCompleted, getProgress, isCompleted }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
