import type { PatternTestDef } from "./types";

const patternTestDefs: Record<
  string,
  () => Promise<PatternTestDef>
> = {
  "factory-method": () =>
    import("./tests/factory-method").then((m) => m.factoryMethodTestDef),
  singleton: () =>
    import("./tests/singleton").then((m) => m.singletonTestDef),
  decorator: () =>
    import("./tests/decorator").then((m) => m.decoratorTestDef),
  strategy: () =>
    import("./tests/strategy").then((m) => m.strategyTestDef),
  builder: () =>
    import("./tests/builder").then((m) => m.builderTestDef),
  adapter: () =>
    import("./tests/adapter").then((m) => m.adapterTestDef),
  "chain-of-responsibility": () =>
    import("./tests/chain-of-responsibility").then(
      (m) => m.chainOfResponsibilityTestDef
    ),
  "template-method": () =>
    import("./tests/template-method").then(
      (m) => m.templateMethodTestDef
    ),
  "abstract-factory": () =>
    import("./tests/abstract-factory").then(
      (m) => m.abstractFactoryTestDef
    ),
  facade: () =>
    import("./tests/facade").then((m) => m.facadeTestDef),
  command: () =>
    import("./tests/command").then((m) => m.commandTestDef),
  observer: () =>
    import("./tests/observer").then((m) => m.observerTestDef),
  state: () =>
    import("./tests/state").then((m) => m.stateTestDef),
  prototype: () =>
    import("./tests/prototype").then((m) => m.prototypeTestDef),
  bridge: () =>
    import("./tests/bridge").then((m) => m.bridgeTestDef),
  composite: () =>
    import("./tests/composite").then((m) => m.compositeTestDef),
  flyweight: () =>
    import("./tests/flyweight").then((m) => m.flyweightTestDef),
  proxy: () =>
    import("./tests/proxy").then((m) => m.proxyTestDef),
};

export function getTestDef(
  slug: string
): (() => Promise<PatternTestDef>) | undefined {
  return patternTestDefs[slug];
}
