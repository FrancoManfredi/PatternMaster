// Reference solution for Prototype exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: Shape interface with clone() and describe()
export abstract class Shape {
  abstract clone(): Shape;
  abstract describe(): string;
}

// Acceptance Criterion 2: Circle with position (nested object), color, and points (array)
export class Circle extends Shape {
  constructor(
    public radius: number,
    public color: string,
    public position: { x: number; y: number },
    public points: { x: number; y: number }[]
  ) {
    super();
  }

  clone(): Circle {
    return new Circle(
      this.radius,
      this.color,
      { ...this.position },
      this.points.map((p) => ({ ...p }))
    );
  }

  describe(): string {
    return `Circle(r=${this.radius}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`;
  }
}

// Acceptance Criterion 3: Rectangle with same properties
export class Rectangle extends Shape {
  constructor(
    public width: number,
    public height: number,
    public color: string,
    public position: { x: number; y: number },
    public points: { x: number; y: number }[]
  ) {
    super();
  }

  clone(): Rectangle {
    return new Rectangle(
      this.width,
      this.height,
      this.color,
      { ...this.position },
      this.points.map((p) => ({ ...p }))
    );
  }

  describe(): string {
    return `Rectangle(${this.width}x${this.height}, ${this.color}, pos=${this.position.x},${this.position.y}, ${this.points.length} points)`;
  }
}

// Acceptance Criterion 4: Deep copy — clone() returns independent copy
// (Verified by the behavioral tests: mutating clone.position/points does NOT affect original)
