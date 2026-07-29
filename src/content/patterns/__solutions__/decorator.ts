// Reference solution for Decorator exercise

export class Beverage {
  getCost(): number { return 0; }
  getDescription(): string { return ''; }
}

export class Espresso extends Beverage {
  getCost(): number { return 1.50; }
  getDescription(): string { return 'Espresso'; }
}

export class HouseBlend extends Beverage {
  getCost(): number { return 0.89; }
  getDescription(): string { return 'House Blend Coffee'; }
}

export class BeverageDecorator extends Beverage {
  constructor(protected beverage: Beverage) { super(); }
  getCost(): number { return this.beverage.getCost(); }
  getDescription(): string { return this.beverage.getDescription(); }
}

export class Milk extends BeverageDecorator {
  getCost(): number { return this.beverage.getCost() + 0.20; }
  getDescription(): string { return this.beverage.getDescription() + ', Leche'; }
}

export class Mocha extends BeverageDecorator {
  getCost(): number { return this.beverage.getCost() + 0.30; }
  getDescription(): string { return this.beverage.getDescription() + ', Chocolate'; }
}

export class Whip extends BeverageDecorator {
  getCost(): number { return this.beverage.getCost() + 0.15; }
  getDescription(): string { return this.beverage.getDescription() + ', Crema'; }
}