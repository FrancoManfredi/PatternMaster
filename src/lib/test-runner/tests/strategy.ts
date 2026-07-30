/**
 * Strategy — Pattern Test Definition
 *
 * Defines the test suite for the Strategy exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * For each criterion we specify:
 *   - `requiredExports`: symbol names that MUST exist in user code
 *   - `check`: JS expression returning boolean
 *   - `failureMessage`: friendly message if the check fails
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does TaxStrategy exist and expose a callable calculate(amount)?
 * - Do SpainTaxStrategy / USTaxStrategy extend TaxStrategy and compute the
 *   right percentage (21% / 7%)?
 * - Does Order accept a strategy by constructor and delegate calculateTotal
 *   to it (amount + strategy.calculate(amount))?
 *
 * We do NOT check:
 * - Exact internal representation of the strategy field
 * - Whether the base TaxStrategy throws or returns 0 on calculate()
 * - Exact floating-point values (tolerance-based comparison)
 */

import type { PatternTestDef } from "../types";

export const strategyTestDef: PatternTestDef = {
  slug: "strategy",
  expectedNamedExports: [
    "TaxStrategy",
    "SpainTaxStrategy",
    "USTaxStrategy",
    "Order",
  ],
  criteria: [
    {
      index: 0,
      label: "Define la clase base TaxStrategy con un método calculate(amount)",
      requiredExports: ["TaxStrategy"],
      check: `
        // TaxStrategy should be a class/function with a 'calculate' method on its prototype
        var proto = exports.TaxStrategy.prototype || exports.TaxStrategy;
        assert(typeof proto.calculate === 'function', "calculate() no es una función");
        // Verify calculate is callable — tolerate a base class that returns 0 or throws
        var instance = new exports.TaxStrategy();
        try {
          var baseResult = instance.calculate(100);
        } catch(calcErr) {
          // base class may throw — that's acceptable
        }
        true
      `,
      failureMessage:
        "TaxStrategy no tiene un método calculate(amount) que se pueda llamar",
    },
    {
      index: 1,
      label: "Implementa SpainTaxStrategy (21%) que extiende TaxStrategy",
      requiredExports: ["SpainTaxStrategy", "TaxStrategy"],
      check: `
        assert(typeof exports.SpainTaxStrategy === 'function', "SpainTaxStrategy no es una clase/función");
        assert(exports.SpainTaxStrategy.prototype instanceof exports.TaxStrategy, "SpainTaxStrategy no extiende TaxStrategy");
        var spain = new exports.SpainTaxStrategy();
        assert(typeof spain.calculate === 'function', "SpainTaxStrategy no tiene método calculate()");
        var taxEs = spain.calculate(100);
        assert(Math.abs(taxEs - 21) < 0.01, "SpainTaxStrategy.calculate(100) debería devolver 21");
        true
      `,
      failureMessage:
        "SpainTaxStrategy no extiende TaxStrategy o no calcula el 21% correctamente",
    },
    {
      index: 2,
      label: "Implementa USTaxStrategy (7%) que extiende TaxStrategy",
      requiredExports: ["USTaxStrategy", "TaxStrategy"],
      check: `
        assert(typeof exports.USTaxStrategy === 'function', "USTaxStrategy no es una clase/función");
        assert(exports.USTaxStrategy.prototype instanceof exports.TaxStrategy, "USTaxStrategy no extiende TaxStrategy");
        var us = new exports.USTaxStrategy();
        assert(typeof us.calculate === 'function', "USTaxStrategy no tiene método calculate()");
        var taxUs = us.calculate(100);
        assert(Math.abs(taxUs - 7) < 0.01, "USTaxStrategy.calculate(100) debería devolver 7");
        true
      `,
      failureMessage:
        "USTaxStrategy no extiende TaxStrategy o no calcula el 7% correctamente",
    },
    {
      index: 3,
      label: "Modifica Order para aceptar una estrategia por constructor y delegar el cálculo",
      requiredExports: ["Order", "SpainTaxStrategy", "USTaxStrategy"],
      check: `
        assert(typeof exports.Order === 'function', "Order no es una clase/función");
        // Order receives a strategy by constructor and delegates calculateTotal to it
        var spainOrder = new exports.Order(new exports.SpainTaxStrategy());
        assert(typeof spainOrder.calculateTotal === 'function', "Order no tiene método calculateTotal()");
        var totalEs = spainOrder.calculateTotal(100);
        assert(Math.abs(totalEs - 121) < 0.01, "Order con SpainTaxStrategy debería devolver 121 (100 + 21)");
        // Verify the delegation also works with another strategy (intercambio en runtime)
        var usOrder = new exports.Order(new exports.USTaxStrategy());
        var totalUs = usOrder.calculateTotal(100);
        assert(Math.abs(totalUs - 107) < 0.01, "Order con USTaxStrategy debería devolver 107 (100 + 7)");
        true
      `,
      failureMessage:
        "Order no acepta una estrategia por constructor o no delega el cálculo correctamente",
    },
  ],
};