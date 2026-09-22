// Reference solution for Proxy exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: Image abstract class with display() and getInfo()
// Using abstract class (not interface) because Sucrase strips interfaces at runtime,
// which would break instanceof checks in the sandbox Worker.
export abstract class Image {
  abstract display(): void;
  abstract getInfo(): string;
}

// Acceptance Criterion 2: HighResImage simulates expensive loading
export class HighResImage extends Image {
  private loaded: boolean = false;

  constructor(private filename: string) {
    super();
    // Simulate expensive loading (in real app: disk/network fetch, decode, etc.)
    console.log(`⏳ Cargando imagen de alta resolución: ${filename}...`);
    this.loaded = true;
    console.log(`✅ Imagen cargada: ${filename}`);
  }

  display(): void {
    console.log(`🖼️ Mostrando ${this.filename} en alta resolución`);
  }

  getInfo(): string {
    return `${this.filename} (${this.loaded ? 'cargada' : 'no cargada'})`;
  }
}

// Acceptance Criterion 3: ImageProxy with lazy initialization
export class ImageProxy extends Image {
  private realImage: HighResImage | null = null;

  constructor(private filename: string) {
    super();
  }

  display(): void {
    if (!this.realImage) {
      // Lazy loading: create real image only when first displayed
      this.realImage = new HighResImage(this.filename);
    }
    this.realImage.display();
  }

  getInfo(): string {
    return this.realImage
      ? this.realImage.getInfo()
      : `${this.filename} (proxy - no cargada)`;
  }
}