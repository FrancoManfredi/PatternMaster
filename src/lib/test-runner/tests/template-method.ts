/**
 * Template Method — Pattern Test Definition
 *
 * Defines the test suite for the Template Method exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does ReportGenerator exist with a callable generate()?
 * - Does generate() invoke steps in a fixed order?
 * - Do PDFReport, HTMLReport, CSVReport exist and override steps?
 * - Do subclasses produce format-specific output?
 *
 * We do NOT check:
 * - Exact output string formatting
 * - Internal method names (steps can be named freely)
 * - Whether methods are abstract vs concrete default
 */

import type { PatternTestDef } from "../types";

export const templateMethodTestDef: PatternTestDef = {
  slug: "template-method",
  expectedNamedExports: [
    "ReportGenerator",
    "PDFReport",
    "HTMLReport",
    "CSVReport",
  ],
  criteria: [
    {
      index: 0,
      label: "Define la clase base ReportGenerator con un template method generate()",
      requiredExports: ["ReportGenerator"],
      check: `
        console.log("[EVAL-TESTDEF-0] requiredExports:", ["ReportGenerator"]);
        console.log("[EVAL-TESTDEF-0] ReportGenerator exportada:", exports.ReportGenerator);
        assert(typeof exports.ReportGenerator === 'function', "ReportGenerator no es una clase/función");
        var instance = new exports.ReportGenerator();
        console.log("[EVAL-TESTDEF-0] instance:", instance);
        assert(typeof instance.generate === 'function', "ReportGenerator no tiene método generate()");
        // generate() should return a string (the base implementation produces output)
        var result = instance.generate();
        console.log("[EVAL-TESTDEF-0] generate() returned:", result);
        assert(typeof result === 'string', "generate() debería retornar un string");
        assert(result.length > 0, "generate() debería retornar un string no vacío");
        true
      `,
      failureMessage:
        "ReportGenerator no tiene un template method generate() que retorne string",
    },
    {
      index: 1,
      label: "El template method ejecuta los pasos en orden fijo",
      requiredExports: ["ReportGenerator"],
      check: `
        // Verify step order by subclassing and tracking call order
        var callOrder = [];
        var TrackedReport = function() {};
        TrackedReport.prototype = Object.create(exports.ReportGenerator.prototype);
        TrackedReport.prototype.constructor = TrackedReport;
        TrackedReport.prototype.getData = function() {
          callOrder.push('getData');
          return ['a', 'b'];
        };
        TrackedReport.prototype.processData = function(data) {
          callOrder.push('processData');
          return data;
        };
        TrackedReport.prototype.formatOutput = function(data) {
          callOrder.push('formatOutput');
          return data.join(',');
        };
        TrackedReport.prototype.exportReport = function(formatted) {
          callOrder.push('exportReport');
          return formatted;
        };

        var tracked = new TrackedReport();
        tracked.generate();
        console.log("[EVAL-TESTDEF-1] callOrder:", callOrder);

        assert(callOrder.length === 4, "generate() debería invocar exactamente 4 pasos, se invocaron " + callOrder.length);
        assert(callOrder[0] === 'getData', "Paso 1 debería ser getData, fue " + callOrder[0]);
        assert(callOrder[1] === 'processData', "Paso 2 debería ser processData, fue " + callOrder[1]);
        assert(callOrder[2] === 'formatOutput', "Paso 3 debería ser formatOutput, fue " + callOrder[2]);
        assert(callOrder[3] === 'exportReport', "Paso 4 debería ser exportReport, fue " + callOrder[3]);
        true
      `,
      failureMessage:
        "El template method generate() no ejecuta los pasos en el orden esperado (getData → processData → formatOutput → exportReport)",
    },
    {
      index: 2,
      label: "PDFReport extiende ReportGenerator con formato PDF",
      requiredExports: ["PDFReport", "ReportGenerator"],
      check: `
        assert(typeof exports.PDFReport === 'function', "PDFReport no es una clase/función");
        var pdf = new exports.PDFReport();
        assert(pdf instanceof exports.ReportGenerator, "PDFReport no extiende ReportGenerator");
        assert(typeof pdf.generate === 'function', "PDFReport no tiene método generate()");
        var result = pdf.generate();
        console.log("[EVAL-TESTDEF-2] PDF generate():", result);
        assert(typeof result === 'string' && result.length > 0, "PDFReport.generate() debería retornar string no vacío");
        // PDF-specific: output should contain PDF marker or uppercase data
        assert(result.toUpperCase().indexOf('PDF') !== -1 || result.indexOf('[PDF]') !== -1, "La salida de PDFReport debería contener un marcador PDF");
        true
      `,
      failureMessage:
        "PDFReport no extiende ReportGenerator o no produce salida con formato PDF",
    },
    {
      index: 3,
      label: "HTMLReport extiende ReportGenerator con formato HTML",
      requiredExports: ["HTMLReport", "ReportGenerator"],
      check: `
        assert(typeof exports.HTMLReport === 'function', "HTMLReport no es una clase/función");
        var html = new exports.HTMLReport();
        assert(html instanceof exports.ReportGenerator, "HTMLReport no extiende ReportGenerator");
        assert(typeof html.generate === 'function', "HTMLReport no tiene método generate()");
        var result = html.generate();
        console.log("[EVAL-TESTDEF-3] HTML generate():", result);
        assert(typeof result === 'string' && result.length > 0, "HTMLReport.generate() debería retornar string no vacío");
        // HTML-specific: output should contain HTML tags
        assert(result.indexOf('<') !== -1 && result.indexOf('>') !== -1, "La salida de HTMLReport debería contener tags HTML");
        true
      `,
      failureMessage:
        "HTMLReport no extiende ReportGenerator o no produce salida con formato HTML",
    },
    {
      index: 4,
      label: "CSVReport extiende ReportGenerator con formato CSV",
      requiredExports: ["CSVReport", "ReportGenerator"],
      check: `
        assert(typeof exports.CSVReport === 'function', "CSVReport no es una clase/función");
        var csv = new exports.CSVReport();
        assert(csv instanceof exports.ReportGenerator, "CSVReport no extiende ReportGenerator");
        assert(typeof csv.generate === 'function', "CSVReport no tiene método generate()");
        var result = csv.generate();
        console.log("[EVAL-TESTDEF-4] CSV generate():", result);
        assert(typeof result === 'string' && result.length > 0, "CSVReport.generate() debería retornar string no vacío");
        // CSV-specific: output should contain newlines (CSV rows) or header pattern
        assert(result.indexOf('\\n') !== -1, "La salida de CSVReport debería contener saltos de línea (formato CSV)");
        true
      `,
      failureMessage:
        "CSVReport no extiende ReportGenerator o no produce salida con formato CSV",
    },
  ],
};
