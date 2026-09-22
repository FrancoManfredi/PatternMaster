/**
 * Abstract Factory — Pattern Test Definition
 *
 * Tests that the user implements:
 *   1. Chair, Table, Sofa base classes with render() and getStyle()
 *   2. Three concrete factories that each produce a consistent family
 *   3. furnishRoom() that works with any factory
 *
 * We use a SUBSET of exports to keep the test manageable:
 *   ["Chair", "Table", "Sofa", "FurnitureFactory", "VictorianFactory",
 *    "ModernFactory", "ArtDecoFactory", "furnishRoom"]
 */

import type { PatternTestDef } from "../types";

export const abstractFactoryTestDef: PatternTestDef = {
  slug: "abstract-factory",
  expectedNamedExports: [
    "Chair",
    "Table",
    "Sofa",
    "FurnitureFactory",
    "VictorianFactory",
    "ModernFactory",
    "ArtDecoFactory",
    "furnishRoom",
  ],
  criteria: [
    {
      index: 0,
      label:
        "Define clases base Chair, Table y Sofa con métodos render() y getStyle()",
      requiredExports: ["Chair", "Table", "Sofa"],
      check: `
        var bases = ["Chair", "Table", "Sofa"];
        bases.forEach(function(name) {
          var cls = exports[name];
          assert(typeof cls === 'function', name + " no es una clase/función");
          var instance = new cls();
          assert(typeof instance.render === 'function', name + " no tiene método render()");
          assert(typeof instance.getStyle === 'function', name + " no tiene método getStyle()");
        });
        true
      `,
      failureMessage:
        "Las clases base Chair, Table y Sofa deben existir con render() y getStyle()",
    },
    {
      index: 1,
      label:
        "VictorianFactory crea productos de la familia Victorian",
      requiredExports: ["VictorianFactory", "Chair", "Table", "Sofa"],
      check: `
        var factory = new exports.VictorianFactory();
        assert(typeof factory.createChair === 'function', "VictorianFactory no tiene createChair()");
        assert(typeof factory.createTable === 'function', "VictorianFactory no tiene createTable()");
        assert(typeof factory.createSofa === 'function', "VictorianFactory no tiene createSofa()");

        var chair = factory.createChair();
        assert(chair instanceof exports.Chair, "createChair() no devuelve instancia de Chair");
        assert(chair.getStyle() === 'Victorian', "Chair getStyle() debería ser 'Victorian', got: " + chair.getStyle());

        var table = factory.createTable();
        assert(table instanceof exports.Table, "createTable() no devuelve instancia de Table");
        assert(table.getStyle() === 'Victorian', "Table getStyle() debería ser 'Victorian', got: " + table.getStyle());

        var sofa = factory.createSofa();
        assert(sofa instanceof exports.Sofa, "createSofa() no devuelve instancia de Sofa");
        assert(sofa.getStyle() === 'Victorian', "Sofa getStyle() debería ser 'Victorian', got: " + sofa.getStyle());

        true
      `,
      failureMessage:
        "VictorianFactory debe crear productos con getStyle() === 'Victorian'",
    },
    {
      index: 2,
      label:
        "ModernFactory crea productos de la familia Modern",
      requiredExports: ["ModernFactory", "Chair", "Table", "Sofa"],
      check: `
        var factory = new exports.ModernFactory();
        assert(typeof factory.createChair === 'function', "ModernFactory no tiene createChair()");
        assert(typeof factory.createTable === 'function', "ModernFactory no tiene createTable()");
        assert(typeof factory.createSofa === 'function', "ModernFactory no tiene createSofa()");

        var chair = factory.createChair();
        assert(chair instanceof exports.Chair, "createChair() no devuelve instancia de Chair");
        assert(chair.getStyle() === 'Modern', "Chair getStyle() debería ser 'Modern', got: " + chair.getStyle());

        var table = factory.createTable();
        assert(table instanceof exports.Table, "createTable() no devuelve instancia de Table");
        assert(table.getStyle() === 'Modern', "Table getStyle() debería ser 'Modern', got: " + table.getStyle());

        var sofa = factory.createSofa();
        assert(sofa instanceof exports.Sofa, "createSofa() no devuelve instancia de Sofa");
        assert(sofa.getStyle() === 'Modern', "Sofa getStyle() debería ser 'Modern', got: " + sofa.getStyle());

        true
      `,
      failureMessage:
        "ModernFactory debe crear productos con getStyle() === 'Modern'",
    },
    {
      index: 3,
      label:
        "ArtDecoFactory crea la familia ArtDeco y furnishRoom() funciona con cualquier fábrica",
      requiredExports: [
        "ArtDecoFactory",
        "VictorianFactory",
        "ModernFactory",
        "Chair",
        "Table",
        "Sofa",
        "furnishRoom",
      ],
      check: `
        // Verify ArtDeco family
        var artFactory = new exports.ArtDecoFactory();
        assert(typeof artFactory.createChair === 'function', "ArtDecoFactory no tiene createChair()");
        assert(typeof artFactory.createTable === 'function', "ArtDecoFactory no tiene createTable()");
        assert(typeof artFactory.createSofa === 'function', "ArtDecoFactory no tiene createSofa()");

        var aChair = artFactory.createChair();
        assert(aChair.getStyle() === 'ArtDeco', "ArtDeco Chair getStyle() debería ser 'ArtDeco', got: " + aChair.getStyle());
        var aTable = artFactory.createTable();
        assert(aTable.getStyle() === 'ArtDeco', "ArtDeco Table getStyle() debería ser 'ArtDeco', got: " + aTable.getStyle());
        var aSofa = artFactory.createSofa();
        assert(aSofa.getStyle() === 'ArtDeco', "ArtDeco Sofa getStyle() debería ser 'ArtDeco', got: " + aSofa.getStyle());

        // Verify furnishRoom works with each factory
        assert(typeof exports.furnishRoom === 'function', "furnishRoom no es una función");

        var result1 = exports.furnishRoom(new exports.VictorianFactory());
        assert(result1 === 'Victorian Victorian Victorian', "furnishRoom(VictorianFactory) debería devolver 'Victorian Victorian Victorian', got: " + result1);

        var result2 = exports.furnishRoom(new exports.ModernFactory());
        assert(result2 === 'Modern Modern Modern', "furnishRoom(ModernFactory) debería devolver 'Modern Modern Modern', got: " + result2);

        var result3 = exports.furnishRoom(new exports.ArtDecoFactory());
        assert(result3 === 'ArtDeco ArtDeco ArtDeco', "furnishRoom(ArtDecoFactory) debería devolver 'ArtDeco ArtDeco ArtDeco', got: " + result3);

        true
      `,
      failureMessage:
        "ArtDecoFactory debe crear la familia ArtDeco y furnishRoom() debe funcionar con las 3 fábricas",
    },
  ],
};
