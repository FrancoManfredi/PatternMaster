/**
 * Sandbox Worker Script
 *
 * Returns the JavaScript source for a Web Worker that:
 * 1. Blocks network APIs (fetch, XHR, WebSocket, importScripts)
 * 2. Receives pre-stripped JS code + test definition via postMessage
 * 3. Evaluates code and extracts named exports via eval in same scope
 * 4. Runs per-criterion checks against extracted symbols
 * 5. Posts TestSuiteResult back to main thread
 *
 * SECURITY: Worker provides thread isolation. Network APIs are explicitly
 * blocked. For educational context (user = own attacker), this is sufficient.
 *
 * NOTE: TypeScript stripping is now done on the main thread via Sucrase
 * before code reaches the worker. The worker only handles plain JavaScript.
 */

export function createWorkerSource(): string {
  return `
// ===== SANDBOX — Block network access =====
(function() {
  try {
    self.fetch = function() { throw new Error("fetch bloqueado en sandbox"); };
    self.XMLHttpRequest = function() { throw new Error("XHR bloqueado en sandbox"); };
    self.importScripts = function() { throw new Error("importScripts bloqueado en sandbox"); };
    self.WebSocket = function() { throw new Error("WebSocket bloqueado en sandbox"); };
    self.close = function() { throw new Error("close bloqueado en sandbox"); };
  } catch(e) {}
})();

// ===== TEST HELPER =====
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
  return true;
}

// ===== MAIN HANDLER =====
self.onmessage = function(e) {
  if (!e.data || e.data.type !== "run") return;

  var code = e.data.payload.code;
  var testDef = e.data.payload.testDef;
  var expected = testDef.expectedNamedExports;

  try {
    // Code arrives pre-stripped (Sucrase on main thread) — no stripping here.

    // Build evaluation function:
    //    - User code defines classes/functions in local scope
    //    - We capture each expected symbol via eval(name) in same scope
    //    - Return object with captured exports
    var captureBody = '';
    for (var i = 0; i < expected.length; i++) {
      captureBody += 'try { $exports["' + expected[i] + '"] = eval("' + expected[i] + '"); } catch($e) { $exports["' + expected[i] + '"] = undefined; }\\n';
    }

    var fnBody = code + '\\n\\n// === CAPTURE EXPORTS ===\\n' + captureBody + '\\nreturn $exports;';
    var fn = new Function('$exports', fnBody);

    // Use a plain object — NOT the 'exports' object itself
    // to prevent user code from accessing internal properties
    var exports = fn({ __proto__: null });

    // Run per-criterion checks
    var criterionResults = [];
    for (var c = 0; c < testDef.criteria.length; c++) {
      var criterion = testDef.criteria[c];
      
      try {
        // Check required exports exist
        var missing = criterion.requiredExports.filter(function(name) {
          return exports[name] === undefined;
        });

        if (missing.length > 0) {
          criterionResults.push({
            criterionIndex: criterion.index,
            criterionLabel: criterion.label,
            passed: false,
            error: "No se encontró: " + missing.join(", ")
          });
          continue;
        }

        // Run the check expression
        // Wrap in return because new Function does not auto-return the
        // last expression. If any assert() throws, return true is never reached.
        var checkFn = new Function('exports', 'assert', criterion.check + ';\\nreturn true;');
        var passed = checkFn(exports, assert) === true;

        criterionResults.push({
          criterionIndex: criterion.index,
          criterionLabel: criterion.label,
          passed: passed,
          error: passed ? undefined : criterion.failureMessage
        });
      } catch (err) {
        criterionResults.push({
          criterionIndex: criterion.index,
          criterionLabel: criterion.label,
          passed: false,
          error: "Error al verificar: " + (err.message || String(err))
        });
      }
    }

    var allPassed = criterionResults.every(function(r) { return r.passed; });

    self.postMessage({
      type: "result",
      payload: {
        criterionResults: criterionResults,
        allPassed: allPassed
      }
    });

  } catch (err) {
    self.postMessage({
      type: "error",
      payload: "Error al procesar tu código: " + (err.message || String(err))
    });
  }
};
`;
}
