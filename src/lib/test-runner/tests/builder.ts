/**
 * Builder — Pattern Test Definition
 *
 * Defines the test suite for the Builder exercise in a serializable
 * format that can be sent to the sandbox Worker.
 *
 * IMPORTANT: These tests verify BEHAVIOR ESSENTIAL to the pattern, not
 * implementation details. We check:
 * - Does Computer exist and have cpu/gpu/ram/storage properties?
 * - Does ComputerBuilder have chainable setters that return `this`?
 * - Does GamingComputerBuilder preset high-end specs?
 * - Does OfficeComputerBuilder preset basic specs?
 * - Does ComputerDirector produce correct results?
 *
 * We do NOT check:
 * - Exact error messages
 * - Internal state beyond what build() exposes
 * - Whether Director methods use builder internally in a specific way
 */

import type { PatternTestDef } from "../types";

export const builderTestDef: PatternTestDef = {
  slug: "builder",
  expectedNamedExports: [
    "Computer",
    "ComputerBuilder",
    "GamingComputerBuilder",
    "OfficeComputerBuilder",
    "ComputerDirector",
  ],
  criteria: [
    {
      index: 0,
      label: "Computer y ComputerBuilder existen con métodos encadenables",
      requiredExports: ["Computer", "ComputerBuilder"],
      check: `
        // Computer should be a class
        assert(typeof exports.Computer === 'function', "Computer no es una clase/función");
        var pc = new exports.Computer();
        assert('cpu' in pc, "Computer no tiene propiedad cpu");
        assert('gpu' in pc, "Computer no tiene propiedad gpu");
        assert('ram' in pc, "Computer no tiene propiedad ram");
        assert('storage' in pc, "Computer no tiene propiedad storage");

        // ComputerBuilder should be a class with chainable setters
        assert(typeof exports.ComputerBuilder === 'function', "ComputerBuilder no es una clase/función");
        var builder = new exports.ComputerBuilder();
        assert(typeof builder.setCPU === 'function', "ComputerBuilder no tiene setCPU()");
        assert(typeof builder.setGPU === 'function', "ComputerBuilder no tiene setGPU()");
        assert(typeof builder.setRAM === 'function', "ComputerBuilder no tiene setRAM()");
        assert(typeof builder.setStorage === 'function', "ComputerBuilder no tiene setStorage()");
        assert(typeof builder.build === 'function', "ComputerBuilder no tiene build()");

        // Chainable: each setter returns this
        var result = builder.setCPU('test');
        assert(result === builder, "setCPU() no retorna this (no es encadenable)");
        result = builder.setGPU('test');
        assert(result === builder, "setGPU() no retorna this (no es encadenable)");
        result = builder.setRAM('test');
        assert(result === builder, "setRAM() no retorna this (no es encadenable)");
        result = builder.setStorage('test');
        assert(result === builder, "setStorage() no retorna this (no es encadenable)");

        // build() should return a Computer instance
        var built = builder.build();
        assert(built instanceof exports.Computer, "build() no retorna una instancia de Computer");

        true
      `,
      failureMessage:
        "Computer o ComputerBuilder no existen o los setters no son encadenables (deben retornar this)",
    },
    {
      index: 1,
      label: "GamingComputerBuilder construye specs de alto rendimiento",
      requiredExports: ["GamingComputerBuilder", "ComputerBuilder", "Computer"],
      check: `
        assert(typeof exports.GamingComputerBuilder === 'function', "GamingComputerBuilder no es una clase/función");

        var builder = new exports.GamingComputerBuilder();
        assert(builder instanceof exports.ComputerBuilder, "GamingComputerBuilder no extiende ComputerBuilder");

        var pc = builder.build();
        assert(pc instanceof exports.Computer, "build() no retorna Computer");

        assert(pc.cpu.includes('i9'), "CPU debe incluir 'i9' (alto rendimiento), got: " + pc.cpu);
        assert(pc.gpu.includes('RTX'), "GPU debe incluir 'RTX' (dedicada), got: " + pc.gpu);
        assert(pc.ram.includes('32GB'), "RAM debe incluir '32GB', got: " + pc.ram);
        assert(pc.storage.includes('NVMe'), "Storage debe incluir 'NVMe', got: " + pc.storage);

        true
      `,
      failureMessage:
        "GamingComputerBuilder no extiende ComputerBuilder o no tiene specs de alto rendimiento (i9, RTX, 32GB, NVMe)",
    },
    {
      index: 2,
      label: "OfficeComputerBuilder construye specs básicas",
      requiredExports: ["OfficeComputerBuilder", "ComputerBuilder", "Computer"],
      check: `
        assert(typeof exports.OfficeComputerBuilder === 'function', "OfficeComputerBuilder no es una clase/función");

        var builder = new exports.OfficeComputerBuilder();
        assert(builder instanceof exports.ComputerBuilder, "OfficeComputerBuilder no extiende ComputerBuilder");

        var pc = builder.build();
        assert(pc instanceof exports.Computer, "build() no retorna Computer");

        assert(pc.cpu.includes('i5'), "CPU debe incluir 'i5' (básico), got: " + pc.cpu);
        assert(pc.gpu.includes('UHD'), "GPU debe incluir 'UHD' (integrada), got: " + pc.gpu);
        assert(pc.ram.includes('8GB'), "RAM debe incluir '8GB', got: " + pc.ram);
        assert(pc.storage.includes('SATA'), "Storage debe incluir 'SATA', got: " + pc.storage);

        true
      `,
      failureMessage:
        "OfficeComputerBuilder no extiende ComputerBuilder o no tiene specs básicas (i5, UHD, 8GB, SATA)",
    },
    {
      index: 3,
      label: "ComputerDirector produce PCs correctas con ambos builders",
      requiredExports: ["ComputerDirector", "GamingComputerBuilder", "OfficeComputerBuilder", "Computer"],
      check: `
        assert(typeof exports.ComputerDirector === 'function', "ComputerDirector no es una clase/función");
        assert(typeof exports.ComputerDirector.buildGamingPC === 'function', "ComputerDirector no tiene buildGamingPC()");
        assert(typeof exports.ComputerDirector.buildOfficePC === 'function', "ComputerDirector no tiene buildOfficePC()");

        // buildGamingPC with GamingComputerBuilder
        var gamingBuilder = new exports.GamingComputerBuilder();
        var gamingPC = exports.ComputerDirector.buildGamingPC(gamingBuilder);
        assert(gamingPC instanceof exports.Computer, "buildGamingPC() no retorna Computer");
        assert(gamingPC.cpu.includes('i9'), "Gaming PC CPU incorrecta");
        assert(gamingPC.gpu.includes('RTX'), "Gaming PC GPU incorrecta");

        // buildOfficePC with OfficeComputerBuilder
        var officeBuilder = new exports.OfficeComputerBuilder();
        var officePC = exports.ComputerDirector.buildOfficePC(officeBuilder);
        assert(officePC instanceof exports.Computer, "buildOfficePC() no retorna Computer");
        assert(officePC.cpu.includes('i5'), "Office PC CPU incorrecta");
        assert(officePC.gpu.includes('UHD'), "Office PC GPU incorrecta");

        true
      `,
      failureMessage:
        "ComputerDirector no tiene buildGamingPC/buildOfficePC o no produce resultados correctos",
    },
  ],
};
