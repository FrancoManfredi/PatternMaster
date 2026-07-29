/**
 * Decorator — Pattern Test Definition
 *
 * Defines the test suite for the Decorator exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does Beverage exist with callable getCost() and getDescription()?
 * - Do Espresso and HouseBlend return the correct base cost?
 * - Does BeverageDecorator wrap a beverage and delegate getCost()?
 * - Do Milk, Mocha and Whip add their cost on top and stack correctly?
 *
 * We do NOT check:
 * - Exact description string text (", Leche" vs "con Leche")
 * - Internal field names (beverage vs wrapped)
 * - Use of interface vs abstract class (abstraction style is free)
 */

import type { PatternTestDef } from "../types";

export const decoratorTestDef: PatternTestDef = {
  slug: "decorator",
  expectedNamedExports: [
    "Beverage",
    "Espresso",
    "HouseBlend",
    "BeverageDecorator",
    "Milk",
    "Mocha",
    "Whip",
  ],
  criteria: [
    {
      index: 0,
      label: "Define la clase base Beverage con getCost() y getDescription()",
      requiredExports: ["Beverage"],
      check: `
        console.log("[EVAL-TESTDEF-0] requiredExports:", ["Beverage"]);
        console.log("[EVAL-TESTDEF-0] Beverage exportada:", exports.Beverage);
        assert(typeof exports.Beverage === 'function', "Beverage no es una clase/función");
        // Beverage should be instantiable and expose both methods on its prototype
        var instance = new exports.Beverage();
        console.log("[EVAL-TESTDEF-0] instance:", instance);
        assert(typeof instance.getCost === 'function', "Beverage no tiene método getCost()");
        assert(typeof instance.getDescription === 'function', "Beverage no tiene método getDescription()");
        // Both methods must be callable without throwing
        instance.getCost();
        instance.getDescription();
        true
      `,
      failureMessage:
        "Beverage no define getCost() y getDescription() que se puedan llamar",
    },
    {
      index: 1,
      label: "Implementa Espresso y HouseBlend como componentes concretos",
      requiredExports: ["Espresso", "HouseBlend"],
      check: `
        var espresso = new exports.Espresso();
        var houseblend = new exports.HouseBlend();
        console.log("[EVAL-TESTDEF-1] espresso cost:", espresso.getCost());
        console.log("[EVAL-TESTDEF-1] houseblend cost:", houseblend.getCost());
        // Base costs: Espresso 1.50, HouseBlend 0.89
        assert(Math.abs(espresso.getCost() - 1.5) < 0.001, "Espresso.getCost() debería ser 1.50");
        assert(Math.abs(houseblend.getCost() - 0.89) < 0.001, "HouseBlend.getCost() debería ser 0.89");
        // Descriptions must be non-empty strings
        assert(typeof espresso.getDescription() === 'string' && espresso.getDescription().length > 0, "Espresso.getDescription() debería retornar un string no vacío");
        assert(typeof houseblend.getDescription() === 'string' && houseblend.getDescription().length > 0, "HouseBlend.getDescription() debería retornar un string no vacío");
        true
      `,
      failureMessage:
        "Espresso y HouseBlend no retornan el costo y la descripción base esperados",
    },
    {
      index: 2,
      label: "Crea BeverageDecorator que envuelve un beverage y delega",
      requiredExports: ["BeverageDecorator", "Espresso"],
      check: `
        var espresso = new exports.Espresso();
        // BeverageDecorator must accept a beverage in its constructor
        var wrapped = new exports.BeverageDecorator(espresso);
        console.log("[EVAL-TESTDEF-2] wrapped cost:", wrapped.getCost());
        console.log("[EVAL-TESTDEF-2] wrapped desc:", wrapped.getDescription());
        // A base decorator delegates to the wrapped beverage (no extra cost/description)
        assert(Math.abs(wrapped.getCost() - 1.5) < 0.001, "BeverageDecorator debe delegar getCost() al beverage envuelto (esperado 1.50 sobre Espresso)");
        assert(typeof wrapped.getDescription() === 'string', "BeverageDecorator debe tener getDescription()");
        true
      `,
      failureMessage:
        "BeverageDecorator no envuelve un beverage ni delega getCost() correctamente",
    },
    {
      index: 3,
      label: "Implementa Milk, Mocha y Whip como decoradores apilables",
      requiredExports: ["Milk", "Mocha", "Whip", "Espresso"],
      check: `
        var espresso = new exports.Espresso();
        console.log("[EVAL-TESTDEF-3] espresso:", espresso.getCost());
        // Milk adds 0.20 on top of the wrapped beverage
        var withMilk = new exports.Milk(espresso);
        console.log("[EVAL-TESTDEF-3] espresso + milk:", withMilk.getCost());
        assert(Math.abs(withMilk.getCost() - 1.7) < 0.001, "Milk debe sumar 0.20 al costo envuelto (esperado 1.70 sobre Espresso)");
        // Mocha adds 0.30 on top — stacking through another decorator
        var withMocha = new exports.Mocha(withMilk);
        console.log("[EVAL-TESTDEF-3] espresso + milk + mocha:", withMocha.getCost());
        assert(Math.abs(withMocha.getCost() - 2.0) < 0.001, "Mocha debe sumar 0.30 sobre la bebida envuelta (esperado 2.00)");
        // Whip adds 0.15 — full stack
        var withWhip = new exports.Whip(withMocha);
        console.log("[EVAL-TESTDEF-3] full stack:", withWhip.getCost());
        assert(Math.abs(withWhip.getCost() - 2.15) < 0.001, "Whip debe sumar 0.15 sobre la bebida envuelta (esperado 2.15)");
        // Description must accumulate across layers
        assert(typeof withWhip.getDescription() === 'string' && withWhip.getDescription().length > espresso.getDescription().length, "La descripción debe acumular los extras de cada decorador");
        true
      `,
      failureMessage:
        "Milk, Mocha y Whip no suman su costo correctamente ni se apilan de forma dinámica",
    },
  ],
};