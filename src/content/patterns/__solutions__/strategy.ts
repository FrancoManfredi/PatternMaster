// Reference solution for Strategy exercise
// This implements all 4 acceptance criteria

// Acceptance Criterion 1: TaxStrategy base class
export class TaxStrategy {
  calculate(amount: number): number {
    return 0; // base — subclasses override
  }
}

// Acceptance Criterion 2: SpainTaxStrategy (21%)
export class SpainTaxStrategy extends TaxStrategy {
  calculate(amount: number): number {
    return amount * 0.21;
  }
}

// Acceptance Criterion 3: USTaxStrategy (7%)
export class USTaxStrategy extends TaxStrategy {
  calculate(amount: number): number {
    return amount * 0.07;
  }
}

// Acceptance Criterion 4: Order with injected strategy
export class Order {
  private strategy: TaxStrategy;

  constructor(strategy: TaxStrategy) {
    this.strategy = strategy;
  }

  calculateTotal(amount: number): number {
    return amount + this.strategy.calculate(amount);
  }
}