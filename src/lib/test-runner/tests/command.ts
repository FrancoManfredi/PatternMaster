/**
 * Command — Pattern Test Definition
 *
 * Defines the test suite for the Command exercise in a serializable
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
 * - Does EditorCommand exist and have execute(), undo(), redo()?
 * - Do InsertCommand and DeleteCommand extend EditorCommand?
 * - Does TextEditor store history and support undo/redo?
 * - Does undo() revert the last operation correctly?
 * - Does redo() re-apply an undone operation?
 *
 * We do NOT check:
 * - Internal naming of private fields
 * - Exact error messages
 * - Implementation approach for storing deleted text
 */

import type { PatternTestDef } from "../types";

export const commandTestDef: PatternTestDef = {
  slug: "command",
  expectedNamedExports: [
    "EditorCommand",
    "InsertCommand",
    "DeleteCommand",
    "TextEditor",
  ],
  criteria: [
    {
      index: 0,
      label: "Define la clase base EditorCommand con execute(), undo() y redo()",
      requiredExports: ["EditorCommand"],
      check: `
        // EditorCommand should be a class with execute, undo, redo on prototype
        var proto = exports.EditorCommand.prototype || exports.EditorCommand;
        assert(typeof proto.execute === 'function', "execute() no es una función");
        assert(typeof proto.undo === 'function', "undo() no es una función");
        assert(typeof proto.redo === 'function', "redo() no es una función");
        // Should be instantiable (even if base methods do nothing)
        var instance = new exports.EditorCommand();
        try {
          instance.execute();
        } catch(e) {
          // base class may throw — that's acceptable
        }
        true
      `,
      failureMessage:
        "EditorCommand no tiene los métodos execute(), undo() y redo()",
    },
    {
      index: 1,
      label: "Implementa InsertCommand y DeleteCommand que extienden EditorCommand",
      requiredExports: ["EditorCommand", "InsertCommand", "DeleteCommand"],
      check: `
        // Both should be classes that extend EditorCommand
        assert(typeof exports.InsertCommand === 'function', "InsertCommand no es una clase/función");
        assert(typeof exports.DeleteCommand === 'function', "DeleteCommand no es una clase/función");

        // Verify inheritance
        var insertProto = exports.InsertCommand.prototype;
        var deleteProto = exports.DeleteCommand.prototype;
        assert(typeof insertProto.execute === 'function', "InsertCommand no tiene execute()");
        assert(typeof insertProto.undo === 'function', "InsertCommand no tiene undo()");
        assert(typeof deleteProto.execute === 'function', "DeleteCommand no tiene execute()");
        assert(typeof deleteProto.undo === 'function', "DeleteCommand no tiene undo()");

        // Verify they can be instantiated (basic smoke test)
        // InsertCommand should accept text parameter
        var cmd = new exports.InsertCommand("hello", 0);
        assert(cmd instanceof exports.EditorCommand, "InsertCommand no extiende EditorCommand");

        var cmd2 = new exports.DeleteCommand(0, 5);
        assert(cmd2 instanceof exports.EditorCommand, "DeleteCommand no extiende EditorCommand");

        true
      `,
      failureMessage:
        "InsertCommand o DeleteCommand no extienden EditorCommand correctamente",
    },
    {
      index: 2,
      label: "Crea la clase TextEditor que almacene historial de comandos ejecutados",
      requiredExports: ["TextEditor"],
      check: `
        var editor = new exports.TextEditor();
        assert(typeof editor.execute === 'function', "TextEditor no tiene execute()");
        assert(typeof editor.undo === 'function', "TextEditor no tiene undo()");
        assert(typeof editor.redo === 'function', "TextEditor no tiene redo()");
        assert(typeof editor.getContent === 'function', "TextEditor no tiene getContent()");

        // Execute an insert and verify content changes
        var insert = new exports.InsertCommand("hello", 0);
        editor.execute(insert);
        assert(editor.getContent() === "hello", "Después de InsertCommand('hello'), getContent() no devuelve 'hello': " + editor.getContent());

        // Execute another insert
        var insert2 = new exports.InsertCommand(" world", 5);
        editor.execute(insert2);
        assert(editor.getContent() === "hello world", "Después de InsertCommand(' world'), getContent() no devuelve 'hello world': " + editor.getContent());

        true
      `,
      failureMessage:
        "TextEditor no gestiona el historial de comandos correctamente",
    },
    {
      index: 3,
      label: "Implementa undo() y redo() que naveguen el historial correctamente",
      requiredExports: ["TextEditor", "InsertCommand", "DeleteCommand"],
      check: `
        var editor = new exports.TextEditor();

        // Build up some state
        var insert1 = new exports.InsertCommand("hello", 0);
        editor.execute(insert1);
        var insert2 = new exports.InsertCommand(" world", 5);
        editor.execute(insert2);
        assert(editor.getContent() === "hello world", "Setup failed: " + editor.getContent());

        // Undo last insert — should revert to "hello"
        editor.undo();
        assert(editor.getContent() === "hello", "undo() no revirtió a 'hello': " + editor.getContent());

        // Redo — should restore "hello world"
        editor.redo();
        assert(editor.getContent() === "hello world", "redo() no restauró a 'hello world': " + editor.getContent());

        // Undo again
        editor.undo();
        assert(editor.getContent() === "hello", "segundo undo() no revirtió a 'hello': " + editor.getContent());

        // Undo the first insert — should revert to ""
        editor.undo();
        assert(editor.getContent() === "", "undo() de primer insert no revirtió a '': " + editor.getContent());

        // Test with DeleteCommand
        var editor2 = new exports.TextEditor();
        var ins = new exports.InsertCommand("abcdef", 0);
        editor2.execute(ins);
        var del = new exports.DeleteCommand(2, 3); // delete from position 2, length 3
        editor2.execute(del);
        // After deleting 3 chars from position 2: "ab" + "f" = "abf"
        assert(editor2.getContent() === "abf", "DeleteCommand no borró correctamente: " + editor2.getContent());

        // Undo delete — should restore "abcdef"
        editor2.undo();
        assert(editor2.getContent() === "abcdef", "undo() de DeleteCommand no restauró 'abcdef': " + editor2.getContent());

        true
      `,
      failureMessage:
        "undo() y redo() no navegan el historial correctamente",
    },
  ],
};
