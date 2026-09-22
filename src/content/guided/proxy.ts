import { buildGuidedExercise } from "@/lib/guided-mode/build";
import type { GuidedStepInput } from "@/lib/guided-mode/build";

const steps: GuidedStepInput[] = [
  {
    index: 0,
    title:
      "Definí la abstract class Image con display() y getInfo()",
    explanation:
      "El patrón **Proxy** resuelve el problema de controlar el acceso a objetos costosos. La clave es crear un sustituto que gestione la creación y acceso al objeto real.\n\n" +
      "Todo arranca con `Image`, la clase abstracta que define la interfaz del proxy. Usamos `abstract class` en vez de `interface` porque las interfaces se borran en tiempo de compilación (Sucrase las elimina). Si usáramos `interface`, el sandbox no podría verificar `instanceof Image`.\n\n" +
      "**Los métodos abstractos**:\n" +
      "- `display(): void` — muestra la imagen (puede ser costoso)\n" +
      "- `getInfo(): string` — retorna información sobre la imagen\n\n" +
      "El Proxy implementará la misma interfaz, haciendo que el cliente no sepa si habla con la imagen real o con el proxy.",
    code: {
      typescript:
        "abstract class Image {\n" +
        "  abstract display(): void;\n" +
        "  abstract getInfo(): string;\n" +
        "}",
      javascript:
        "class Image {\n" +
        '  display() { throw new Error("Implement display()"); }\n' +
        '  getInfo() { throw new Error("Implement getInfo()"); }\n' +
        "}",
    },
  },
  {
    index: 1,
    title:
      "Implementá HighResImage con carga simulada en constructor",
    explanation:
      "`HighResImage` es el **objeto real** — el recurso costoso que queremos proteger. Simula una carga lenta en el constructor (en producción sería descarga de disco/red, decodificación, etc.).\n\n" +
      "El estado real incluye:\n" +
      "- `filename` — el nombre del archivo\n" +
      "- `loaded` — indica si la imagen está cargada\n\n" +
      "**Lo clave**: el constructor es costoso. Tarda tiempo en ejecutarse. Si creamos 100 imágenes al inicio, el usuario espera 30 segundos. El Proxy evitará esto creando la imagen solo cuando se necesita.",
    code: {
      typescript:
        "abstract class Image {\n" +
        "  abstract display(): void;\n" +
        "  abstract getInfo(): string;\n" +
        "}\n" +
        "\n" +
        "class HighResImage extends Image {\n" +
        "  private loaded: boolean = false;\n" +
        "\n" +
        "  constructor(private filename: string) {\n" +
        "    super();\n" +
        "    // Simulate expensive loading\n" +
        "    console.log(`⏳ Cargando imagen de alta resolución: ${filename}...`);\n" +
        "    this.loaded = true;\n" +
        "    console.log(`✅ Imagen cargada: ${filename}`);\n" +
        "  }\n" +
        "\n" +
        "  display(): void {\n" +
        "    console.log(`🖼️ Mostrando ${this.filename} en alta resolución`);\n" +
        "  }\n" +
        "\n" +
        "  getInfo(): string {\n" +
        "    return `${this.filename} (${this.loaded ? 'cargada' : 'no cargada'})`;\n" +
        "  }\n" +
        "}",
      javascript:
        "class Image {\n" +
        '  display() { throw new Error("Implement display()"); }\n' +
        '  getInfo() { throw new Error("Implement getInfo()"); }\n' +
        "}\n" +
        "\n" +
        "class HighResImage extends Image {\n" +
        "  constructor(filename) {\n" +
        "    super();\n" +
        "    this.filename = filename;\n" +
        "    this.loaded = false;\n" +
        "    // Simulate expensive loading\n" +
        "    console.log(`⏳ Cargando imagen de alta resolución: ${filename}...`);\n" +
        "    this.loaded = true;\n" +
        "    console.log(`✅ Imagen cargada: ${filename}`);\n" +
        "  }\n" +
        "\n" +
        "  display() {\n" +
        "    console.log(`🖼️ Mostrando ${this.filename} en alta resolución`);\n" +
        "  }\n" +
        "\n" +
        "  getInfo() {\n" +
        "    return `${this.filename} (${this.loaded ? 'cargada' : 'no cargada'})`;\n" +
        "  }\n" +
        "}",
    },
  },
  {
    index: 2,
    title:
      "Implementá ImageProxy con lazy loading en display()",
    explanation:
      "`ImageProxy` es el **proxy virtual** — el sustituto que controla el acceso a `HighResImage`. La clave es el **lazy loading**: `realImage` se mantiene `null` hasta que `display()` se llama por primera vez.\n\n" +
      "**Cómo funciona**:\n" +
      "1. El proxy se crea instantáneamente (sin cargar la imagen real)\n" +
      "2. Cuando el cliente llama `display()`, el proxy verifica si `realImage` existe\n" +
      "3. Si no existe → crea un `HighResImage` (carga costosa ocurre aquí)\n" +
      "4. Si ya existe → reutiliza la instancia existente\n" +
      "5. Delega `display()` al objeto real\n\n" +
      "**El resultado**: crear 100 proxies es instantáneo. Las imágenes reales solo se crean cuando el usuario las ve. Si nunca las ve, nunca se crean.",
    code: {
      typescript:
        "abstract class Image {\n" +
        "  abstract display(): void;\n" +
        "  abstract getInfo(): string;\n" +
        "}\n" +
        "\n" +
        "class HighResImage extends Image {\n" +
        "  private loaded: boolean = false;\n" +
        "\n" +
        "  constructor(private filename: string) {\n" +
        "    super();\n" +
        "    console.log(`⏳ Cargando imagen de alta resolución: ${filename}...`);\n" +
        "    this.loaded = true;\n" +
        "    console.log(`✅ Imagen cargada: ${filename}`);\n" +
        "  }\n" +
        "\n" +
        "  display(): void {\n" +
        "    console.log(`🖼️ Mostrando ${this.filename} en alta resolución`);\n" +
        "  }\n" +
        "\n" +
        "  getInfo(): string {\n" +
        "    return `${this.filename} (${this.loaded ? 'cargada' : 'no cargada'})`;\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class ImageProxy extends Image {\n" +
        "  private realImage: HighResImage | null = null;\n" +
        "\n" +
        "  constructor(private filename: string) {\n" +
        "    super();\n" +
        "  }\n" +
        "\n" +
        "  display(): void {\n" +
        "    if (!this.realImage) {\n" +
        "      // Lazy loading: create real image only when first displayed\n" +
        "      this.realImage = new HighResImage(this.filename);\n" +
        "    }\n" +
        "    this.realImage.display();\n" +
        "  }\n" +
        "\n" +
        "  getInfo(): string {\n" +
        "    return this.realImage\n" +
        "      ? this.realImage.getInfo()\n" +
        "      : `${this.filename} (proxy - no cargada)`;\n" +
        "  }\n" +
        "}",
      javascript:
        "class Image {\n" +
        '  display() { throw new Error("Implement display()"); }\n' +
        '  getInfo() { throw new Error("Implement getInfo()"); }\n' +
        "}\n" +
        "\n" +
        "class HighResImage extends Image {\n" +
        "  constructor(filename) {\n" +
        "    super();\n" +
        "    this.filename = filename;\n" +
        "    this.loaded = false;\n" +
        "    console.log(`⏳ Cargando imagen de alta resolución: ${filename}...`);\n" +
        "    this.loaded = true;\n" +
        "    console.log(`✅ Imagen cargada: ${filename}`);\n" +
        "  }\n" +
        "\n" +
        "  display() {\n" +
        "    console.log(`🖼️ Mostrando ${this.filename} en alta resolución`);\n" +
        "  }\n" +
        "\n" +
        "  getInfo() {\n" +
        "    return `${this.filename} (${this.loaded ? 'cargada' : 'no cargada'})`;\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class ImageProxy extends Image {\n" +
        "  constructor(filename) {\n" +
        "    super();\n" +
        "    this.filename = filename;\n" +
        "    this.realImage = null;\n" +
        "  }\n" +
        "\n" +
        "  display() {\n" +
        "    if (!this.realImage) {\n" +
        "      // Lazy loading: create real image only when first displayed\n" +
        "      this.realImage = new HighResImage(this.filename);\n" +
        "    }\n" +
        "    this.realImage.display();\n" +
        "  }\n" +
        "\n" +
        "  getInfo() {\n" +
        "    return this.realImage\n" +
        "      ? this.realImage.getInfo()\n" +
        "      : `${this.filename} (proxy - no cargada)`;\n" +
        "  }\n" +
        "}",
    },
  },
  {
    index: 3,
    title:
      "Demostrá galería con zero-load creación y carga bajo demanda",
    explanation:
      "La galería es la **demostración final** del patrón Proxy. Creamos un array de `ImageProxy` — instantáneo, sin cargar ninguna imagen real.\n\n" +
      "**El flujo**:\n" +
      "1. `gallery` se crea con 3 proxies → 0 imágenes cargadas\n" +
      "2. `gallery[0].display()` → solo foto1.jpg se carga (lazy init)\n" +
      "3. `gallery[1].display()` → solo foto2.jpg se carga\n" +
      "4. `gallery[2]` nunca se muestra → nunca se carga\n\n" +
      "**El ahorro**: con 100 imágenes, solo se cargan las que el usuario ve. Si ve 5, solo 5 se cargan. Las otras 95 nunca consumen memoria ni tiempo de carga.\n\n" +
      "Esto es exactamente lo que hace `loading=\"lazy\"` en el navegador — un Proxy virtual del navegador.",
    code: {
      typescript:
        "abstract class Image {\n" +
        "  abstract display(): void;\n" +
        "  abstract getInfo(): string;\n" +
        "}\n" +
        "\n" +
        "class HighResImage extends Image {\n" +
        "  private loaded: boolean = false;\n" +
        "\n" +
        "  constructor(private filename: string) {\n" +
        "    super();\n" +
        "    console.log(`⏳ Cargando imagen de alta resolución: ${filename}...`);\n" +
        "    this.loaded = true;\n" +
        "    console.log(`✅ Imagen cargada: ${filename}`);\n" +
        "  }\n" +
        "\n" +
        "  display(): void {\n" +
        "    console.log(`🖼️ Mostrando ${this.filename} en alta resolución`);\n" +
        "  }\n" +
        "\n" +
        "  getInfo(): string {\n" +
        "    return `${this.filename} (${this.loaded ? 'cargada' : 'no cargada'})`;\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class ImageProxy extends Image {\n" +
        "  private realImage: HighResImage | null = null;\n" +
        "\n" +
        "  constructor(private filename: string) {\n" +
        "    super();\n" +
        "  }\n" +
        "\n" +
        "  display(): void {\n" +
        "    if (!this.realImage) {\n" +
        "      this.realImage = new HighResImage(this.filename);\n" +
        "    }\n" +
        "    this.realImage.display();\n" +
        "  }\n" +
        "\n" +
        "  getInfo(): string {\n" +
        "    return this.realImage\n" +
        "      ? this.realImage.getInfo()\n" +
        "      : `${this.filename} (proxy - no cargada)`;\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Demo — gallery with zero images loaded at startup!\n" +
        "console.log('Creando galería...');\n" +
        "const gallery: Image[] = [\n" +
        "  new ImageProxy('foto1.jpg'),\n" +
        "  new ImageProxy('foto2.jpg'),\n" +
        "  new ImageProxy('foto3.jpg'),\n" +
        "];\n" +
        "console.log('Galería lista — 0 imágenes cargadas');\n" +
        "\n" +
        "console.log('\\nMostrando foto1...');\n" +
        "gallery[0].display(); // Solo esta carga\n" +
        "\n" +
        "console.log('\\nMostrando foto2...');\n" +
        "gallery[1].display(); // Solo esta carga\n" +
        "\n" +
        "console.log('\\nfoto3.jpg nunca se carga si el usuario no la ve');\n" +
        "// gallery[2].display() // Uncomment to load foto3",
      javascript:
        "class Image {\n" +
        '  display() { throw new Error("Implement display()"); }\n' +
        '  getInfo() { throw new Error("Implement getInfo()"); }\n' +
        "}\n" +
        "\n" +
        "class HighResImage extends Image {\n" +
        "  constructor(filename) {\n" +
        "    super();\n" +
        "    this.filename = filename;\n" +
        "    this.loaded = false;\n" +
        "    console.log(`⏳ Cargando imagen de alta resolución: ${filename}...`);\n" +
        "    this.loaded = true;\n" +
        "    console.log(`✅ Imagen cargada: ${filename}`);\n" +
        "  }\n" +
        "\n" +
        "  display() {\n" +
        "    console.log(`🖼️ Mostrando ${this.filename} en alta resolución`);\n" +
        "  }\n" +
        "\n" +
        "  getInfo() {\n" +
        "    return `${this.filename} (${this.loaded ? 'cargada' : 'no cargada'})`;\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "class ImageProxy extends Image {\n" +
        "  constructor(filename) {\n" +
        "    super();\n" +
        "    this.filename = filename;\n" +
        "    this.realImage = null;\n" +
        "  }\n" +
        "\n" +
        "  display() {\n" +
        "    if (!this.realImage) {\n" +
        "      this.realImage = new HighResImage(this.filename);\n" +
        "    }\n" +
        "    this.realImage.display();\n" +
        "  }\n" +
        "\n" +
        "  getInfo() {\n" +
        "    return this.realImage\n" +
        "      ? this.realImage.getInfo()\n" +
        "      : `${this.filename} (proxy - no cargada)`;\n" +
        "  }\n" +
        "}\n" +
        "\n" +
        "// Demo\n" +
        "console.log('Creando galería...');\n" +
        "const gallery = [\n" +
        "  new ImageProxy('foto1.jpg'),\n" +
        "  new ImageProxy('foto2.jpg'),\n" +
        "  new ImageProxy('foto3.jpg'),\n" +
        "];\n" +
        "console.log('Galería lista — 0 imágenes cargadas');\n" +
        "\n" +
        "console.log('\\nMostrando foto1...');\n" +
        "gallery[0].display(); // Solo esta carga\n" +
        "\n" +
        "console.log('\\nMostrando foto2...');\n" +
        "gallery[1].display(); // Solo esta carga\n" +
        "\n" +
        "console.log('\\nfoto3.jpg nunca se carga si el usuario no la ve');",
    },
  },
];

export const proxyGuided = buildGuidedExercise(
  "proxy",
  "Proxy \u2014 Modo Guiado",
  steps
);