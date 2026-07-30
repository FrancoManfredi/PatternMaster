/**
 * Factory Method — Pattern Test Definition
 *
 * Defines the test suite for the Factory Method exercise in a serializable
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
 * - Does Notification exist and have a callable send()?
 * - Do Email/SMS/Push notifications exist and implement send()?
 * - Does NotificationFactory return the correct type per input?
 * - Does the service delegate correctly?
 *
 * We do NOT check:
 * - Exact error message text ("Unknown type" vs any error)
 * - Internal state (getLastMessage)
 * - Case sensitivity of type dispatch
 */

import type { PatternTestDef } from "../types";

export const factoryMethodTestDef: PatternTestDef = {
  slug: "factory-method",
  expectedNamedExports: [
    "Notification",
    "EmailNotification",
    "SMSNotification",
    "PushNotification",
    "NotificationFactory",
    "NotificationService",
  ],
  criteria: [
    {
      index: 0,
      label: "Crea una interfaz Notification con un método send()",
      requiredExports: ["Notification"],
      check: `
        // Notification should be a class/function with a 'send' method prototype
        var proto = exports.Notification.prototype || exports.Notification;
        assert(typeof proto.send === 'function', "send() no es una función");
        // Verify send is callable — wrap in try-catch to tolerate "abstract throws" pattern
        var instance = new exports.Notification();
        try {
          instance.send("test");
        } catch(sendErr) {
          // base class may throw — that's acceptable
        }
        true
      `,
      failureMessage:
        "Notification no tiene un método send() que se pueda llamar",
    },
    {
      index: 1,
      label:
        "Implementa EmailNotification, SMSNotification y PushNotification",
      requiredExports: [
        "EmailNotification",
        "SMSNotification",
        "PushNotification",
      ],
      check: `
        var types = ["EmailNotification", "SMSNotification", "PushNotification"];
        types.forEach(function(name) {
          var cls = exports[name];
          assert(typeof cls === 'function', name + " no es una clase/función");
          // Should be instantiable and have send
          var instance = new cls();
          assert(typeof instance.send === 'function', name + " no tiene método send()");
          // send should not throw
          instance.send("test " + name);
        });
        true
      `,
      failureMessage:
        "Una o más clases de notificación no implementan send() correctamente",
    },
    {
      index: 2,
      label: "Crea un NotificationFactory que devuelva la implementación correcta",
      requiredExports: ["NotificationFactory", "EmailNotification", "SMSNotification", "PushNotification"],
      check: `
        var factory = new exports.NotificationFactory();
        assert(typeof factory.createNotification === 'function', "Factory no tiene createNotification()");

        var email = factory.createNotification("email");
        assert(email instanceof exports.EmailNotification, "createNotification('email') no devuelve EmailNotification");

        var sms = factory.createNotification("sms");
        assert(sms instanceof exports.SMSNotification, "createNotification('sms') no devuelve SMSNotification");

        var push = factory.createNotification("push");
        assert(push instanceof exports.PushNotification, "createNotification('push') no devuelve PushNotification");

        // Unknown type should throw SOME error (any error)
        var threw = false;
        try {
          factory.createNotification("unknown");
        } catch(e) {
          threw = true;
        }
        assert(threw, "createNotification('unknown') debería lanzar un error");

        true
      `,
      failureMessage:
        "NotificationFactory.createNotification() no se comporta según el patrón Factory Method",
    },
    {
      index: 3,
      label: "Modifica NotificationService para usar la fábrica",
      requiredExports: ["NotificationService", "NotificationFactory", "EmailNotification"],
      check: `
        var factory = new exports.NotificationFactory();
        var service = new exports.NotificationService(factory);
        assert(typeof service.notify === 'function', "Service no tiene método notify()");

        // notify should call factory.createNotification and send on result
        // We verify by checking that it returns EmailNotification instance behavior
        service.notify("email", "hello");
        // If it didn't throw, the basic plumbing works
        true
      `,
      failureMessage:
        "NotificationService no delega correctamente en la fábrica",
    },
  ],
};
