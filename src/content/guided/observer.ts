import { buildGuidedExercise } from "@/lib/guided-mode/build";
import type { GuidedStepInput } from "@/lib/guided-mode/build";

const steps: GuidedStepInput[] = [
  {
    index: 0,
    title: "El problema: notificaciones hardcodeadas",
    explanation: `Imaginá que tenés un 'StockTicker' que muestra precios de acciones. Cuando el precio cambia, querés notificar a distintos inversores: uno quiere comprar si el precio baja, otro quiere vender si sube, y otro solo quiere registrar los cambios. El problema: si hardcodeás las notificaciones directamente en 'StockTicker', cada vez que querés agregar un nuevo tipo de inversor, tenés que modificar la clase.\n\n**El patrón Observer** resuelve esto. En vez de que 'StockTicker' conozca a cada inversor, mantiene una lista de observers y los notifica automáticamente cuando el precio cambia. Cada observer decide qué hacer con la notificación.\n\n**En este ejercicio**: vas a refactorizar 'StockTicker' para usar Observer. Vas a crear 'StockObserver' (la clase base), 'StockTicker' (el subject con subscribe/unsubscribe), 'Buyer' (compra si el precio baja) y 'Seller' (vende si el precio sube).`,
    code: {
      typescript: `// ❌ Sin Observer — notificaciones hardcodeadas
class StockTicker {
  private price: number = 0;
  private logger: Logger;
  private alertSystem: AlertSystem;

  constructor(logger: Logger, alert: AlertSystem) {
    this.logger = logger;
    this.alertSystem = alert;
  }

  setPrice(price: number) {
    this.price = price;
    this.logger.log(price);
    this.alertSystem.check(price);
    // Agregar un nuevo observer requiere modificar esta clase
  }
}

// ✅ Con Observer — suscripción dinámica
// ticker.subscribe(buyer);
// ticker.subscribe(seller);
// ticker.setPrice('AAPL', 90); // ambos reciben notificación`,
      javascript: `// ❌ Sin Observer — notificaciones hardcodeadas
class StockTicker {
  constructor(logger, alert) {
    this.price = 0;
    this.logger = logger;
    this.alertSystem = alert;
  }

  setPrice(price) {
    this.price = price;
    this.logger.log(price);
    this.alertSystem.check(price);
    // Agregar un nuevo observer requiere modificar esta clase
  }
}

// ✅ Con Observer — suscripción dinámica
// ticker.subscribe(buyer);
// ticker.subscribe(seller);
// ticker.setPrice('AAPL', 90); // ambos reciben notificación`,
    },
  },
  {
    index: 1,
    title: "Creá StockObserver base y StockTicker con suscripciones",
    explanation: `Primero la clase base 'StockObserver' con el método 'update(stock, price)'. Esta es la abstracción — cualquier observer que quiera reaccionar a cambios de precio extiende esta clase e implementa 'update()'.\n\nDespués 'StockTicker', el **subject**. Mantiene una lista de observers y ofrece tres métodos: 'subscribe(observer)' agrega un observer a la lista, 'unsubscribe(observer)' lo quita, y 'setPrice(stock, price)' actualiza el precio y notifica a todos los observers llamando a 'update()' en cada uno.\n\n**Clave**: 'StockTicker' no sabe qué tipo de observers tiene — solo conoce la interfaz 'StockObserver'. Puede haber Buyers, Sellers, Loggers, lo que sea. El subject notifica, cada observer decide qué hacer.`,
    code: {
      typescript: `class StockObserver {
  update(stock: string, price: number) {
    // Base — los concretos sobrescriben
  }
}

class StockTicker {
  private observers: StockObserver[] = [];
  private prices: Map<string, number> = new Map();

  subscribe(observer: StockObserver) {
    this.observers.push(observer);
  }

  unsubscribe(observer: StockObserver) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notifyObservers(stock: string, price: number) {
    this.observers.forEach(observer => observer.update(stock, price));
  }

  setPrice(stock: string, price: number) {
    this.prices.set(stock, price);
    this.notifyObservers(stock, price);
  }

  getPrice(stock: string) {
    return this.prices.get(stock);
  }
}`,
      javascript: `class StockObserver {
  update(stock, price) {
    // Base — los concretos sobrescriben
  }
}

class StockTicker {
  constructor() {
    this.observers = [];
    this.prices = new Map();
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }

  notifyObservers(stock, price) {
    this.observers.forEach(observer => observer.update(stock, price));
  }

  setPrice(stock, price) {
    this.prices.set(stock, price);
    this.notifyObservers(stock, price);
  }

  getPrice(stock) {
    return this.prices.get(stock);
  }
}`,
    },
  },
  {
    index: 2,
    title: "Implementá Buyer — compra si el precio baja del umbral",
    explanation: `Ahora el primer observer concreto: 'Buyer'. Un comprador tiene un nombre y un umbral de precio. Cuando recibe una notificación de precio ('update()'), chequea si el precio es menor o igual a su umbral — si es así, registra que está comprando.\n\n'Buyer' extiende 'StockObserver' e implementa 'update(stock, price)' con su lógica de decisión. Almacena la última acción en 'lastAction' para que el test pueda inspeccionar qué hizo.\n\n**Patrón Observer en acción**: 'Buyer' no sabe nada sobre 'StockTicker'. No sabe cuándo se actualizan los precios, ni cuántos otros observers hay. Solo reacciona cuando recibe la notificación. Esta independencia es el corazón del patrón.`,
    code: {
      typescript: `class StockObserver {
  update(stock: string, price: number) {}
}

class StockTicker {
  private observers: StockObserver[] = [];
  private prices: Map<string, number> = new Map();

  subscribe(observer: StockObserver) { this.observers.push(observer); }
  unsubscribe(observer: StockObserver) {
    this.observers = this.observers.filter(o => o !== observer);
  }
  notifyObservers(stock: string, price: number) {
    this.observers.forEach(observer => observer.update(stock, price));
  }
  setPrice(stock: string, price: number) {
    this.prices.set(stock, price);
    this.notifyObservers(stock, price);
  }
  getPrice(stock: string) { return this.prices.get(stock); }
}

class Buyer extends StockObserver {
  private name: string;
  private threshold: number;
  private lastAction: string = "";

  constructor(name: string, threshold: number) {
    super();
    this.name = name;
    this.threshold = threshold;
  }

  update(stock: string, price: number) {
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
}`,
      javascript: `class StockObserver {
  update(stock, price) {}
}

class StockTicker {
  constructor() {
    this.observers = [];
    this.prices = new Map();
  }

  subscribe(observer) { this.observers.push(observer); }
  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }
  notifyObservers(stock, price) {
    this.observers.forEach(observer => observer.update(stock, price));
  }
  setPrice(stock, price) {
    this.prices.set(stock, price);
    this.notifyObservers(stock, price);
  }
  getPrice(stock) { return this.prices.get(stock); }
}

class Buyer extends StockObserver {
  constructor(name, threshold) {
    super();
    this.name = name;
    this.threshold = threshold;
    this.lastAction = "";
  }

  update(stock, price) {
    if (price <= this.threshold) {
      this.lastAction = "buying";
    }
  }

  getLastAction() {
    return this.lastAction;
  }

  getName() {
    return this.name;
  }
}`,
    },
  },
  {
    index: 3,
    title: "Implementá Seller — vende si el precio sube del umbral",
    explanation: `El segundo observer concreto: 'Seller'. Un vendedor tiene un nombre y un umbral de precio. Cuando recibe una notificación, verifica si el precio es mayor o igual a su umbral — si es así, registra que está vendiendo.\n\nMisma estructura que 'Buyer', pero con la lógica inversa: 'Buyer' compra cuando el precio baja, 'Seller' vende cuando el precio sube. Ambos extienden 'StockObserver' e implementan 'update()' con su propia estrategia.\n\n**El resultado final**: 'StockTicker' notifica a todos los observers cuando un precio cambia. 'Buyer' y 'Seller' reaccionan independientemente según sus umbrales. Podés agregar nuevos tipos de observer (Logger, Analytics, AlertSystem) sin tocar 'StockTicker' ni los observers existentes. Eso es Observer: desacoplamiento total entre el emisor y los receptores.`,
    code: {
      typescript: `class StockObserver {
  update(stock: string, price: number) {}
}

class StockTicker {
  private observers: StockObserver[] = [];
  private prices: Map<string, number> = new Map();

  subscribe(observer: StockObserver) { this.observers.push(observer); }
  unsubscribe(observer: StockObserver) {
    this.observers = this.observers.filter(o => o !== observer);
  }
  notifyObservers(stock: string, price: number) {
    this.observers.forEach(observer => observer.update(stock, price));
  }
  setPrice(stock: string, price: number) {
    this.prices.set(stock, price);
    this.notifyObservers(stock, price);
  }
  getPrice(stock: string) { return this.prices.get(stock); }
}

class Buyer extends StockObserver {
  private name: string;
  private threshold: number;
  private lastAction: string = "";

  constructor(name: string, threshold: number) {
    super();
    this.name = name;
    this.threshold = threshold;
  }

  update(stock: string, price: number) {
    if (price <= this.threshold) {
      this.lastAction = "buying";
    }
  }

  getLastAction(): string { return this.lastAction; }
  getName(): string { return this.name; }
}

class Seller extends StockObserver {
  private name: string;
  private threshold: number;
  private lastAction: string = "";

  constructor(name: string, threshold: number) {
    super();
    this.name = name;
    this.threshold = threshold;
  }

  update(stock: string, price: number) {
    if (price >= this.threshold) {
      this.lastAction = "selling";
    }
  }

  getLastAction(): string { return this.lastAction; }
  getName(): string { return this.name; }
}

// Uso:
const ticker = new StockTicker();
const buyer = new Buyer("Alice", 100);
const seller = new Seller("Bob", 150);

ticker.subscribe(buyer);
ticker.subscribe(seller);

ticker.setPrice("AAPL", 90);
// Buyer Alice: buying (precio 90 <= umbral 100)
// Seller Bob: no reacciona (precio 90 < umbral 150)

ticker.setPrice("AAPL", 160);
// Seller Bob: selling (precio 160 >= umbral 150)`,
      javascript: `class StockObserver {
  update(stock, price) {}
}

class StockTicker {
  constructor() {
    this.observers = [];
    this.prices = new Map();
  }

  subscribe(observer) { this.observers.push(observer); }
  unsubscribe(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }
  notifyObservers(stock, price) {
    this.observers.forEach(observer => observer.update(stock, price));
  }
  setPrice(stock, price) {
    this.prices.set(stock, price);
    this.notifyObservers(stock, price);
  }
  getPrice(stock) { return this.prices.get(stock); }
}

class Buyer extends StockObserver {
  constructor(name, threshold) {
    super();
    this.name = name;
    this.threshold = threshold;
    this.lastAction = "";
  }

  update(stock, price) {
    if (price <= this.threshold) {
      this.lastAction = "buying";
    }
  }

  getLastAction() { return this.lastAction; }
  getName() { return this.name; }
}

class Seller extends StockObserver {
  constructor(name, threshold) {
    super();
    this.name = name;
    this.threshold = threshold;
    this.lastAction = "";
  }

  update(stock, price) {
    if (price >= this.threshold) {
      this.lastAction = "selling";
    }
  }

  getLastAction() { return this.lastAction; }
  getName() { return this.name; }
}

// Uso:
const ticker = new StockTicker();
const buyer = new Buyer("Alice", 100);
const seller = new Seller("Bob", 150);

ticker.subscribe(buyer);
ticker.subscribe(seller);

ticker.setPrice("AAPL", 90);
// Buyer Alice: buying (precio 90 <= umbral 100)
// Seller Bob: no reacciona (precio 90 < umbral 150)

ticker.setPrice("AAPL", 160);
// Seller Bob: selling (precio 160 >= umbral 150)`,
    },
  },
];

export const observerGuided = buildGuidedExercise(
  "observer",
  "Observer — Modo Guiado",
  steps
);
