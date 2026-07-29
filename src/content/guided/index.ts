import { factoryMethodGuided } from "./factory-method";
import { decoratorGuided } from "./decorator";
import { singletonGuided } from "./singleton";
import { strategyGuided } from "./strategy";
import { builderGuided } from "./builder";
import { adapterGuided } from "./adapter";
import { chainOfResponsibilityGuided } from "./chain-of-responsibility";
import { templateMethodGuided } from "./template-method";
import type { GuidedExercise } from "@/lib/guided-mode/types";

const guidedExercises: Record<string, GuidedExercise> = {
  "factory-method": factoryMethodGuided,
  "decorator": decoratorGuided,
  "singleton": singletonGuided,
  "strategy": strategyGuided,
  "builder": builderGuided,
  "adapter": adapterGuided,
  "chain-of-responsibility": chainOfResponsibilityGuided,
  "template-method": templateMethodGuided,
};

export function getGuidedExercise(slug: string): GuidedExercise | undefined {
  return guidedExercises[slug];
}

export type { GuidedStep, GuidedExercise } from "@/lib/guided-mode/types";
