export interface GuidedStep {
  index: number;
  title: string;
  explanation: string;
  code: { typescript: string; javascript: string };
  computedNewLines: number[];
}

export interface GuidedExercise {
  slug: string;
  title: string;
  steps: GuidedStep[];
}
