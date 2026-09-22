import { factoryMethodGuided } from "./factory-method";
import { decoratorGuided } from "./decorator";
import { singletonGuided } from "./singleton";
import { strategyGuided } from "./strategy";
import { builderGuided } from "./builder";
import { adapterGuided } from "./adapter";
import { chainOfResponsibilityGuided } from "./chain-of-responsibility";
import { templateMethodGuided } from "./template-method";
import { abstractFactoryGuided } from "./abstract-factory";
import { facadeGuided } from "./facade";
import { commandGuided } from "./command";
import { observerGuided } from "./observer";
import { stateGuided } from "./state";
import { prototypeGuided } from "./prototype";
import { bridgeGuided } from "./bridge";
import { compositeGuided } from "./composite";
import { flyweightGuided } from "./flyweight";
import { proxyGuided } from "./proxy";
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
  "abstract-factory": abstractFactoryGuided,
  "facade": facadeGuided,
  "command": commandGuided,
  "observer": observerGuided,
  "state": stateGuided,
  "prototype": prototypeGuided,
  "bridge": bridgeGuided,
  "composite": compositeGuided,
  "flyweight": flyweightGuided,
  "proxy": proxyGuided,
};

export function getGuidedExercise(slug: string): GuidedExercise | undefined {
  return guidedExercises[slug];
}

export type { GuidedStep, GuidedExercise } from "@/lib/guided-mode/types";
