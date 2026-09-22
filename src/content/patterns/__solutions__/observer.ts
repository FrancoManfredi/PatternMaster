// Reference solution for Observer exercise
// This implements all 5 acceptance criteria

// Acceptance Criterion 1: StockObserver base class with update(stock, price)
export class StockObserver {
  update(stock: string, price: number): void {
    // Base implementation — concrete subclasses override this
  }
}

// Acceptance Criterion 2: StockTicker as subject with subscribe/unsubscribe/notifyObservers
export class StockTicker {
  private observers: StockObserver[] = [];
  private prices: Map<string, number> = new Map();

  subscribe(observer: StockObserver): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: StockObserver): void {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notifyObservers(stock: string, price: number): void {
    this.observers.forEach(observer => observer.update(stock, price));
  }

  setPrice(stock: string, price: number): void {
    this.prices.set(stock, price);
    this.notifyObservers(stock, price);
  }

  getPrice(stock: string): number | undefined {
    return this.prices.get(stock);
  }
}

// Acceptance Criterion 3: Buyer — buys when price drops below threshold
export class Buyer extends StockObserver {
  private name: string;
  private threshold: number;
  private lastAction: string = "";

  constructor(name: string, threshold: number) {
    super();
    this.name = name;
    this.threshold = threshold;
  }

  update(stock: string, price: number): void {
    if (price <= this.threshold) {
      this.lastAction = "buying";
    }
  }

  getLastAction(): string {
    return this.lastAction;
  }

  getName(): string {
    return this.name;
  }
}

// Acceptance Criterion 4: Seller — sells when price rises above threshold
export class Seller extends StockObserver {
  private name: string;
  private threshold: number;
  private lastAction: string = "";

  constructor(name: string, threshold: number) {
    super();
    this.name = name;
    this.threshold = threshold;
  }

  update(stock: string, price: number): void {
    if (price >= this.threshold) {
      this.lastAction = "selling";
    }
  }

  getLastAction(): string {
    return this.lastAction;
  }

  getName(): string {
    return this.name;
  }
}
