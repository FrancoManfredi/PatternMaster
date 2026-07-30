/**
 * Adapter — Pattern Test Definition
 *
 * Defines the test suite for the Adapter exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details. We check:
 * - Do StripeAPI and PayPalAPI exist with their native methods?
 * - Does PaymentProvider exist as a class with pay() and refund()?
 * - Does StripeAdapter translate charge() to pay()?
 * - Does PayPalAdapter translate processPayment() to pay()?
 * - Does checkout() work polymorphically with any PaymentProvider?
 *
 * We do NOT check:
 * - Internal implementation of adapters
 * - Exact return values (random IDs)
 * - How the translation happens internally
 */

import type { PatternTestDef } from "../types";

export const adapterTestDef: PatternTestDef = {
  slug: "adapter",
  expectedNamedExports: [
    "StripeAPI",
    "PayPalAPI",
    "PaymentProvider",
    "StripeAdapter",
    "PayPalAdapter",
    "checkout",
  ],
  criteria: [
    {
      index: 0,
      label: "StripeAPI y PayPalAPI existen con sus métodos nativos. PaymentProvider existe con pay() y refund().",
      requiredExports: ["StripeAPI", "PayPalAPI", "PaymentProvider"],
      check: `
        // StripeAPI must have charge()
        var stripe = new exports.StripeAPI();
        assert(typeof stripe.charge === 'function', "StripeAPI no tiene método charge()");

        // PayPalAPI must have processPayment()
        var paypal = new exports.PayPalAPI();
        assert(typeof paypal.processPayment === 'function', "PayPalAPI no tiene método processPayment()");

        // PaymentProvider must be a class with pay() and refund()
        var provider = new exports.PaymentProvider();
        assert(typeof provider.pay === 'function', "PaymentProvider no tiene método pay()");
        assert(typeof provider.refund === 'function', "PaymentProvider no tiene método refund()");

        true
      `,
      failureMessage:
        "StripeAPI, PayPalAPI o PaymentProvider no tienen los métodos esperados",
    },
    {
      index: 1,
      label: "StripeAdapter extiende PaymentProvider y traduce charge() a pay()",
      requiredExports: ["StripeAdapter", "StripeAPI", "PaymentProvider"],
      check: `
        // StripeAdapter must extend PaymentProvider
        assert(
          exports.StripeAdapter.prototype instanceof exports.PaymentProvider,
          "StripeAdapter no extiende PaymentProvider"
        );

        // Create adapter wrapping a StripeAPI instance
        var stripeApi = new exports.StripeAPI();
        var adapter = new exports.StripeAdapter(stripeApi);

        // pay() must return an object with id and status
        var result = adapter.pay(100);
        assert(result !== null && typeof result === 'object', "pay() no devuelve un objeto");
        assert(typeof result.id === 'string' && result.id.length > 0, "pay() no devuelve un id válido");
        assert(typeof result.status === 'string' && result.status.length > 0, "pay() no devuelve un status válido");

        true
      `,
      failureMessage:
        "StripeAdapter no extiende PaymentProvider o no traduce charge() a pay() correctamente",
    },
    {
      index: 2,
      label: "PayPalAdapter extiende PaymentProvider y traduce processPayment() a pay()",
      requiredExports: ["PayPalAdapter", "PayPalAPI", "PaymentProvider"],
      check: `
        // PayPalAdapter must extend PaymentProvider
        assert(
          exports.PayPalAdapter.prototype instanceof exports.PaymentProvider,
          "PayPalAdapter no extiende PaymentProvider"
        );

        // Create adapter wrapping a PayPalAPI instance
        var paypalApi = new exports.PayPalAPI();
        var adapter = new exports.PayPalAdapter(paypalApi);

        // pay() must return an object with id and status
        var result = adapter.pay(50);
        assert(result !== null && typeof result === 'object', "pay() no devuelve un objeto");
        assert(typeof result.id === 'string' && result.id.length > 0, "pay() no devuelve un id válido");
        assert(typeof result.status === 'string' && result.status.length > 0, "pay() no devuelve un status válido");

        true
      `,
      failureMessage:
        "PayPalAdapter no extiende PaymentProvider o no traduce processPayment() a pay() correctamente",
    },
    {
      index: 3,
      label: "checkout() funciona con cualquier PaymentProvider",
      requiredExports: ["checkout", "StripeAdapter", "PayPalAdapter", "StripeAPI", "PayPalAPI"],
      check: `
        assert(typeof exports.checkout === 'function', "checkout no es una función");

        // checkout with StripeAdapter
        var stripeApi = new exports.StripeAPI();
        var stripeAdapter = new exports.StripeAdapter(stripeApi);
        var stripeResult = exports.checkout(stripeAdapter, 100);
        assert(stripeResult !== null && typeof stripeResult === 'object', "checkout() con StripeAdapter no devuelve un objeto");
        assert(typeof stripeResult.id === 'string' && stripeResult.id.length > 0, "checkout() con StripeAdapter no devuelve id válido");
        assert(typeof stripeResult.status === 'string' && stripeResult.status.length > 0, "checkout() con StripeAdapter no devuelve status válido");

        // checkout with PayPalAdapter
        var paypalApi = new exports.PayPalAPI();
        var paypalAdapter = new exports.PayPalAdapter(paypalApi);
        var paypalResult = exports.checkout(paypalAdapter, 50);
        assert(paypalResult !== null && typeof paypalResult === 'object', "checkout() con PayPalAdapter no devuelve un objeto");
        assert(typeof paypalResult.id === 'string' && paypalResult.id.length > 0, "checkout() con PayPalAdapter no devuelve id válido");
        assert(typeof paypalResult.status === 'string' && paypalResult.status.length > 0, "checkout() con PayPalAdapter no devuelve status válido");

        true
      `,
      failureMessage:
        "checkout() no acepta diferentes implementaciones de PaymentProvider",
    },
  ],
};
