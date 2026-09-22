import { buildGuidedExercise } from "@/lib/guided-mode/build";
import type { GuidedStepInput } from "@/lib/guided-mode/build";

const steps: GuidedStepInput[] = [
  {
    index: 0,
    title: "Definí la abstract class Shape con clone() y describe()",
    explanation:
      "El patrón **Prototype** resuelve un problema fundamental: necesitás crear copias independientes de objetos complejos sin acoplarte a sus clases concretas. En vez de usar `new` para crear objetos desde cero, clonás un prototipo existente.\n\n" +
      "**El ejercicio de este patrón**: vamos a implementar shapes geométricas (Circle, Rectangle) que se pueden clonar de forma segura. Todo arranca con la **clase abstracta base** `Shape` que establece el contrato: cualquier shape debe poder clonarse a sí mismo con `clone()` y describirse con `describe()`.\n\n" +
      "Usamos `abstract class` en vez de `interface` porque las interfaces se borran en tiempo de compilación (Sucrase las elimina). Si usáramos `interface`, el sandbox no podría verificar `instanceof Shape`. Con `abstract class`, Shape existe en tiempo de ejecución.\n\n" +
      "**Conceptos clave**: `clone()` retorna `Shape` — no importa si el objeto concreto es un Circle o un Rectangle, el cliente puede clonar sin saber la clase exacta. Eso es polimorfismo + Prototype en acción.",
    code: {
      typescript:
        "abstract class Shape {\n" +
        "  abstract clone(): Shape;\n" +
        "  abstract describe(): string;\n" +
        "}",
      javascript:
        "class Shape {\n" +
        "  clone() {\n" +
        '    throw new Error("clone() debe ser implementado");\n' +
        "  }\n" +
        "  describe() {\n" +
        '    throw new Error("describe() debe ser implementado");\n' +
        "  }\n" +
        "}",
    },
  },
  {
    index: 1,
    title: "Implementá Circle con deep copy clone()",
    explanation:
      "Ahora implementamos el primer prototipo concreto: `Circle`. Tiene `radius`, `color`, `position` (un objeto anidado con `x` e `y`) y `points` (un array de objetos).\n\n" +
      "**La clave del patrón está en `clone()`**: NO alcanza con hacer `{ ...this }` (spread operator). Eso solo copia el primer nivel — los objetos anidados como `position` y los elementos dentro de `points` siguen siendo las MISMAS referencias. Si modificás el clone, modificás el original.\n\n" +
      "**Deep copy manual**:\n" +
      "- `position` → `{ ...this.position }` — copia el objeto anidado\n" +
      "- `points` → `this.points.map(p => ({ ...p }))` — copia cada elemento del array\n\n" +
      "Esto garantiza que el clone sea completamente independiente del original. Si mutás `clone.position.x = 100`, el original sigue en `0`.\n\n" +
      "**Nota**: usamos spread `{...}` para objetos simples. Para estructuras más complejas (fechas, Maps, Sets, referencias circulares), usaríamos `structuredClone()`.",
    code: {
      typescript:
        "abstract class Shape {\n" +
        "  abstract clone(): Shape;\n" +
        "  abstract describe(): string;\n" +
        "}\n" +
        "\n" +
        "class Circle extends Shape {\n" +
        "  constructor(\n" +
        "    public radius: number,\n" +
        "    public color: string,\n" +
        "    public position: { x: number; y: number },\n" +
        "    public points: { x: number; y: number }[]\n" +
        "  ) {\n" +
        "    super();\n" +
        "  }\n" +
        "\n" +
        "  clone(): Circle {\n" +
        "    return new Circle(\n" +
        "      this.radius,\n" +
        "      this.color,\n" +
        "      { ...this.position },\n" +
        "      this.points.map(p => ({ ...p }))\n" +
        "    );\n" +
        "  }\n" +
        "\n" +
        "  describe(): string {\n" +
        '    return `Circle(r=${this.radius}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`;\n' +
        "  }\n" +
        "}",
      javascript:
        "class Shape {\n" +
        '  clone() { throw new Error("Implement clone()"); }\n' +
        '  describe() { throw new Error("Implement describe()"); }\n' +
        "}\n" +
        "\n" +
        "class Circle extends Shape {\n" +
        "  constructor(radius, color, position, points) {\n" +
        "    super();\n" +
        "    this.radius = radius;\n" +
        "    this.color = color;\n" +
        "    this.position = position;\n" +
        "    this.points = points;\n" +
        "  }\n" +
        "\n" +
        "  clone() {\n" +
        "    return new Circle(\n" +
        "      this.radius,\n" +
        "      this.color,\n" +
        "      { ...this.position },\n" +
        "      this.points.map(p => ({ ...p }))\n" +
        "    );\n" +
        "  }\n" +
        "\n" +
        "  describe() {\n" +
        '    return `Circle(r=${this.radius}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`;\n' +
        "  }\n" +
        "}",
    },
  },
  {
    index: 2,
    title: "Implementá Rectangle con la misma estrategia deep copy",
    explanation:
      "Rectangle sigue exactamente el mismo patrón que Circle. La diferencia es que tiene `width` y `height` en vez de `radius`, pero la estrategia de deep copy es idéntica: spread para `position`, map + spread para `points`.\n\n" +
      "**Por qué es importante que ambos usen la misma estrategia**: si Circle hiciera deep copy y Rectangle no, tendrías un bug silencioso — a veces clonar funciona, a veces no. La consistencia es clave.\n\n" +
      "**Extensibilidad**: si más adelante querés agregar Triangle, Pentagon, o cualquier otra shape, solo necesitás extender `Shape` e implementar `clone()` con la misma lógica de deep copy. El código que usa `Shape` no cambia ni una línea — eso es el Principio de Abierto/Cerrado en acción.",
    code: {
      typescript:
        "abstract class Shape {\n" +
        "  abstract clone(): Shape;\n" +
        "  abstract describe(): string;\n" +
        "}\n" +
        "\n" +
        "class Circle extends Shape {\n" +
        "  constructor(\n" +
        "    public radius: number,\n" +
        "    public color: string,\n" +
        "    public position: { x: number; y: number },\n" +
        "    public points: { x: number; y: number }[]\n" +
        "  ) { super(); }\n" +
        "\n" +
        "  clone(): Circle {\n" +
        "    return new Circle(this.radius, this.color, { ...this.position }, this.points.map(p => ({ ...p })));\n" +
        "  }\n" +
        "\n" +
        "  describe(): string {\n" +
        '    return `Circle(r=${this.radius}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`;\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class Rectangle extends Shape {\n" +
        "  constructor(\n" +
        "    public width: number,\n" +
        "    public height: number,\n" +
        "    public color: string,\n" +
        "    public position: { x: number; y: number },\n" +
        "    public points: { x: number; y: number }[]\n" +
        "  ) { super(); }\n" +
        "\n" +
        "  clone(): Rectangle {\n" +
        "    return new Rectangle(\n" +
        "      this.width,\n" +
        "      this.height,\n" +
        "      this.color,\n" +
        "      { ...this.position },\n" +
        "      this.points.map(p => ({ ...p }))\n" +
        "    );\n" +
        "  }\n" +
        "\n" +
        "  describe(): string {\n" +
        '    return `Rectangle(${this.width}x${this.height}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`;\n' +
        "  }\n" +
        "}",
      javascript:
        "class Shape {\n" +
        '  clone() { throw new Error("Implement clone()"); }\n' +
        '  describe() { throw new Error("Implement describe()"); }\n' +
        "}\n" +
        "\n" +
        "class Circle extends Shape {\n" +
        "  constructor(radius, color, position, points) {\n" +
        "    super(); this.radius = radius; this.color = color; this.position = position; this.points = points;\n" +
        "  }\n" +
        "  clone() { return new Circle(this.radius, this.color, { ...this.position }, this.points.map(p => ({ ...p }))); }\n" +
        "  describe() { return `Circle(r=${this.radius}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`; }\n" +
        "}\n" +
        "\n" +
        "class Rectangle extends Shape {\n" +
        "  constructor(width, height, color, position, points) {\n" +
        "    super(); this.width = width; this.height = height; this.color = color; this.position = position; this.points = points;\n" +
        "  }\n" +
        "  clone() { return new Rectangle(this.width, this.height, this.color, { ...this.position }, this.points.map(p => ({ ...p }))); }\n" +
        "  describe() { return `Rectangle(${this.width}x${this.height}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`; }\n" +
        "}",
    },
  },
  {
    index: 3,
    title: "Verificá que clone() produce deep copies independientes",
    explanation:
      "Este paso demuestra el resultado final. Creamos un Circle, lo clonamos, y mutamos las propiedades anidadas del clone. Si el deep copy está bien implementado, el original NO se ve afectado.\n\n" +
      "**El código de verificación**:\n" +
      "1. Creamos un Circle con position {x:0, y:0} y points [{x:1, y:1}]\n" +
      "2. Clonamos con `original.clone()`\n" +
      "3. Mutamos `clone.position.x = 100` y `clone.points[0].x = 999`\n" +
      "4. Verificamos que `original.position.x` sigue siendo `0`\n" +
      "5. Verificamos que `original.points[0].x` sigue siendo `1`\n\n" +
      "**Si esto falla**, significa que clone() hace shallow copy — el bug que el patrón Prototype resuelve. Si los console.log muestran los valores originales (0 y 1), el deep copy funciona!\n\n" +
      "**La moraleja**: el operador spread `{...obj}` copia solo el primer nivel. Para objetos anidados, necesitás copia recursiva. Prototype encapsula esa lógica en el método `clone()` para que el cliente nunca tenga que preocuparse por ello.",
    code: {
      typescript:
        "abstract class Shape {\n" +
        "  abstract clone(): Shape;\n" +
        "  abstract describe(): string;\n" +
        "}\n" +
        "\n" +
        "class Circle extends Shape {\n" +
        "  constructor(\n" +
        "    public radius: number,\n" +
        "    public color: string,\n" +
        "    public position: { x: number; y: number },\n" +
        "    public points: { x: number; y: number }[]\n" +
        "  ) { super(); }\n" +
        "\n" +
        "  clone(): Circle {\n" +
        "    return new Circle(this.radius, this.color, { ...this.position }, this.points.map(p => ({ ...p })));\n" +
        "  }\n" +
        "\n" +
        "  describe(): string {\n" +
        '    return `Circle(r=${this.radius}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`;\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "class Rectangle extends Shape {\n" +
        "  constructor(\n" +
        "    public width: number,\n" +
        "    public height: number,\n" +
        "    public color: string,\n" +
        "    public position: { x: number; y: number },\n" +
        "    public points: { x: number; y: number }[]\n" +
        "  ) { super(); }\n" +
        "\n" +
        "  clone(): Rectangle {\n" +
        "    return new Rectangle(this.width, this.height, this.color, { ...this.position }, this.points.map(p => ({ ...p })));\n" +
        "  }\n" +
        "\n" +
        "  describe(): string {\n" +
        '    return `Rectangle(${this.width}x${this.height}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`;\n' +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Verification — deep copy isolation test\n" +
        "const original = new Circle(5, 'red', { x: 0, y: 0 }, [\n" +
        "  { x: 1, y: 1 }, { x: 2, y: 2 }\n" +
        "]);\n" +
        "const clone = original.clone();\n" +
        "\n" +
        "clone.position.x = 100;\n" +
        "clone.points[0].x = 999;\n" +
        "\n" +
        "console.log(original.position.x);   // Must be 0\n" +
        "console.log(original.points[0].x);  // Must be 1\n" +
        "console.log(clone.position.x);      // Must be 100\n" +
        "console.log(clone.points[0].x);     // Must be 999\n" +
        "console.log(original.describe());   // Circle(r=5, red, pos=0,0, 2 points)\n" +
        "console.log(clone.describe());      // Circle(r=5, red, pos=100,0, 2 points)",
      javascript:
        "class Shape {\n" +
        '  clone() { throw new Error("Implement clone()"); }\n' +
        '  describe() { throw new Error("Implement describe()"); }\n' +
        "}\n" +
        "\n" +
        "class Circle extends Shape {\n" +
        "  constructor(radius, color, position, points) {\n" +
        "    super(); this.radius = radius; this.color = color; this.position = position; this.points = points;\n" +
        "  }\n" +
        "  clone() { return new Circle(this.radius, this.color, { ...this.position }, this.points.map(p => ({ ...p }))); }\n" +
        "  describe() { return `Circle(r=${this.radius}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`; }\n" +
        "}\n" +
        "\n" +
        "class Rectangle extends Shape {\n" +
        "  constructor(width, height, color, position, points) {\n" +
        "    super(); this.width = width; this.height = height; this.color = color; this.position = position; this.points = points;\n" +
        "  }\n" +
        "  clone() { return new Rectangle(this.width, this.height, this.color, { ...this.position }, this.points.map(p => ({ ...p }))); }\n" +
        "  describe() { return `Rectangle(${this.width}x${this.height}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`; }\n" +
        "}\n" +
        "\n" +
        "// Verification\n" +
        "const original = new Circle(5, 'red', { x: 0, y: 0 }, [{ x: 1, y: 1 }, { x: 2, y: 2 }]);\n" +
        "const clone = original.clone();\n" +
        "clone.position.x = 100;\n" +
        "clone.points[0].x = 999;\n" +
        "\n" +
        "console.log(original.position.x);   // 0\n" +
        "console.log(original.points[0].x);  // 1\n" +
        "console.log(clone.position.x);      // 100\n" +
        "console.log(clone.points[0].x);     // 999",
    },
  },
];

export const prototypeGuided = buildGuidedExercise(
  "prototype",
  "Prototype — Modo Guiado",
  steps
);
