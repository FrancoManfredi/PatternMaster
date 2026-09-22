/**
 * Prototype — Pattern Test Definition
 *
 * Defines the test suite for the Prototype exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does Shape exist and have callable clone() and describe()?
 * - Do Circle and Rectangle exist, extend Shape, and implement both methods?
 * - Does clone() produce deep copies (mutating clone doesn't affect original)?
 *
 * We do NOT check:
 * - Constructor parameter names or order (beyond what's needed for instantiation)
 * - Internal implementation of deep copy (spread vs structuredClone vs manual)
 * - Exact describe() output format
 */

import type { PatternTestDef } from "../types";

export const prototypeTestDef: PatternTestDef = {
  slug: "prototype",
  expectedNamedExports: ["Shape", "Circle", "Rectangle"],
  criteria: [
    {
      index: 0,
      label: "Define una interfaz/abstract class Shape con clone() y describe()",
      requiredExports: ["Shape", "Circle"],
      check: `
        // Shape should be an abstract class — verify by checking a concrete subclass instance
        // Abstract methods are erased by Sucrase at runtime, so we check on instances
        var circle = new exports.Circle(5, 'red', { x: 0, y: 0 }, []);
        assert(typeof circle.clone === 'function', "clone() no es una función en Circle (implementa Shape)");
        assert(typeof circle.describe === 'function', "describe() no es una función en Circle (implementa Shape)");
        assert(circle instanceof exports.Shape, "Circle no extiende Shape");
        true
      `,
      failureMessage:
        "Shape no tiene los métodos clone() y describe() definidos",
    },
    {
      index: 1,
      label:
        "Implementa Circle con position, color, points y clone() que retorna deep copy",
      requiredExports: ["Circle", "Shape"],
      check: `
        var cls = exports.Circle;
        assert(typeof cls === 'function', "Circle no es una clase/función");
        var instance = new cls(5, 'red', { x: 0, y: 0 }, [{ x: 1, y: 1 }]);
        assert(typeof instance.clone === 'function', "Circle no tiene método clone()");
        assert(typeof instance.describe === 'function', "Circle no tiene método describe()");
        assert(instance instanceof exports.Shape, "Circle no extiende Shape");
        // Verify clone returns a different object
        var cloned = instance.clone();
        assert(cloned !== instance, "clone() retorna la misma referencia — debe ser un objeto nuevo");
        assert(cloned instanceof exports.Circle, "clone() no retorna una instancia de Circle");
        true
      `,
      failureMessage:
        "Circle no implementa correctamente la interfaz Shape con clone() y describe()",
    },
    {
      index: 2,
      label:
        "Implementa Rectangle con position, color, points y clone() que retorna deep copy",
      requiredExports: ["Rectangle", "Shape"],
      check: `
        var cls = exports.Rectangle;
        assert(typeof cls === 'function', "Rectangle no es una clase/función");
        var instance = new cls(10, 20, 'blue', { x: 0, y: 0 }, [{ x: 1, y: 1 }]);
        assert(typeof instance.clone === 'function', "Rectangle no tiene método clone()");
        assert(typeof instance.describe === 'function', "Rectangle no tiene método describe()");
        assert(instance instanceof exports.Shape, "Rectangle no extiende Shape");
        // Verify clone returns a different object
        var cloned = instance.clone();
        assert(cloned !== instance, "clone() retorna la misma referencia — debe ser un objeto nuevo");
        assert(cloned instanceof exports.Rectangle, "clone() no retorna una instancia de Rectangle");
        true
      `,
      failureMessage:
        "Rectangle no implementa correctamente la interfaz Shape con clone() y describe()",
    },
    {
      index: 3,
      label:
        "clone() retorna deep copy: modificar posición/puntos del clon NO afecta al original",
      requiredExports: ["Circle"],
      check: `
        // Deep copy behavioral check using Circle
        var original = new exports.Circle(5, 'red', { x: 0, y: 0 }, [{ x: 1, y: 1 }]);
        var clone = original.clone();

        // Mutate clone's nested objects
        clone.position.x = 100;
        clone.points[0].x = 999;

        // Assert original is untouched
        assert(original.position.x === 0, "position.x del original fue modificado — clone() NO es deep copy (position)");
        assert(original.points[0].x === 1, "points[0].x del original fue modificado — clone() NO es deep copy (points)");
        assert(clone.position.x === 100, "clone.position.x no se actualizó correctamente");
        assert(clone.points[0].x === 999, "clone.points[0].x no se actualizó correctamente");
        true
      `,
      failureMessage:
        "clone() no implementa deep copy — modificar el clon afecta al original",
    },
  ],
};
