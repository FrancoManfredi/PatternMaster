/**
 * Proxy — Pattern Test Definition
 *
 * Defines the test suite for the Proxy exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does Image exist with display() and getInfo()?
 * - Does HighResImage simulate expensive loading?
 * - Does ImageProxy lazy-init realImage on first display()?
 * - Does ImageProxy reuse realImage on subsequent calls?
 *
 * We do NOT check:
 * - Internal variable names or property access patterns
 * - Exact console.log output
 * - Whether Image is an abstract class or interface (Sucrase erases both)
 */

import type { PatternTestDef } from "../types";

export const proxyTestDef: PatternTestDef = {
  slug: "proxy",
  expectedNamedExports: ["Image", "HighResImage", "ImageProxy"],
  criteria: [
    {
      index: 0,
      label:
        "Define Image — HighResImage es instanceof con display() y getInfo()",
      requiredExports: ["Image", "HighResImage"],
      check: `
        // Verify HighResImage extends Image
        var img = new exports.HighResImage('test.jpg');
        assert(img instanceof exports.Image, "HighResImage no instanceof Image");

        // Verify display is a function and executes without error
        assert(typeof img.display === 'function', "HighResImage no tiene display()");
        var threw = false;
        try { img.display(); } catch (e) { threw = true; }
        assert(!threw, "display() lanzó un error");

        // Verify getInfo returns a string
        assert(typeof img.getInfo === 'function', "HighResImage no tiene getInfo()");
        var info = img.getInfo();
        assert(typeof info === 'string', "getInfo() no retorna string");
        assert(info.length > 0, "getInfo() retorna string vacío");
        true
      `,
      failureMessage:
        "Image no existe o HighResImage no lo implementa correctamente",
    },
    {
      index: 1,
      label:
        "HighResImage simula carga costosa con filename y loaded status",
      requiredExports: ["HighResImage"],
      check: `
        // Create HighResImage with specific filename
        var img = new exports.HighResImage('foto1.jpg');

        // getInfo should contain the filename
        var info = img.getInfo();
        assert(typeof info === 'string', "getInfo() no retorna string");
        assert(info.indexOf('foto1.jpg') !== -1, "getInfo() no contiene el filename 'foto1.jpg'");

        // Should indicate loaded status
        assert(info.indexOf('cargada') !== -1, "getInfo() no indica estado 'cargada'");
        true
      `,
      failureMessage:
        "HighResImage no almacena filename o no indica estado de carga",
    },
    {
      index: 2,
      label:
        "ImageProxy lazy-init realImage en primer display(), reutiliza después",
      requiredExports: ["ImageProxy"],
      check: `
        var proxy = new exports.ImageProxy('foto1.jpg');

        // Verify realImage is null before first display()
        assert(proxy.realImage === null || proxy.realImage === undefined,
          "realImage debería ser null antes del primer display()");

        // Call display() — should lazy-init realImage
        var threw = false;
        try { proxy.display(); } catch (e) { threw = true; }
        assert(!threw, "display() lanzó un error");

        // After display(), realImage should be a HighResImage instance
        assert(proxy.realImage !== null && proxy.realImage !== undefined,
          "realImage no se inicializó después de display()");

        // Verify it's a HighResImage (if available in exports)
        if (exports.HighResImage) {
          assert(proxy.realImage instanceof exports.HighResImage,
            "realImage no es instancia de HighResImage");
        }

        // Call display() again — should reuse same instance
        var firstRef = proxy.realImage;
        proxy.display();
        assert(proxy.realImage === firstRef,
          "realImage no se reutiliza en segundo display()");
        true
      `,
      failureMessage:
        "ImageProxy no hace lazy loading o no reutiliza realImage",
    },
    {
      index: 3,
      label:
        "ImageProxy getInfo() antes y después de display() muestra estado correcto",
      requiredExports: ["ImageProxy"],
      check: `
        var proxy = new exports.ImageProxy('foto2.jpg');

        // getInfo before display() should indicate proxy state
        var infoBefore = proxy.getInfo();
        assert(typeof infoBefore === 'string', "getInfo() antes de display() no retorna string");
        assert(infoBefore.indexOf('proxy') !== -1 || infoBefore.indexOf('no cargada') !== -1,
          "getInfo() antes de display() no indica estado proxy/no cargada");

        // Call display() to trigger lazy loading
        proxy.display();

        // getInfo after display() should indicate loaded state
        var infoAfter = proxy.getInfo();
        assert(typeof infoAfter === 'string', "getInfo() después de display() no retorna string");
        assert(infoAfter.indexOf('cargada') !== -1,
          "getInfo() después de display() no indica estado 'cargada'");
        true
      `,
      failureMessage:
        "ImageProxy getInfo() no muestra el estado correcto antes/después de display()",
    },
  ],
};