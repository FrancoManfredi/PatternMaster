// Reference solution for Abstract Factory exercise
// Implements families of furniture (Victorian, Modern, ArtDeco)

// ─── Product base classes ───

export class Chair {
  render(): string { return ''; }
  getStyle(): string { return ''; }
}

export class Table {
  render(): string { return ''; }
  getStyle(): string { return ''; }
}

export class Sofa {
  render(): string { return ''; }
  getStyle(): string { return ''; }
}

// ─── Victorian family ───

export class VictorianChair extends Chair {
  render(): string { return 'Victorian Chair — ornamental wood'; }
  getStyle(): string { return 'Victorian'; }
}

export class VictorianTable extends Table {
  render(): string { return 'Victorian Table — dark oak'; }
  getStyle(): string { return 'Victorian'; }
}

export class VictorianSofa extends Sofa {
  render(): string { return 'Victorian Sofa — velvet upholstery'; }
  getStyle(): string { return 'Victorian'; }
}

// ─── Modern family ───

export class ModernChair extends Chair {
  render(): string { return 'Modern Chair — minimalist'; }
  getStyle(): string { return 'Modern'; }
}

export class ModernTable extends Table {
  render(): string { return 'Modern Table — clean lines'; }
  getStyle(): string { return 'Modern'; }
}

export class ModernSofa extends Sofa {
  render(): string { return 'Modern Sofa — sleek design'; }
  getStyle(): string { return 'Modern'; }
}

// ─── ArtDeco family ───

export class ArtDecoChair extends Chair {
  render(): string { return 'ArtDeco Chair — geometric'; }
  getStyle(): string { return 'ArtDeco'; }
}

export class ArtDecoTable extends Table {
  render(): string { return 'ArtDeco Table — golden accents'; }
  getStyle(): string { return 'ArtDeco'; }
}

export class ArtDecoSofa extends Sofa {
  render(): string { return 'ArtDeco Sofa — bold shapes'; }
  getStyle(): string { return 'ArtDeco'; }
}

// ─── Factory base class ───

export class FurnitureFactory {
  createChair(): Chair { return new Chair(); }
  createTable(): Table { return new Table(); }
  createSofa(): Sofa { return new Sofa(); }
}

// ─── Concrete factories ───

export class VictorianFactory extends FurnitureFactory {
  createChair(): Chair { return new VictorianChair(); }
  createTable(): Table { return new VictorianTable(); }
  createSofa(): Sofa { return new VictorianSofa(); }
}

export class ModernFactory extends FurnitureFactory {
  createChair(): Chair { return new ModernChair(); }
  createTable(): Table { return new ModernTable(); }
  createSofa(): Sofa { return new ModernSofa(); }
}

export class ArtDecoFactory extends FurnitureFactory {
  createChair(): Chair { return new ArtDecoChair(); }
  createTable(): Table { return new ArtDecoTable(); }
  createSofa(): Sofa { return new ArtDecoSofa(); }
}

// ─── Client function ───

export function furnishRoom(factory: FurnitureFactory): string {
  const chair = factory.createChair();
  const table = factory.createTable();
  const sofa = factory.createSofa();
  return chair.getStyle() + ' ' + table.getStyle() + ' ' + sofa.getStyle();
}
