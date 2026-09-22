/**
 * Composite — Pattern Test Definition
 *
 * Defines the test suite for the Composite exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * Each criterion check is a JavaScript expression string that is evaluated
 * inside the worker context. The expression has access to:
 *   - `exports` — object with extracted named exports from user code
 *   - `assert(condition, message)` — helper that throws on failure
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details of __solutions__. We check:
 * - Does FileSystemComponent exist with getSize(), getName(), print()?
 * - Does File return correct size and name?
 * - Does Folder manage children and sum sizes recursively?
 * - Does print() work without throwing?
 *
 * We do NOT check:
 * - Internal variable names
 * - Exact print() output format
 * - Whether FileSystemComponent is an abstract class or interface (Sucrase erases both)
 */

import type { PatternTestDef } from "../types";

export const compositeTestDef: PatternTestDef = {
  slug: "composite",
  expectedNamedExports: ["FileSystemComponent", "File", "Folder"],
  criteria: [
    {
      index: 0,
      label:
        "Define FileSystemComponent — File y Folder son instanceof con getSize(), getName(), print()",
      requiredExports: ["FileSystemComponent", "File", "Folder"],
      check: `
        // Verify File and Folder extend FileSystemComponent
        var file = new exports.File("readme.md", 5);
        var folder = new exports.Folder("src");
        assert(file instanceof exports.FileSystemComponent, "File no instanceof FileSystemComponent");
        assert(folder instanceof exports.FileSystemComponent, "Folder no instanceof FileSystemComponent");

        // Verify all methods exist
        assert(typeof file.getSize === 'function', "File no tiene getSize()");
        assert(typeof file.getName === 'function', "File no tiene getName()");
        assert(typeof file.print === 'function', "File no tiene print()");
        assert(typeof folder.getSize === 'function', "Folder no tiene getSize()");
        assert(typeof folder.getName === 'function', "Folder no tiene getName()");
        assert(typeof folder.print === 'function', "Folder no tiene print()");
        true
      `,
      failureMessage:
        "FileSystemComponent no existe o File/Folder no lo implementan correctamente",
    },
    {
      index: 1,
      label:
        "File hoja retorna tamaño fijo y nombre correcto",
      requiredExports: ["File"],
      check: `
        var file = new exports.File("readme.md", 5);
        assert(file.getSize() === 5, "File.getSize() debería retornar 5, retornó " + file.getSize());
        assert(file.getName() === "readme.md", "File.getName() debería retornar 'readme.md', retornó " + file.getName());

        var file2 = new exports.File("data.json", 100);
        assert(file2.getSize() === 100, "File.getSize() debería retornar 100");
        assert(file2.getName() === "data.json", "File.getName() debería retornar 'data.json'");
        true
      `,
      failureMessage:
        "File no retorna el tamaño o nombre correcto",
    },
    {
      index: 2,
      label:
        "Folder composite gestiona hijos con add() y getSize() directo",
      requiredExports: ["Folder", "File"],
      check: `
        var folder = new exports.Folder("src");
        assert(folder.getSize() === 0, "Folder vacío debería tener size 0");

        folder.add(new exports.File("index.ts", 5));
        assert(folder.getSize() === 5, "Folder con 1 archivo debería tener size 5");

        folder.add(new exports.File("app.ts", 12));
        assert(folder.getSize() === 17, "Folder con 2 archivos debería tener size 17, retornó " + folder.getSize());
        true
      `,
      failureMessage:
        "Folder no gestiona hijos correctamente o add()/getSize() no funcionan",
    },
    {
      index: 3,
      label:
        "getSize() recursivo suma todos los niveles de anidamiento",
      requiredExports: ["Folder", "File"],
      check: `
        // Build a 2-level tree
        var root = new exports.Folder("proyecto");
        var src = new exports.Folder("src");
        src.add(new exports.File("index.ts", 5));
        src.add(new exports.File("app.ts", 12));
        root.add(src);
        root.add(new exports.File("package.json", 2));

        // Total should be 5 + 12 + 2 = 19
        assert(root.getSize() === 19, "getSize() recursivo debería retornar 19, retornó " + root.getSize());

        // Test 3-level deep
        var deep = new exports.Folder("deep");
        var mid = new exports.Folder("mid");
        var inner = new exports.Folder("inner");
        inner.add(new exports.File("x.ts", 100));
        mid.add(inner);
        deep.add(mid);
        assert(deep.getSize() === 100, "getSize() con 3 niveles debería retornar 100, retornó " + deep.getSize());
        true
      `,
      failureMessage:
        "getSize() no es recursivo — solo suma hijos directos, no nietos",
    },
    {
      index: 4,
      label:
        "print() existe, es callable y no lanza errores en estructuras anidadas",
      requiredExports: ["Folder", "File"],
      check: `
        var root = new exports.Folder("root");
        var src = new exports.Folder("src");
        src.add(new exports.File("a.ts", 5));
        root.add(src);
        root.add(new exports.File("b.ts", 3));

        // print() should not throw
        var threw = false;
        try {
          root.print();
          src.print("  ");
          new exports.File("c.ts", 1).print();
        } catch (e) {
          threw = true;
        }
        assert(!threw, "print() lanzó un error");

        // Verify print is a function on both types
        assert(typeof root.print === 'function', "Folder no tiene print()");
        assert(typeof new exports.File("d.ts", 1).print === 'function', "File no tiene print()");
        true
      `,
      failureMessage:
        "print() no existe o lanza errores al ejecutarse",
    },
  ],
};
