// Reference solution for Flyweight exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: CharacterFlyweight abstract class with render(x, y)
// Using abstract class (not interface) because Sucrase strips interfaces at runtime,
// which would break instanceof checks in the sandbox Worker.
export abstract class CharacterFlyweight {
  abstract render(x: number, y: number): void;
}

// Acceptance Criterion 2: ConcreteCharacter with intrinsic state (char, font, size, color)
export class ConcreteCharacter extends CharacterFlyweight {
  constructor(
    private char: string,
    private font: string,
    private size: number,
    private color: string
  ) {
    super();
  }

  render(x: number, y: number) {
    console.log(
      `Render '${this.char}' at (${x},${y}) with ${this.font} ${this.size}px ${this.color}`
    );
  }
}

// Acceptance Criterion 3: CharacterFactory with pool of Flyweights
export class CharacterFactory {
  private pool = new Map<string, CharacterFlyweight>();

  getCharacter(
    char: string,
    font: string,
    size: number,
    color: string
  ): CharacterFlyweight {
    const key = `${char}-${font}-${size}-${color}`;
    if (!this.pool.has(key)) {
      this.pool.set(key, new ConcreteCharacter(char, font, size, color));
    }
    return this.pool.get(key)!;
  }

  getPoolSize(): number {
    return this.pool.size;
  }
}

// Acceptance Criterion 4: Document with extrinsic state and factory delegation
export class Document {
  private characters: Array<{
    flyweight: CharacterFlyweight;
    x: number;
    y: number;
  }> = [];
  private factory = new CharacterFactory();

  addCharacter(
    char: string,
    x: number,
    y: number,
    font: string,
    size: number,
    color: string
  ) {
    const flyweight = this.factory.getCharacter(char, font, size, color);
    this.characters.push({ flyweight, x, y });
  }

  render() {
    this.characters.forEach(({ flyweight, x, y }) => flyweight.render(x, y));
  }
}
