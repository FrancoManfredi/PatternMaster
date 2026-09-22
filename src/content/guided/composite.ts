import { buildGuidedExercise } from "@/lib/guided-mode/build";
import type { GuidedStepInput } from "@/lib/guided-mode/build";

const steps: GuidedStepInput[] = [
  {
    index: 0,
    title: "Definí la abstract class FileSystemComponent con la interfaz común",
    explanation:
      "El patrón **Composite** resuelve el problema de tratar objetos individuales y composiciones de la misma forma. En un sistema de archivos, un `File` y un `Folder` deberían responder a `getSize()` sin que el cliente sepa cuál es cuál.\n\n" +
      "Todo arranca con `FileSystemComponent`, la clase abstracta que define la interfaz común. Usamos `abstract class` en vez de `interface` porque las interfaces se borran en tiempo de compilación (Sucrase las elimina). Si usáramos `interface`, el sandbox no podría verificar `instanceof FileSystemComponent`.\n\n" +
      "**Los tres métodos abstractos**:\n" +
      "- `getSize(): number` — retorna el tamaño (fijo para hojas, recursivo para composites)\n" +
      "- `getName(): string` — retorna el nombre del componente\n" +
      "- `print(indent?: string): void` — muestra la estructura con indentación\n\n" +
      "**Los métodos `add()` y `remove()`** tienen implementación por defecto que lanza error. Solo los composites (como `Folder`) los sobreescriben. Esto significa que si intentás agregar un hijo a un `File`, obtenés un error claro.",
    code: {
      typescript:
        "abstract class FileSystemComponent {\n" +
        "  constructor(protected name: string) {}\n" +
        "\n" +
        "  abstract getSize(): number;\n" +
        "  abstract getName(): string;\n" +
        "  abstract print(indent?: string): void;\n" +
        "\n" +
        "  add(component: FileSystemComponent): void {\n" +
        '    throw new Error("Cannot add to a leaf");\n' +
        "  }\n" +
        "  remove(component: FileSystemComponent): void {\n" +
        '    throw new Error("Cannot remove from a leaf");\n' +
        "  }\n" +
        "}",
      javascript:
        "class FileSystemComponent {\n" +
        "  constructor(name) { this.name = name; }\n" +
        "\n" +
        '  getSize() { throw new Error("Implement getSize()"); }\n' +
        '  getName() { throw new Error("Implement getName()"); }\n' +
        '  print(indent) { throw new Error("Implement print()"); }\n' +
        "\n" +
        "  add(component) {\n" +
        '    throw new Error("Cannot add to a leaf");\n' +
        "  }\n" +
        "  remove(component) {\n" +
        '    throw new Error("Cannot remove from a leaf");\n' +
        "  }\n" +
        "}",
    },
  },
  {
    index: 1,
    title: "Implementá File como hoja con tamaño fijo",
    explanation:
      "`File` es la **hoja (Leaf)** del patrón Composite. Representa un objeto individual sin hijos — en nuestro caso, un archivo.\n\n" +
      "La hoja implementa los métodos abstractos directamente:\n" +
      "- `getSize()` retorna `this.size` — un valor fijo, sin recursión\n" +
      "- `getName()` retorna `this.name`\n" +
      "- `print()` muestra una línea con el emoji de archivo y el tamaño\n\n" +
      "**Lo clave**: `File` NO sobreescribe `add()` ni `remove()`. Si intentás agregar un hijo a un archivo, se ejecuta la implementación por defecto de `FileSystemComponent` que lanza \"Cannot add to a leaf\". Esto es Composite en acción: la interfaz es la misma, pero las hojas no soportan operaciones de composición.",
    code: {
      typescript:
        "abstract class FileSystemComponent {\n" +
        "  constructor(protected name: string) {}\n" +
        "  abstract getSize(): number;\n" +
        "  abstract getName(): string;\n" +
        "  abstract print(indent?: string): void;\n" +
        "  add(component: FileSystemComponent): void {\n" +
        '    throw new Error("Cannot add to a leaf");\n' +
        "  }\n" +
        "  remove(component: FileSystemComponent): void {\n" +
        '    throw new Error("Cannot remove from a leaf");\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class File extends FileSystemComponent {\n" +
        "  constructor(name: string, private size: number) {\n" +
        "    super(name);\n" +
        "  }\n" +
        "  getSize() { return this.size; }\n" +
        "  getName() { return this.name; }\n" +
        '  print(indent = "") {\n' +
        '    console.log(`${indent}\\u{1F4C4} ${this.name} (${this.size}KB)`);\n' +
        "  }\n" +
        "}",
      javascript:
        "class FileSystemComponent {\n" +
        "  constructor(name) { this.name = name; }\n" +
        '  getSize() { throw new Error("Implement getSize()"); }\n' +
        '  getName() { throw new Error("Implement getName()"); }\n' +
        '  print(indent) { throw new Error("Implement print()"); }\n' +
        "  add(component) {\n" +
        '    throw new Error("Cannot add to a leaf");\n' +
        "  }\n" +
        "  remove(component) {\n" +
        '    throw new Error("Cannot remove from a leaf");\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class File extends FileSystemComponent {\n" +
        "  constructor(name, size) {\n" +
        "    super(name);\n" +
        "    this.size = size;\n" +
        "  }\n" +
        "  getSize() { return this.size; }\n" +
        "  getName() { return this.name; }\n" +
        "  print(indent) {\n" +
        "    indent = indent || '';\n" +
        "    console.log(indent + '\\u{1F4C4} ' + this.name + ' (' + this.size + 'KB)');\n" +
        "  }\n" +
        "}",
    },
  },
  {
    index: 2,
    title: "Implementá Folder como composite con gestión de hijos",
    explanation:
      "`Folder` es el **composite** del patrón. A diferencia de `File`, un `Folder` puede contener otros `FileSystemComponent` — tanto archivos como otras carpetas.\n\n" +
      "El composite implementa:\n" +
      "- `children: FileSystemComponent[]` — array privado de hijos\n" +
      "- `add(component)` — agrega un hijo al array\n" +
      "- `remove(component)` — filtra el hijo del array\n\n" +
      "**La diferencia clave con la hoja**: `Folder` SOBREESCRIBE `add()` y `remove()` con implementaciones reales. Mientras que `File.add()` lanza error (hereda de `FileSystemComponent`), `Folder.add()` pusha al array de hijos.\n\n" +
      "Esto es el corazón de Composite: la misma interfaz (`add`, `remove`, `getSize`) funciona diferente según si el nodo es hoja o composite. El cliente no necesita saber cuál es cuál.",
    code: {
      typescript:
        "abstract class FileSystemComponent {\n" +
        "  constructor(protected name: string) {}\n" +
        "  abstract getSize(): number;\n" +
        "  abstract getName(): string;\n" +
        "  abstract print(indent?: string): void;\n" +
        "  add(component: FileSystemComponent): void {\n" +
        '    throw new Error("Cannot add to a leaf");\n' +
        "  }\n" +
        "  remove(component: FileSystemComponent): void {\n" +
        '    throw new Error("Cannot remove from a leaf");\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class File extends FileSystemComponent {\n" +
        "  constructor(name: string, private size: number) { super(name); }\n" +
        "  getSize() { return this.size; }\n" +
        "  getName() { return this.name; }\n" +
        '  print(indent = "") {\n' +
        '    console.log(`${indent}\\u{1F4C4} ${this.name} (${this.size}KB)`);\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class Folder extends FileSystemComponent {\n" +
        "  private children: FileSystemComponent[] = [];\n" +
        "  add(component: FileSystemComponent) {\n" +
        "    this.children.push(component);\n" +
        "  }\n" +
        "  remove(component: FileSystemComponent) {\n" +
        "    this.children = this.children.filter(c => c !== component);\n" +
        "  }\n" +
        "  getSize() {\n" +
        "    return this.children.reduce((sum, child) => sum + child.getSize(), 0);\n" +
        "  }\n" +
        "  getName() { return this.name; }\n" +
        '  print(indent = "") {\n' +
        '    console.log(`${indent}\\u{1F4C1} ${this.name}/ (${this.getSize()}KB)`);\n' +
        '    this.children.forEach(child => child.print(indent + "  "));\n' +
        "  }\n" +
        "}",
      javascript:
        "class FileSystemComponent {\n" +
        "  constructor(name) { this.name = name; }\n" +
        '  getSize() { throw new Error("Implement getSize()"); }\n' +
        '  getName() { throw new Error("Implement getName()"); }\n' +
        '  print(indent) { throw new Error("Implement print()"); }\n' +
        "  add(component) {\n" +
        '    throw new Error("Cannot add to a leaf");\n' +
        "  }\n" +
        "  remove(component) {\n" +
        '    throw new Error("Cannot remove from a leaf");\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class File extends FileSystemComponent {\n" +
        "  constructor(name, size) {\n" +
        "    super(name);\n" +
        "    this.size = size;\n" +
        "  }\n" +
        "  getSize() { return this.size; }\n" +
        "  getName() { return this.name; }\n" +
        "  print(indent) {\n" +
        "    indent = indent || '';\n" +
        "    console.log(indent + '\\u{1F4C4} ' + this.name + ' (' + this.size + 'KB)');\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class Folder extends FileSystemComponent {\n" +
        "  constructor(name) {\n" +
        "    super(name);\n" +
        "    this.children = [];\n" +
        "  }\n" +
        "  add(component) {\n" +
        "    this.children.push(component);\n" +
        "  }\n" +
        "  remove(component) {\n" +
        "    this.children = this.children.filter(c => c !== component);\n" +
        "  }\n" +
        "  getSize() {\n" +
        "    return this.children.reduce((sum, child) => sum + child.getSize(), 0);\n" +
        "  }\n" +
        "  getName() { return this.name; }\n" +
        "  print(indent) {\n" +
        "    indent = indent || '';\n" +
        "    console.log(indent + '\\u{1F4C1} ' + this.name + '/ (' + this.getSize() + 'KB)');\n" +
        "    this.children.forEach(child => child.print(indent + '  '));\n" +
        "  }\n" +
        "}",
    },
  },
  {
    index: 3,
    title: "Demostrá la recursividad con un árbol de archivos",
    explanation:
      "El paso final: construí un árbol y verificá que `getSize()` y `print()` funcionan recursivamente.\n\n" +
      "**La magia de Composite**: cuando llamás `root.getSize()` en una carpeta, ella delega a cada hijo. Si el hijo es un `File`, retorna su tamaño directo. Si es otro `Folder`, delega a SUS hijos. La recursión se propaga automáticamente hasta las hojas.\n\n" +
      "**El resultado**:\n" +
      "- `root.getSize()` = `src/index.ts` (5) + `src/app.ts` (12) + `package.json` (2) = **19**\n" +
      "- `root.print()` muestra la estructura completa con indentación jerárquica\n\n" +
      "**Lo que ganás con Composite**: una sola llamada `getSize()` calcula el total de TODA la estructura, sin importar la profundidad. Sin Composite, necesitarías `if/else` para distinguir archivos de carpetas en cada nivel de recursión.",
    code: {
      typescript:
        "abstract class FileSystemComponent {\n" +
        "  constructor(protected name: string) {}\n" +
        "  abstract getSize(): number;\n" +
        "  abstract getName(): string;\n" +
        "  abstract print(indent?: string): void;\n" +
        "  add(component: FileSystemComponent): void {\n" +
        '    throw new Error("Cannot add to a leaf");\n' +
        "  }\n" +
        "  remove(component: FileSystemComponent): void {\n" +
        '    throw new Error("Cannot remove from a leaf");\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class File extends FileSystemComponent {\n" +
        "  constructor(name: string, private size: number) { super(name); }\n" +
        "  getSize() { return this.size; }\n" +
        "  getName() { return this.name; }\n" +
        '  print(indent = "") {\n' +
        '    console.log(`${indent}\\u{1F4C4} ${this.name} (${this.size}KB)`);\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class Folder extends FileSystemComponent {\n" +
        "  private children: FileSystemComponent[] = [];\n" +
        "  add(component: FileSystemComponent) {\n" +
        "    this.children.push(component);\n" +
        "  }\n" +
        "  remove(component: FileSystemComponent) {\n" +
        "    this.children = this.children.filter(c => c !== component);\n" +
        "  }\n" +
        "  getSize() {\n" +
        "    return this.children.reduce((sum, child) => sum + child.getSize(), 0);\n" +
        "  }\n" +
        "  getName() { return this.name; }\n" +
        '  print(indent = "") {\n' +
        '    console.log(`${indent}\\u{1F4C1} ${this.name}/ (${this.getSize()}KB)`);\n' +
        '    this.children.forEach(child => child.print(indent + "  "));\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Demo — build a file tree\n" +
        "const root = new Folder('proyecto');\n" +
        "const src = new Folder('src');\n" +
        "src.add(new File('index.ts', 5));\n" +
        "src.add(new File('app.ts', 12));\n" +
        "root.add(src);\n" +
        "root.add(new File('package.json', 2));\n" +
        "\n" +
        "console.log(root.getSize()); // 19 — recursive sum!\n" +
        "root.print();               // shows tree with indentation",
      javascript:
        "class FileSystemComponent {\n" +
        "  constructor(name) { this.name = name; }\n" +
        '  getSize() { throw new Error("Implement getSize()"); }\n' +
        '  getName() { throw new Error("Implement getName()"); }\n' +
        '  print(indent) { throw new Error("Implement print()"); }\n' +
        "  add(component) {\n" +
        '    throw new Error("Cannot add to a leaf");\n' +
        "  }\n" +
        "  remove(component) {\n" +
        '    throw new Error("Cannot remove from a leaf");\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class File extends FileSystemComponent {\n" +
        "  constructor(name, size) {\n" +
        "    super(name);\n" +
        "    this.size = size;\n" +
        "  }\n" +
        "  getSize() { return this.size; }\n" +
        "  getName() { return this.name; }\n" +
        "  print(indent) {\n" +
        "    indent = indent || '';\n" +
        "    console.log(indent + '\\u{1F4C4} ' + this.name + ' (' + this.size + 'KB)');\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class Folder extends FileSystemComponent {\n" +
        "  constructor(name) {\n" +
        "    super(name);\n" +
        "    this.children = [];\n" +
        "  }\n" +
        "  add(component) {\n" +
        "    this.children.push(component);\n" +
        "  }\n" +
        "  remove(component) {\n" +
        "    this.children = this.children.filter(c => c !== component);\n" +
        "  }\n" +
        "  getSize() {\n" +
        "    return this.children.reduce((sum, child) => sum + child.getSize(), 0);\n" +
        "  }\n" +
        "  getName() { return this.name; }\n" +
        "  print(indent) {\n" +
        "    indent = indent || '';\n" +
        "    console.log(indent + '\\u{1F4C1} ' + this.name + '/ (' + this.getSize() + 'KB)');\n" +
        "    this.children.forEach(child => child.print(indent + '  '));\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Demo\n" +
        "const root = new Folder('proyecto');\n" +
        "const src = new Folder('src');\n" +
        "src.add(new File('index.ts', 5));\n" +
        "src.add(new File('app.ts', 12));\n" +
        "root.add(src);\n" +
        "root.add(new File('package.json', 2));\n" +
        "\n" +
        "console.log(root.getSize()); // 19\n" +
        "root.print();",
    },
  },
];

export const compositeGuided = buildGuidedExercise(
  "composite",
  "Composite \u2014 Modo Guiado",
  steps
);
