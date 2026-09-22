/**
 * Flyweight — Pattern Test Definition
 *
 * Defines the test suite for the Flyweight exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does CharacterFlyweight exist with render()?
 * - Does ConcreteCharacter store intrinsic state and render?
 * - Does CharacterFactory reuse flyweights with identical params?
 * - Does Document manage extrinsic state and delegate rendering?
 *
 * We do NOT check:
 * - Internal variable names or Map key format
 * - Exact console.log output
 * - Whether CharacterFlyweight is an abstract class or interface (Sucrase erases both)
 */

import type { PatternTestDef } from "../types";

export const flyweightTestDef: PatternTestDef = {
  slug: "flyweight",
  expectedNamedExports: [
    "CharacterFlyweight",
    "ConcreteCharacter",
    "CharacterFactory",
    "Document",
  ],
  criteria: [
    {
      index: 0,
      label:
        "Define CharacterFlyweight — ConcreteCharacter es instanceof con render(x, y)",
      requiredExports: ["CharacterFlyweight", "ConcreteCharacter"],
      check: `
        // Verify ConcreteCharacter extends CharacterFlyweight
        var char = new exports.ConcreteCharacter('A', 'Arial', 12, '#000');
        assert(char instanceof exports.CharacterFlyweight, "ConcreteCharacter no instanceof CharacterFlyweight");

        // Verify render is a function and executes without error
        assert(typeof char.render === 'function', "ConcreteCharacter no tiene render()");
        var threw = false;
        try { char.render(10, 20); } catch (e) { threw = true; }
        assert(!threw, "render(10, 20) lanzó un error");
        true
      `,
      failureMessage:
        "CharacterFlyweight no existe o ConcreteCharacter no lo implementa correctamente",
    },
    {
      index: 1,
      label:
        "ConcreteCharacter almacena estado intrínseco (char, font, size, color)",
      requiredExports: ["ConcreteCharacter"],
      check: `
        // Create two characters with different intrinsic state
        var charA = new exports.ConcreteCharacter('A', 'Arial', 12, '#000');
        var charB = new exports.ConcreteCharacter('B', 'Times', 14, '#FF0000');

        // Both should render without throwing
        var threw = false;
        try {
          charA.render(0, 0);
          charB.render(5, 10);
        } catch (e) { threw = true; }
        assert(!threw, "render() lanzó un error con estado intrínseco diferente");

        // Different intrinsic params should produce different instances
        assert(charA !== charB, "Dos ConcreteCharacter con diferente estado intrínseco deberían ser distintos");
        true
      `,
      failureMessage:
        "ConcreteCharacter no almacena o maneja el estado intrínseco correctamente",
    },
    {
      index: 2,
      label:
        "CharacterFactory reutiliza flyweights con los mismos parámetros (pool)",
      requiredExports: ["CharacterFactory"],
      check: `
        var factory = new exports.CharacterFactory();

        // Get the same character twice
        var fw1 = factory.getCharacter('A', 'Arial', 12, '#000');
        var fw2 = factory.getCharacter('A', 'Arial', 12, '#000');

        // Both should be the SAME reference (pool reuse)
        assert(fw1 === fw2, "getCharacter() con mismos parámetros debería retornar la misma instancia");

        // Pool size should be 1
        assert(factory.getPoolSize() === 1, "getPoolSize() debería ser 1 después de llamadas idénticas, retornó " + factory.getPoolSize());

        // Different params should create different flyweights
        var fw3 = factory.getCharacter('B', 'Arial', 12, '#000');
        assert(fw1 !== fw3, "getCharacter() con diferente char debería retornar instancia distinta");
        assert(factory.getPoolSize() === 2, "getPoolSize() debería ser 2, retornó " + factory.getPoolSize());
        true
      `,
      failureMessage:
        "CharacterFactory no reutiliza flyweights — crea nuevas instancias cada vez",
    },
    {
      index: 3,
      label:
        "Document tiene addCharacter() y render() que delegan a la fábrica",
      requiredExports: ["Document"],
      check: `
        var doc = new exports.Document();

        // Verify addCharacter exists and accepts all params
        assert(typeof doc.addCharacter === 'function', "Document no tiene addCharacter()");

        // Add characters — should not throw
        var threw = false;
        try {
          doc.addCharacter('H', 0, 0, 'Arial', 12, '#000');
          doc.addCharacter('o', 10, 0, 'Arial', 12, '#000');
          doc.addCharacter('l', 20, 0, 'Arial', 12, '#000');
        } catch (e) { threw = true; }
        assert(!threw, "addCharacter() lanzó un error");

        // Verify render exists and executes
        assert(typeof doc.render === 'function', "Document no tiene render()");
        threw = false;
        try { doc.render(); } catch (e) { threw = true; }
        assert(!threw, "render() lanzó un error");
        true
      `,
      failureMessage:
        "Document no tiene addCharacter()/render() o falla al ejecutarse",
    },
  ],
};
