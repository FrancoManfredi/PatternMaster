import { buildGuidedExercise } from "@/lib/guided-mode/build";
import type { GuidedStepInput } from "@/lib/guided-mode/build";

const steps: GuidedStepInput[] = [
  {
    index: 0,
    title:
      "Definí la abstract class CharacterFlyweight con render(x, y)",
    explanation:
      "El patrón **Flyweight** resuelve el problema de consumir memoria masiva cuando tenés miles de objetos con estado compartido. La clave es separar el estado **intrínseco** (compartido) del estado **extrínseco** (individual).\n\n" +
      "Todo arranca con `CharacterFlyweight`, la clase abstracta que define la interfaz del flyweight. Usamos `abstract class` en vez de `interface` porque las interfaces se borran en tiempo de compilación (Sucrase las elimina). Si usáramos `interface`, el sandbox no podría verificar `instanceof CharacterFlyweight`.\n\n" +
      "**El método abstracto**:\n" +
      "- `render(x: number, y: number): void` — recibe la posición (estado extrínseco) como parámetro\n\n" +
      "El flyweight NO almacena la posición — eso es estado extrínseco que vive en el cliente. El flyweight solo define CÓMO renderizar, el cliente decide DÓNDE.",
    code: {
      typescript:
        "abstract class CharacterFlyweight {\n" +
        "  abstract render(x: number, y: number): void;\n" +
        "}",
      javascript:
        "class CharacterFlyweight {\n" +
        '  render(x, y) { throw new Error("Implement render(x, y)"); }\n' +
        "}",
    },
  },
  {
    index: 1,
    title:
      "Implementá ConcreteCharacter con estado intrínseco (char, font, size, color)",
    explanation:
      "`ConcreteCharacter` es el **flyweight concreto**. Almacena el estado **intrínseco** — las propiedades que se comparten entre muchos objetos.\n\n" +
      "El estado intrínseco de un carácter es:\n" +
      "- `char` — el carácter ('A', 'B', 'x', etc.)\n" +
      "- `font` — la fuente ('Arial', 'Helvetica', etc.)\n" +
      "- `size` — el tamaño en píxeles (12, 14, 16, etc.)\n" +
      "- `color` — el color ('#000', '#FF0000', etc.)\n\n" +
      "**Lo clave**: estos datos son FIJOS una vez creado el flyweight. No cambian. Si 10,000 caracteres 'A' usan la misma fuente y color, solo necesitamos UN objeto `ConcreteCharacter` con ese estado intrínseco. Las 10,000 posiciones (x, y) son estado extrínseco que vive en el cliente.",
    code: {
      typescript:
        "abstract class CharacterFlyweight {\n" +
        "  abstract render(x: number, y: number): void;\n" +
        "}\n" +
        "\n" +
        "class ConcreteCharacter extends CharacterFlyweight {\n" +
        "  constructor(\n" +
        "    private char: string,\n" +
        "    private font: string,\n" +
        "    private size: number,\n" +
        "    private color: string\n" +
        "  ) {\n" +
        "    super();\n" +
        "  }\n" +
        "\n" +
        "  render(x: number, y: number) {\n" +
        "    console.log(\n" +
        "      `Render '${this.char}' at (${x},${y}) with ${this.font} ${this.size}px ${this.color}`\n" +
        "    );\n" +
        "  }\n" +
        "}",
      javascript:
        "class CharacterFlyweight {\n" +
        '  render(x, y) { throw new Error("Implement render(x, y)"); }\n' +
        "}\n" +
        "\n" +
        "class ConcreteCharacter extends CharacterFlyweight {\n" +
        "  constructor(char, font, size, color) {\n" +
        "    super();\n" +
        "    this.char = char;\n" +
        "    this.font = font;\n" +
        "    this.size = size;\n" +
        "    this.color = color;\n" +
        "  }\n" +
        "\n" +
        "  render(x, y) {\n" +
        "    console.log(\n" +
        "      `Render '${this.char}' at (${x},${y}) with ${this.font} ${this.size}px ${this.color}`\n" +
        "    );\n" +
        "  }\n" +
        "}",
    },
  },
  {
    index: 2,
    title:
      "Implementá CharacterFactory con pool de Flyweights y reutilización",
    explanation:
      "`CharacterFactory` es el **corazón del patrón Flyweight**. Gestiona un pool (caché) de flyweights y garantiza la reutilización.\n\n" +
      "**Cómo funciona**:\n" +
      "1. El cliente pide un flyweight con parámetros `(char, font, size, color)`\n" +
      "2. La fábrica construye una clave: `A-Arial-12-#000`\n" +
      "3. Si la clave YA existe en el pool → retorna el flyweight existente (¡reutilización!)\n" +
      "4. Si NO existe → crea un nuevo flyweight, lo guarda en el pool, y lo retorna\n\n" +
      "**El resultado**: `getCharacter('A', 'Arial', 12, '#000')` llamado 10,000 veces retorna SIEMPRE la misma instancia. `getPoolSize()` queda en 1. Eso es el ahorro de memoria del Flyweight: 1 objeto compartido en vez de 10,000.",
    code: {
      typescript:
        "abstract class CharacterFlyweight {\n" +
        "  abstract render(x: number, y: number): void;\n" +
        "}\n" +
        "\n" +
        "class ConcreteCharacter extends CharacterFlyweight {\n" +
        "  constructor(\n" +
        "    private char: string,\n" +
        "    private font: string,\n" +
        "    private size: number,\n" +
        "    private color: string\n" +
        "  ) {\n" +
        "    super();\n" +
        "  }\n" +
        "\n" +
        "  render(x: number, y: number) {\n" +
        "    console.log(\n" +
        "      `Render '${this.char}' at (${x},${y}) with ${this.font} ${this.size}px ${this.color}`\n" +
        "    );\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class CharacterFactory {\n" +
        "  private pool = new Map<string, CharacterFlyweight>();\n" +
        "\n" +
        "  getCharacter(\n" +
        "    char: string,\n" +
        "    font: string,\n" +
        "    size: number,\n" +
        "    color: string\n" +
        "  ): CharacterFlyweight {\n" +
        "    const key = `${char}-${font}-${size}-${color}`;\n" +
        "    if (!this.pool.has(key)) {\n" +
        "      this.pool.set(key, new ConcreteCharacter(char, font, size, color));\n" +
        "    }\n" +
        "    return this.pool.get(key)!;\n" +
        "  }\n" +
        "\n" +
        "  getPoolSize(): number {\n" +
        "    return this.pool.size;\n" +
        "  }\n" +
        "}",
      javascript:
        "class CharacterFlyweight {\n" +
        '  render(x, y) { throw new Error("Implement render(x, y)"); }\n' +
        "}\n" +
        "\n" +
        "class ConcreteCharacter extends CharacterFlyweight {\n" +
        "  constructor(char, font, size, color) {\n" +
        "    super();\n" +
        "    this.char = char;\n" +
        "    this.font = font;\n" +
        "    this.size = size;\n" +
        "    this.color = color;\n" +
        "  }\n" +
        "\n" +
        "  render(x, y) {\n" +
        "    console.log(\n" +
        "      `Render '${this.char}' at (${x},${y}) with ${this.font} ${this.size}px ${this.color}`\n" +
        "    );\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class CharacterFactory {\n" +
        "  constructor() { this.pool = new Map(); }\n" +
        "\n" +
        "  getCharacter(char, font, size, color) {\n" +
        "    const key = char + '-' + font + '-' + size + '-' + color;\n" +
        "    if (!this.pool.has(key)) {\n" +
        "      this.pool.set(key, new ConcreteCharacter(char, font, size, color));\n" +
        "    }\n" +
        "    return this.pool.get(key);\n" +
        "  }\n" +
        "\n" +
        "  getPoolSize() { return this.pool.size; }\n" +
        "}",
    },
  },
  {
    index: 3,
    title:
      "Implementá Document con posiciones extrínsecas y demo de reutilización",
    explanation:
      "`Document` es el **cliente** del patrón Flyweight. Mantiene el estado **extrínseco** (posiciones x, y) y delega el estado intrínseco a la fábrica.\n\n" +
      "**La separación**:\n" +
      "- `characters` almacena `{ flyweight, x, y }` — la posición es extrínseca\n" +
      "- `factory` gestiona los flyweights — el estado intrínseco vive en el pool\n\n" +
      "**addCharacter()** pide un flyweight a la fábrica y lo asocia con la posición. Si el carácter ya existe en el pool, reutiliza el flyweight.\n\n" +
      "**render()** itera sobre todos los caracteres y delega a `flyweight.render(x, y)`. El flyweight sabe CÓMO dibujar, el Document sabe DÓNDE.\n\n" +
      "**El ahorro**: con 1000 caracteres 'A' con la misma fuente, `factory.getPoolSize()` es **1** — un solo objeto flyweight compartido, 1000 referencias con posiciones individuales.",
    code: {
      typescript:
        "abstract class CharacterFlyweight {\n" +
        "  abstract render(x: number, y: number): void;\n" +
        "}\n" +
        "\n" +
        "class ConcreteCharacter extends CharacterFlyweight {\n" +
        "  constructor(\n" +
        "    private char: string,\n" +
        "    private font: string,\n" +
        "    private size: number,\n" +
        "    private color: string\n" +
        "  ) {\n" +
        "    super();\n" +
        "  }\n" +
        "\n" +
        "  render(x: number, y: number) {\n" +
        "    console.log(\n" +
        "      `Render '${this.char}' at (${x},${y}) with ${this.font} ${this.size}px ${this.color}`\n" +
        "    );\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class CharacterFactory {\n" +
        "  private pool = new Map<string, CharacterFlyweight>();\n" +
        "\n" +
        "  getCharacter(\n" +
        "    char: string,\n" +
        "    font: string,\n" +
        "    size: number,\n" +
        "    color: string\n" +
        "  ): CharacterFlyweight {\n" +
        "    const key = `${char}-${font}-${size}-${color}`;\n" +
        "    if (!this.pool.has(key)) {\n" +
        "      this.pool.set(key, new ConcreteCharacter(char, font, size, color));\n" +
        "    }\n" +
        "    return this.pool.get(key)!;\n" +
        "  }\n" +
        "\n" +
        "  getPoolSize(): number {\n" +
        "    return this.pool.size;\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class Document {\n" +
        "  private characters: Array<{\n" +
        "    flyweight: CharacterFlyweight;\n" +
        "    x: number;\n" +
        "    y: number;\n" +
        "  }> = [];\n" +
        "  private factory = new CharacterFactory();\n" +
        "\n" +
        "  addCharacter(\n" +
        "    char: string,\n" +
        "    x: number,\n" +
        "    y: number,\n" +
        "    font: string,\n" +
        "    size: number,\n" +
        "    color: string\n" +
        "  ) {\n" +
        "    const flyweight = this.factory.getCharacter(char, font, size, color);\n" +
        "    this.characters.push({ flyweight, x, y });\n" +
        "  }\n" +
        "\n" +
        "  render() {\n" +
        "    this.characters.forEach(({ flyweight, x, y }) =>\n" +
        "      flyweight.render(x, y)\n" +
        "    );\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Demo — 1000 'A' characters, only 1 flyweight in memory!\n" +
        "const doc = new Document();\n" +
        "for (let i = 0; i < 1000; i++) {\n" +
        "  doc.addCharacter('A', i * 10, 0, 'Arial', 12, '#000');\n" +
        "}\n" +
        "doc.render();\n" +
        "// Pool size = 1 — massive memory savings!",
      javascript:
        "class CharacterFlyweight {\n" +
        '  render(x, y) { throw new Error("Implement render(x, y)"); }\n' +
        "}\n" +
        "\n" +
        "class ConcreteCharacter extends CharacterFlyweight {\n" +
        "  constructor(char, font, size, color) {\n" +
        "    super();\n" +
        "    this.char = char;\n" +
        "    this.font = font;\n" +
        "    this.size = size;\n" +
        "    this.color = color;\n" +
        "  }\n" +
        "\n" +
        "  render(x, y) {\n" +
        "    console.log(\n" +
        "      `Render '${this.char}' at (${x},${y}) with ${this.font} ${this.size}px ${this.color}`\n" +
        "    );\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class CharacterFactory {\n" +
        "  constructor() { this.pool = new Map(); }\n" +
        "\n" +
        "  getCharacter(char, font, size, color) {\n" +
        "    const key = char + '-' + font + '-' + size + '-' + color;\n" +
        "    if (!this.pool.has(key)) {\n" +
        "      this.pool.set(key, new ConcreteCharacter(char, font, size, color));\n" +
        "    }\n" +
        "    return this.pool.get(key);\n" +
        "  }\n" +
        "\n" +
        "  getPoolSize() { return this.pool.size; }\n" +
        "}\n" +
        "\n" +
        "class Document {\n" +
        "  constructor() {\n" +
        "    this.characters = [];\n" +
        "    this.factory = new CharacterFactory();\n" +
        "  }\n" +
        "\n" +
        "  addCharacter(char, x, y, font, size, color) {\n" +
        "    const flyweight = this.factory.getCharacter(char, font, size, color);\n" +
        "    this.characters.push({ flyweight, x, y });\n" +
        "  }\n" +
        "\n" +
        "  render() {\n" +
        "    this.characters.forEach(({ flyweight, x, y }) =>\n" +
        "      flyweight.render(x, y)\n" +
        "    );\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Demo\n" +
        "const doc = new Document();\n" +
        "for (let i = 0; i < 1000; i++) {\n" +
        "  doc.addCharacter('A', i * 10, 0, 'Arial', 12, '#000');\n" +
        "}\n" +
        "doc.render();",
    },
  },
];

export const flyweightGuided = buildGuidedExercise(
  "flyweight",
  "Flyweight \u2014 Modo Guiado",
  steps
);
