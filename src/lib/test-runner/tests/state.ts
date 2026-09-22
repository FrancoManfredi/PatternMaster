/**
 * State — Pattern Test Definition
 *
 * Defines the test suite for the State exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does DocumentState exist with action methods?
 * - Does DraftState extend DocumentState and handle transitions?
 * - Does ReviewState extend DocumentState with approve/reject?
 * - Does PublishedState extend DocumentState with archive?
 * - Does Document context delegate to its current state?
 *
 * We do NOT check:
 * - Exact message text (any descriptive string is fine)
 * - Internal state field names
 * - Whether getStateName returns exact strings
 */

import type { PatternTestDef } from "../types";

export const stateTestDef: PatternTestDef = {
  slug: "state",
  expectedNamedExports: [
    "DocumentState",
    "DraftState",
    "ReviewState",
    "PublishedState",
    "Document",
  ],
  criteria: [
    {
      index: 0,
      label: "Define la clase base DocumentState con métodos para las acciones del documento",
      requiredExports: ["DocumentState", "Document"],
      check: `
        var proto = exports.DocumentState.prototype || exports.DocumentState;
        var methods = ["submitForReview", "approve", "reject", "archive"];
        methods.forEach(function(m) {
          assert(typeof proto[m] === 'function', "DocumentState no tiene método " + m + "()");
        });
        // Document context should exist and be instantiable
        var doc = new exports.Document("Test");
        assert(typeof doc.submitForReview === 'function', "Document no tiene submitForReview()");
        assert(typeof doc.approve === 'function', "Document no tiene approve()");
        assert(typeof doc.reject === 'function', "Document no tiene reject()");
        assert(typeof doc.archive === 'function', "Document no tiene archive()");
        assert(typeof doc.getStateName === 'function', "Document no tiene getStateName()");
        true
      `,
      failureMessage:
        "DocumentState no tiene los métodos esperados o Document no existe como contexto",
    },
    {
      index: 1,
      label: "DraftState permite submitForReview y transiciona a ReviewState",
      requiredExports: ["DraftState", "DocumentState", "Document"],
      check: `
        assert(exports.DraftState.prototype instanceof exports.DocumentState, "DraftState no extiende DocumentState");
        var doc = new exports.Document("Test");
        assert(doc.getStateName() === "Draft", "Documento debería iniciar en Draft, pero está en: " + doc.getStateName());
        // submitForReview should transition to Review
        var result = doc.submitForReview();
        assert(typeof result === 'string' && result.length > 0, "submitForReview() debe devolver un string descriptivo");
        assert(doc.getStateName() === "Review", "Después de submitForReview debería estar en Review, pero está en: " + doc.getStateName());
        // approve/reject in Draft should return error messages (or at least not throw)
        var doc2 = new exports.Document("Test2");
        var approveResult = doc2.approve();
        assert(typeof approveResult === 'string' && approveResult.length > 0, "approve() en Draft debe devolver un mensaje");
        assert(doc2.getStateName() === "Draft", "approve() en Draft no debería cambiar el estado");
        var rejectResult = doc2.reject();
        assert(typeof rejectResult === 'string' && rejectResult.length > 0, "reject() en Draft debe devolver un mensaje");
        assert(doc2.getStateName() === "Draft", "reject() en Draft no debería cambiar el estado");
        true
      `,
      failureMessage:
        "DraftState no maneja las transiciones correctamente (submitForReview → Review, approve/reject → error)",
    },
    {
      index: 2,
      label: "ReviewState permite approve → PublishedState y reject → DraftState",
      requiredExports: ["ReviewState", "DocumentState", "Document"],
      check: `
        assert(exports.ReviewState.prototype instanceof exports.DocumentState, "ReviewState no extiende DocumentState");
        // Get to Review state
        var doc = new exports.Document("Test");
        doc.submitForReview();
        assert(doc.getStateName() === "Review", "Debería estar en Review");
        // approve should transition to Published
        var approveResult = doc.approve();
        assert(typeof approveResult === 'string' && approveResult.length > 0, "approve() debe devolver un string");
        assert(doc.getStateName() === "Published", "Después de approve debería estar en Published, pero está en: " + doc.getStateName());
        // Test reject path: new doc → submitForReview → reject → back to Draft
        var doc2 = new exports.Document("Test2");
        doc2.submitForReview();
        var rejectResult = doc2.reject();
        assert(typeof rejectResult === 'string' && rejectResult.length > 0, "reject() debe devolver un string");
        assert(doc2.getStateName() === "Draft", "Después de reject debería volver a Draft, pero está en: " + doc2.getStateName());
        true
      `,
      failureMessage:
        "ReviewState no maneja approve → Published ni reject → Draft correctamente",
    },
    {
      index: 3,
      label: "PublishedState permite archive. Ciclo completo: Draft → Review → Published → Archived",
      requiredExports: ["PublishedState", "DocumentState", "Document"],
      check: `
        assert(exports.PublishedState.prototype instanceof exports.DocumentState, "PublishedState no extiende DocumentState");
        // Full lifecycle: Draft → submitForReview → approve → archive
        var doc = new exports.Document("Lifecycle Test");
        assert(doc.getStateName() === "Draft", "Inicio: Draft");
        doc.submitForReview();
        assert(doc.getStateName() === "Review", "Paso 1: Review");
        doc.approve();
        assert(doc.getStateName() === "Published", "Paso 2: Published");
        var archiveResult = doc.archive();
        assert(typeof archiveResult === 'string' && archiveResult.length > 0, "archive() debe devolver un string");
        assert(doc.getStateName() === "Archived", "Paso 3: Archived, pero está en: " + doc.getStateName());
        // PublishedState: approve/reject should not be allowed
        var doc2 = new exports.Document("Test2");
        doc2.submitForReview();
        doc2.approve();
        assert(doc2.getStateName() === "Published", "Debería estar en Published");
        var approveInPublished = doc2.approve();
        assert(typeof approveInPublished === 'string', "approve() en Published debe devolver un mensaje");
        assert(doc2.getStateName() === "Published", "approve() en Published no debería cambiar estado");
        var rejectInPublished = doc2.reject();
        assert(typeof rejectInPublished === 'string', "reject() en Published debe devolver un mensaje");
        assert(doc2.getStateName() === "Published", "reject() en Published no debería cambiar estado");
        true
      `,
      failureMessage:
        "PublishedState no permite archive o el ciclo completo Draft → Review → Published → Archived no funciona",
    },
  ],
};
