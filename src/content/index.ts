import factoryMethod from "@/content/patterns/factory-method.json";
import abstractFactory from "@/content/patterns/abstract-factory.json";
import builder from "@/content/patterns/builder.json";
import prototype from "@/content/patterns/prototype.json";
import singleton from "@/content/patterns/singleton.json";
import strategy from "@/content/patterns/strategy.json";
import chainOfResponsibility from "@/content/patterns/chain-of-responsibility.json";
import command from "@/content/patterns/command.json";
import iterator from "@/content/patterns/iterator.json";
import mediator from "@/content/patterns/mediator.json";
import memento from "@/content/patterns/memento.json";
import observer from "@/content/patterns/observer.json";
import state from "@/content/patterns/state.json";
import templateMethod from "@/content/patterns/template-method.json";
import visitor from "@/content/patterns/visitor.json";
import adapter from "@/content/patterns/adapter.json";
import bridge from "@/content/patterns/bridge.json";
import composite from "@/content/patterns/composite.json";
import decorator from "@/content/patterns/decorator.json";
import facade from "@/content/patterns/facade.json";
import flyweight from "@/content/patterns/flyweight.json";
import proxy from "@/content/patterns/proxy.json";

export interface PatternContent {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  difficulty: string;
  difficultyLevel: number;
  description: string;
  codeTag: string;
  theory: {
    problem: string;
    problemDescription: string;
    beforeAfter: { before: string; after: string };
  };
  analogy: {
    title: string;
    description: string;
    quote: string;
  };
  realCases: Array<{ title: string; description: string }>;
  sections: {
    howItWorks: { title: string; description: string; structureCode: string };
    prosCons: { pros: string[]; cons: string[] };
    whenToUse: string;
    whenNotToUse: string;
  };
  codeBefore: string;
  codeAfter: string;
  exercise: {
    title: string;
    fileName: string;
    statement: string;
    instructions: string;
    acceptanceCriteria: string[];
    starterCode: string;
    starterCodeJS: string;
  };
}

const patterns: PatternContent[] = [
  factoryMethod as PatternContent,
  abstractFactory as PatternContent,
  builder as PatternContent,
  prototype as PatternContent,
  singleton as PatternContent,
  strategy as PatternContent,
  chainOfResponsibility as PatternContent,
  command as PatternContent,
  iterator as PatternContent,
  mediator as PatternContent,
  memento as PatternContent,
  observer as PatternContent,
  state as PatternContent,
  templateMethod as PatternContent,
  visitor as PatternContent,
  adapter as PatternContent,
  bridge as PatternContent,
  composite as PatternContent,
  decorator as PatternContent,
  facade as PatternContent,
  flyweight as PatternContent,
  proxy as PatternContent,
];

export function getAllPatterns(): PatternContent[] {
  return patterns;
}

export function getPatternBySlug(slug: string): PatternContent | undefined {
  return patterns.find((p) => p.slug === slug);
}
