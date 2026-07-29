/**
 * Chain of Responsibility — Pattern Test Definition
 *
 * Defines the test suite for the Chain of Responsibility exercise in a
 * serializable format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does ApprovalHandler exist with setNext() and approve()?
 * - Does setNext() return the handler (chainable)?
 * - Does EmployeeHandler approve ≤ 100 and delegate higher?
 * - Does ManagerHandler approve ≤ 1000 and delegate higher?
 * - Does DirectorHandler approve any amount?
 * - Does the full chain route correctly?
 *
 * We do NOT check:
 * - Exact error message text
 * - Internal state variables
 * - Private field enforcement (stripped by Sucrase at runtime)
 */

import type { PatternTestDef } from "../types";

export const chainOfResponsibilityTestDef: PatternTestDef = {
  slug: "chain-of-responsibility",
  expectedNamedExports: [
    "ApprovalHandler",
    "EmployeeHandler",
    "ManagerHandler",
    "DirectorHandler",
  ],
  criteria: [
    {
      index: 0,
      label:
        "Crea ApprovalHandler con setNext() encadenable y approve() que delega al siguiente",
      requiredExports: ["ApprovalHandler"],
      check: `
        console.log("[EVAL-TESTDEF-0] requiredExports:", ["ApprovalHandler"]);
        console.log("[EVAL-TESTDEF-0] ApprovalHandler exportada:", exports.ApprovalHandler);
        // ApprovalHandler should be a class with setNext and approve on prototype
        assert(typeof exports.ApprovalHandler === 'function', "ApprovalHandler no es una clase/función");
        var proto = exports.ApprovalHandler.prototype;
        assert(typeof proto.setNext === 'function', "ApprovalHandler no tiene método setNext()");
        assert(typeof proto.approve === 'function', "ApprovalHandler no tiene método approve()");
        // setNext should return the handler passed in (chainable)
        var a = new exports.ApprovalHandler();
        var b = new exports.ApprovalHandler();
        var result = a.setNext(b);
        console.log("[EVAL-TESTDEF-0] setNext() retorno:", result, "=== b:", result === b);
        assert(result === b, "setNext() debe retornar el handler pasado como argumento");
        // Base approve should delegate to next — test with a handler that returns something
        b.approve = function() { return 'delegated'; };
        var output = a.approve(50);
        console.log("[EVAL-TESTDEF-0] a.approve(50) =", output);
        assert(output === 'delegated', "approve() no delega al siguiente handler");
        true
      `,
      failureMessage:
        "ApprovalHandler no tiene setNext() encadenable y approve() que delega correctamente",
    },
    {
      index: 1,
      label:
        "EmployeeHandler aprueba montos ≤ 100 y delega montos mayores",
      requiredExports: ["EmployeeHandler", "ApprovalHandler"],
      check: `
        console.log("[EVAL-TESTDEF-1] probando EmployeeHandler...");
        assert(typeof exports.EmployeeHandler === 'function', "EmployeeHandler no es una clase/función");
        var emp = new exports.EmployeeHandler();
        assert(emp instanceof exports.ApprovalHandler, "EmployeeHandler no extiende ApprovalHandler");
        // Should approve ≤ 100
        var result50 = emp.approve(50);
        console.log("[EVAL-TESTDEF-1] emp.approve(50) =", result50);
        assert(typeof result50 === 'string', "approve(50) debe retornar un string");
        assert(result50.toLowerCase().includes('employee'), "approve(50) debe mencionar 'Employee'");
        // Should delegate amounts > 100
        var fallback = new exports.ApprovalHandler();
        fallback.approve = function() { return 'delegated-to-next'; };
        emp.setNext(fallback);
        var result500 = emp.approve(500);
        console.log("[EVAL-TESTDEF-1] emp.approve(500) =", result500);
        assert(result500 === 'delegated-to-next', "approve(500) debe delegar al siguiente handler");
        true
      `,
      failureMessage:
        "EmployeeHandler no aprueba montos ≤ 100 ni delega montos mayores correctamente",
    },
    {
      index: 2,
      label:
        "ManagerHandler aprueba montos ≤ 1000 y delega montos mayores",
      requiredExports: ["ManagerHandler", "ApprovalHandler"],
      check: `
        console.log("[EVAL-TESTDEF-2] probando ManagerHandler...");
        assert(typeof exports.ManagerHandler === 'function', "ManagerHandler no es una clase/función");
        var mgr = new exports.ManagerHandler();
        assert(mgr instanceof exports.ApprovalHandler, "ManagerHandler no extiende ApprovalHandler");
        // Should approve ≤ 1000
        var result500 = mgr.approve(500);
        console.log("[EVAL-TESTDEF-2] mgr.approve(500) =", result500);
        assert(typeof result500 === 'string', "approve(500) debe retornar un string");
        assert(result500.toLowerCase().includes('manager'), "approve(500) debe mencionar 'Manager'");
        // Should delegate amounts > 1000
        var fallback = new exports.ApprovalHandler();
        fallback.approve = function() { return 'delegated-to-next'; };
        mgr.setNext(fallback);
        var result5000 = mgr.approve(5000);
        console.log("[EVAL-TESTDEF-2] mgr.approve(5000) =", result5000);
        assert(result5000 === 'delegated-to-next', "approve(5000) debe delegar al siguiente handler");
        true
      `,
      failureMessage:
        "ManagerHandler no aprueba montos ≤ 1000 ni delega montos mayores correctamente",
    },
    {
      index: 3,
      label:
        "DirectorHandler aprueba cualquier monto y la cadena completa funciona",
      requiredExports: [
        "DirectorHandler",
        "EmployeeHandler",
        "ManagerHandler",
        "ApprovalHandler",
      ],
      check: `
        console.log("[EVAL-TESTDEF-3] probando DirectorHandler y cadena completa...");
        assert(typeof exports.DirectorHandler === 'function', "DirectorHandler no es una clase/función");
        var dir = new exports.DirectorHandler();
        assert(dir instanceof exports.ApprovalHandler, "DirectorHandler no extiende ApprovalHandler");
        // Director approves any amount directly
        var result = dir.approve(99999);
        console.log("[EVAL-TESTDEF-3] dir.approve(99999) =", result);
        assert(typeof result === 'string', "approve(99999) debe retornar un string");
        assert(result.toLowerCase().includes('director'), "approve(99999) debe mencionar 'Director'");
        // Build full chain: Employee → Manager → Director
        var employee = new exports.EmployeeHandler();
        var manager = new exports.ManagerHandler();
        var director = new exports.DirectorHandler();
        employee.setNext(manager).setNext(director);
        // $50 → Employee
        var r1 = employee.approve(50);
        console.log("[EVAL-TESTDEF-3] chain approve(50) =", r1);
        assert(r1.toLowerCase().includes('employee'), "approve(50) debe ser aprobado por Employee");
        // $500 → Manager
        var r2 = employee.approve(500);
        console.log("[EVAL-TESTDEF-3] chain approve(500) =", r2);
        assert(r2.toLowerCase().includes('manager'), "approve(500) debe ser aprobado por Manager");
        // $5000 → Director
        var r3 = employee.approve(5000);
        console.log("[EVAL-TESTDEF-3] chain approve(5000) =", r3);
        assert(r3.toLowerCase().includes('director'), "approve(5000) debe ser aprobado por Director");
        true
      `,
      failureMessage:
        "DirectorHandler no aprueba cualquier monto o la cadena completa no funciona correctamente",
    },
  ],
};
