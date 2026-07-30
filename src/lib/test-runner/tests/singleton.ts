/**
 * Singleton — Pattern Test Definition
 *
 * Defines the test suite for the Singleton exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details. We check:
 * - Does ConfigManager exist and have a static getInstance()?
 * - Does getInstance() always return the same instance?
 * - Does get(key) return configuration values?
 * - Is configuration loaded only once?
 *
 * We do NOT check:
 * - Exact error message text
 * - Internal state variables
 * - Private constructor enforcement (stripped by Sucrase at runtime)
 */

import type { PatternTestDef } from "../types";

export const singletonTestDef: PatternTestDef = {
  slug: "singleton",
  expectedNamedExports: ["ConfigManager"],
  criteria: [
    {
      index: 0,
      label: "ConfigManager es una clase con un método estático getInstance()",
      requiredExports: ["ConfigManager"],
      check: `
        // ConfigManager should be a class (function) with a static getInstance()
        // NOTE: in JS runtime, 'private constructor' is stripped — can't enforce it.
        assert(typeof exports.ConfigManager === 'function', "ConfigManager no es una clase/función");
        assert(typeof exports.ConfigManager.getInstance === 'function', "getInstance no es un método estático");
        var instance = exports.ConfigManager.getInstance();
        assert(typeof instance === 'object' || typeof instance === 'function', "getInstance() no retorna una instancia");
        true
      `,
      failureMessage:
        "ConfigManager no tiene un método estático getInstance() que retorne una instancia",
    },
    {
      index: 1,
      label: "getInstance() retorna siempre la misma instancia",
      requiredExports: ["ConfigManager"],
      check: `
        var a = exports.ConfigManager.getInstance();
        var b = exports.ConfigManager.getInstance();
        assert(a === b, "getInstance() debe retornar la misma instancia siempre");
        true
      `,
      failureMessage:
        "getInstance() no retorna la misma instancia en llamadas subsecuentes",
    },
    {
      index: 2,
      label: "El método get(key) retorna el valor de configuración para una clave",
      requiredExports: ["ConfigManager"],
      check: `
        var instance = exports.ConfigManager.getInstance();
        assert(typeof instance.get === 'function', "ConfigManager no tiene método get()");
        var value = instance.get("DB_HOST");
        assert(value !== undefined, "get('DB_HOST') debería retornar un valor");
        assert(typeof value === 'string', "get('DB_HOST') debería retornar un string");
        true
      `,
      failureMessage:
        "get(key) no retorna los valores de configuración correctamente",
    },
    {
      index: 3,
      label: "La configuración se carga una sola vez — getInstance() no recarga en llamadas subsecuentes",
      requiredExports: ["ConfigManager"],
      check: `
        var a = exports.ConfigManager.getInstance();
        var val1 = a.get("API_KEY");
        var b = exports.ConfigManager.getInstance();
        var val2 = b.get("API_KEY");
        assert(val1 !== undefined, "La config debería tener valores después de la primera carga");
        assert(val1 === val2, "La config no debería recargarse en llamadas subsecuentes a getInstance()");
        true
      `,
      failureMessage:
        "getInstance() recarga la configuración en llamadas subsecuentes",
    },
  ],
};