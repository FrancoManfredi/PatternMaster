// Reference solution for Composite exercise
// This implements all 5 acceptance criteria

// Acceptance Criterion 1: FileSystemComponent abstract class with getSize(), getName(), print()
// Using abstract class (not interface) because Sucrase strips interfaces at runtime,
// which would break instanceof checks in the sandbox Worker.
export abstract class FileSystemComponent {
  constructor(protected name: string) {}

  abstract getSize(): number;
  abstract getName(): string;
  abstract print(indent?: string): void;

  // Default implementations throw — only composites override these
  add(_component: FileSystemComponent): void {
    throw new Error("Cannot add to a leaf");
  }

  remove(_component: FileSystemComponent): void {
    throw new Error("Cannot remove from a leaf");
  }
}

// Acceptance Criterion 2: File leaf with name and fixed size
export class File extends FileSystemComponent {
  constructor(name: string, private size: number) {
    super(name);
  }

  getSize() {
    return this.size;
  }

  getName() {
    return this.name;
  }

  print(indent = "") {
    console.log(`${indent}\u{1F4C4} ${this.name} (${this.size}KB)`);
  }
}

// Acceptance Criterion 3: Folder composite with children management
// Acceptance Criterion 4: Recursive getSize() via reduce()
// Acceptance Criterion 5: Recursive print() with indent delegation
export class Folder extends FileSystemComponent {
  private children: FileSystemComponent[] = [];

  add(component: FileSystemComponent) {
    this.children.push(component);
  }

  remove(component: FileSystemComponent) {
    this.children = this.children.filter((c) => c !== component);
  }

  getSize() {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }

  getName() {
    return this.name;
  }

  print(indent = "") {
    console.log(`${indent}\u{1F4C1} ${this.name}/ (${this.getSize()}KB)`);
    this.children.forEach((child) => child.print(indent + "  "));
  }
}
