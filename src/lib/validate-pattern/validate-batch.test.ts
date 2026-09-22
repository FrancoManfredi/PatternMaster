/**
 * Batch Validation Test — validates multiple patterns in one run.
 *
 * Each pattern must pass 100% of Part A + Part B checks before
 * being presented for approval.
 *
 * Run: npx vitest run src/lib/validate-pattern/validate-batch.test.ts
 */

import { describe, it, expect } from "vitest";
import { runPartAWithSolution, runPartBChecks } from "./checks";

import type { PatternContent } from "@/content/index";
import type { GuidedExercise } from "@/lib/guided-mode/types";
import type { PatternTestDef } from "@/lib/test-runner/types";

// ─── Solution Sources (inline for self-validation A6) ─────────────

const SOLUTIONS: Record<string, string> = {
  "factory-method": `
export class Notification {
  send(message: string): void {}
}
export class EmailNotification extends Notification {
  private lastMessage: string = "";
  send(message: string): void { this.lastMessage = message; }
  getLastMessage(): string { return this.lastMessage; }
}
export class SMSNotification extends Notification {
  private lastMessage: string = "";
  send(message: string): void { this.lastMessage = message; }
  getLastMessage(): string { return this.lastMessage; }
}
export class PushNotification extends Notification {
  private lastMessage: string = "";
  send(message: string): void { this.lastMessage = message; }
  getLastMessage(): string { return this.lastMessage; }
}
export class NotificationFactory {
  createNotification(type: string): Notification {
    switch (type.toLowerCase()) {
      case "email": return new EmailNotification();
      case "sms": return new SMSNotification();
      case "push": return new PushNotification();
      default: throw new Error(\`Unknown notification type: \${type}\`);
    }
  }
}
export class NotificationService {
  private factory: NotificationFactory;
  constructor(factory: NotificationFactory) { this.factory = factory; }
  notify(type: string, message: string): void {
    const notification = this.factory.createNotification(type);
    notification.send(message);
  }
}
`,
  "singleton": `
export class ConfigManager {
  private static instance: ConfigManager;
  private config: Record<string, string>;
  private constructor() {
    this.config = { DB_HOST: 'localhost', DB_PORT: '5432', API_KEY: 'secret-123' };
  }
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) { ConfigManager.instance = new ConfigManager(); }
    return ConfigManager.instance;
  }
  get(key: string): string | undefined { return this.config[key]; }
  getAll(): Record<string, string> { return { ...this.config }; }
}
`,
  "decorator": `
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
  protected beverage: Beverage;
  constructor(beverage: Beverage) { super(); this.beverage = beverage; }
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
`,
  "strategy": `
export class TaxStrategy {
  calculate(amount: number): number { return 0; }
}
export class SpainTaxStrategy extends TaxStrategy {
  calculate(amount: number): number { return amount * 0.21; }
}
export class USTaxStrategy extends TaxStrategy {
  calculate(amount: number): number { return amount * 0.07; }
}
export class Order {
  private strategy: TaxStrategy;
  constructor(strategy: TaxStrategy) { this.strategy = strategy; }
  calculateTotal(amount: number): number {
    return amount + this.strategy.calculate(amount);
  }
}
`,
  "builder": `
export class Computer {
  constructor(
    public cpu: string = '',
    public gpu: string = '',
    public ram: string = '',
    public storage: string = '',
  ) {}
}
export class ComputerBuilder {
  protected cpu: string = '';
  protected gpu: string = '';
  protected ram: string = '';
  protected storage: string = '';
  setCPU(cpu: string): this { this.cpu = cpu; return this; }
  setGPU(gpu: string): this { this.gpu = gpu; return this; }
  setRAM(ram: string): this { this.ram = ram; return this; }
  setStorage(storage: string): this { this.storage = storage; return this; }
  build(): Computer { return new Computer(this.cpu, this.gpu, this.ram, this.storage); }
}
export class GamingComputerBuilder extends ComputerBuilder {
  constructor() { super(); this.setCPU('Intel i9-13900K'); this.setGPU('NVIDIA RTX 4090'); this.setRAM('32GB DDR5'); this.setStorage('2TB SSD NVMe'); }
}
export class OfficeComputerBuilder extends ComputerBuilder {
  constructor() { super(); this.setCPU('Intel i5-13400'); this.setGPU('Intel UHD Graphics'); this.setRAM('8GB DDR4'); this.setStorage('512GB SSD SATA'); }
}
export class ComputerDirector {
  static buildGamingPC(builder: ComputerBuilder): Computer { return builder.build(); }
  static buildOfficePC(builder: ComputerBuilder): Computer { return builder.build(); }
}
`,
  "adapter": `
export class StripeAPI {
  charge(params: { amount_in_cents: number; currency_code: string }): { id: string; status: string } {
    return { id: 'ch_test', status: 'succeeded' };
  }
}
export class PayPalAPI {
  processPayment(value: number, coin: string): { confirmation: string; state: string } {
    return { confirmation: 'PP_test', state: 'completed' };
  }
}
export class PaymentProvider {
  pay(amount: number): { id: string; status: string } { return { id: '', status: '' }; }
  refund(transactionId: string): boolean { return false; }
}
export class StripeAdapter extends PaymentProvider {
  private stripe: StripeAPI;
  constructor(stripe: StripeAPI) { super(); this.stripe = stripe; }
  pay(amount: number): { id: string; status: string } {
    return this.stripe.charge({ amount_in_cents: amount * 100, currency_code: 'usd' });
  }
  refund(transactionId: string): boolean { return true; }
}
export class PayPalAdapter extends PaymentProvider {
  private paypal: PayPalAPI;
  constructor(paypal: PayPalAPI) { super(); this.paypal = paypal; }
  pay(amount: number): { id: string; status: string } {
    const result = this.paypal.processPayment(amount, 'USD');
    return { id: result.confirmation, status: result.state };
  }
  refund(transactionId: string): boolean { return true; }
}
export function checkout(provider: PaymentProvider, amount: number): { id: string; status: string } {
  return provider.pay(amount);
}
`,
  "chain-of-responsibility": `
export class ApprovalHandler {
  private next: ApprovalHandler | null = null;
  setNext(handler: ApprovalHandler): ApprovalHandler { this.next = handler; return handler; }
  approve(amount: number): string {
    if (this.next) { return this.next.approve(amount); }
    return 'Nadie pudo aprobar el gasto';
  }
}
export class EmployeeHandler extends ApprovalHandler {
  approve(amount: number): string {
    if (amount <= 100) { return 'Employee aprobó el gasto de $' + amount; }
    return super.approve(amount);
  }
}
export class ManagerHandler extends ApprovalHandler {
  approve(amount: number): string {
    if (amount <= 1000) { return 'Manager aprobó el gasto de $' + amount; }
    return super.approve(amount);
  }
}
export class DirectorHandler extends ApprovalHandler {
  approve(amount: number): string {
    return 'Director aprobó el gasto de $' + amount;
  }
}
`,
  "template-method": `
export class ReportGenerator {
  generate(): string {
    const data = this.getData();
    const processed = this.processData(data);
    const formatted = this.formatOutput(processed);
    return this.exportReport(formatted);
  }
  protected getData(): string[] { return ['item1', 'item2', 'item3']; }
  protected processData(data: string[]): string[] { return data; }
  protected formatOutput(data: string[]): string { return data.join('\\n'); }
  protected exportReport(formatted: string): string { return formatted; }
}
export class PDFReport extends ReportGenerator {
  protected processData(data: string[]): string[] { return data.map(d => d.toUpperCase()); }
  protected formatOutput(data: string[]): string { return '[PDF] ' + data.join(' | '); }
  protected exportReport(formatted: string): string { return 'PDF exported: ' + formatted; }
}
export class HTMLReport extends ReportGenerator {
  protected processData(data: string[]): string[] { return data.map(d => '<li>' + d + '</li>'); }
  protected formatOutput(data: string[]): string { return '<ul>' + data.join('') + '</ul>'; }
  protected exportReport(formatted: string): string { return 'HTML exported: ' + formatted; }
}
export class CSVReport extends ReportGenerator {
  protected processData(data: string[]): string[] { return data; }
  protected formatOutput(data: string[]): string { return 'name\\n' + data.join('\\n'); }
  protected exportReport(formatted: string): string { return 'CSV exported: ' + formatted; }
}
`,
  "abstract-factory": `
export class Chair { render(): string { return ''; } getStyle(): string { return ''; } }
export class Table { render(): string { return ''; } getStyle(): string { return ''; } }
export class Sofa { render(): string { return ''; } getStyle(): string { return ''; } }
export class VictorianChair extends Chair { render(): string { return 'Victorian Chair'; } getStyle(): string { return 'Victorian'; } }
export class VictorianTable extends Table { render(): string { return 'Victorian Table'; } getStyle(): string { return 'Victorian'; } }
export class VictorianSofa extends Sofa { render(): string { return 'Victorian Sofa'; } getStyle(): string { return 'Victorian'; } }
export class ModernChair extends Chair { render(): string { return 'Modern Chair'; } getStyle(): string { return 'Modern'; } }
export class ModernTable extends Table { render(): string { return 'Modern Table'; } getStyle(): string { return 'Modern'; } }
export class ModernSofa extends Sofa { render(): string { return 'Modern Sofa'; } getStyle(): string { return 'Modern'; } }
export class ArtDecoChair extends Chair { render(): string { return 'ArtDeco Chair'; } getStyle(): string { return 'ArtDeco'; } }
export class ArtDecoTable extends Table { render(): string { return 'ArtDeco Table'; } getStyle(): string { return 'ArtDeco'; } }
export class ArtDecoSofa extends Sofa { render(): string { return 'ArtDeco Sofa'; } getStyle(): string { return 'ArtDeco'; } }
export class FurnitureFactory {
  createChair(): Chair { return new Chair(); }
  createTable(): Table { return new Table(); }
  createSofa(): Sofa { return new Sofa(); }
}
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
export function furnishRoom(factory: FurnitureFactory): string {
  const chair = factory.createChair(); const table = factory.createTable(); const sofa = factory.createSofa();
  return chair.getStyle() + ' ' + table.getStyle() + ' ' + sofa.getStyle();
}
`,
  "facade": `
export class Amplifier { private _on: boolean = false; on(): void { this._on = true; } off(): void { this._on = false; } setVolume(v: number): void {} isOn(): boolean { return this._on; } }
export class Projector { private _on: boolean = false; on(): void { this._on = true; } off(): void { this._on = false; } setInput(s: string): void {} setWideScreen(): void {} isOn(): boolean { return this._on; } }
export class Screen { private _down: boolean = false; up(): void { this._down = false; } down(): void { this._down = true; } isDown(): boolean { return this._down; } }
export class SoundSystem { private _on: boolean = false; on(): void { this._on = true; } off(): void { this._on = false; } setSurround(): void {} isOn(): boolean { return this._on; } }
export class HomeTheaterFacade {
  private amp = new Amplifier(); private proj = new Projector();
  private screen = new Screen(); private sound = new SoundSystem();
  watchMovie(movie: string): void { this.amp.on(); this.amp.setVolume(5); this.proj.on(); this.proj.setInput('HDMI'); this.proj.setWideScreen(); this.screen.down(); this.sound.on(); this.sound.setSurround(); }
  endMovie(): void { this.sound.off(); this.screen.up(); this.proj.off(); this.amp.off(); }
}
`,
  "command": `
export class EditorCommand {
  execute(editor: any): void {}
  undo(editor: any): void {}
}
export class InsertCommand extends EditorCommand {
  private text: string; private pos: number;
  constructor(pos: number, text: string) { super(); this.pos = pos; this.text = text; }
  execute(editor: any): void {
    editor._content = editor._content.slice(0, this.pos) + this.text + editor._content.slice(this.pos);
  }
  undo(editor: any): void {
    editor._content = editor._content.slice(0, this.pos) + editor._content.slice(this.pos + this.text.length);
  }
}
export class DeleteCommand extends EditorCommand {
  private pos: number; private length: number; private deleted: string = '';
  constructor(pos: number, length: number) { super(); this.pos = pos; this.length = length; }
  execute(editor: any): void {
    this.deleted = editor._content.slice(this.pos, this.pos + this.length);
    editor._content = editor._content.slice(0, this.pos) + editor._content.slice(this.pos + this.length);
  }
  undo(editor: any): void {
    editor._content = editor._content.slice(0, this.pos) + this.deleted + editor._content.slice(this.pos);
  }
}
export class TextEditor {
  _content: string = '';
  private history: EditorCommand[] = [];
  private redoStack: EditorCommand[] = [];
  execute(cmd: EditorCommand): void { cmd.execute(this); this.history.push(cmd); this.redoStack = []; }
  undo(): void { const cmd = this.history.pop(); if (cmd) { cmd.undo(this); this.redoStack.push(cmd); } }
  redo(): void { const cmd = this.redoStack.pop(); if (cmd) { cmd.execute(this); this.history.push(cmd); } }
  getContent(): string { return this._content; }
}
`,
  "observer": `
export class StockObserver {
  update(stock: string, price: number): void {}
}
export class StockTicker {
  private observers: StockObserver[] = [];
  private stocks: Record<string, number> = {};
  subscribe(obs: StockObserver): void { this.observers.push(obs); }
  unsubscribe(obs: StockObserver): void { this.observers = this.observers.filter(o => o !== obs); }
  setPrice(stock: string, price: number): void { this.stocks[stock] = price; this.notify(stock, price); }
  private notify(stock: string, price: number): void { for (const o of this.observers) { o.update(stock, price); } }
  getObservers(): StockObserver[] { return [...this.observers]; }
}
export class Buyer extends StockObserver {
  private threshold: number;
  lastAction: string = '';
  constructor(threshold: number) { super(); this.threshold = threshold; }
  update(stock: string, price: number): void { if (price <= this.threshold) { this.lastAction = 'buying'; } }
}
export class Seller extends StockObserver {
  private threshold: number;
  lastAction: string = '';
  constructor(threshold: number) { super(); this.threshold = threshold; }
  update(stock: string, price: number): void { if (price >= this.threshold) { this.lastAction = 'selling'; } }
}
`,
  "state": `
export class DocumentState {
  submitForReview(doc: any): string { return 'Action not allowed in current state'; }
  approve(doc: any): string { return 'Action not allowed in current state'; }
  reject(doc: any): string { return 'Action not allowed in current state'; }
  archive(doc: any): string { return 'Archived'; }
}
export class DraftState extends DocumentState {
  submitForReview(doc: any): string { doc.setState(new ReviewState()); return 'Document submitted for review'; }
}
export class ReviewState extends DocumentState {
  approve(doc: any): string { doc.setState(new PublishedState()); return 'Document approved and published'; }
  reject(doc: any): string { doc.setState(new DraftState()); return 'Document rejected, back to draft'; }
}
export class PublishedState extends DocumentState {
  approve(doc: any): string { return 'Document is already published'; }
  reject(doc: any): string { return 'Cannot reject a published document'; }
}
export class Document {
  private state: DocumentState;
  constructor(title: string) { this.state = new DraftState(); }
  setState(state: DocumentState): void { this.state = state; }
  getStateName(): string { return this.state.constructor.name; }
  submitForReview(): string { return this.state.submitForReview(this); }
  approve(): string { return this.state.approve(this); }
  reject(): string { return this.state.reject(this); }
  archive(): string { return this.state.archive(this); }
}
`,
};

// ─── Batch 1 patterns ─────────────────────────────────────────────

interface BatchPattern {
  slug: string;
  solutionSource: string;
  /** Optional: if set, reads solution from disk instead of using solutionSource */
  solutionPath?: string;
  loadTestDef: () => Promise<PatternTestDef>;
  loadGuided: () => Promise<GuidedExercise>;
  loadContent: () => Promise<PatternContent>;
}

function readSolution(path: string): string {
  const fs = require("fs");
  return fs.readFileSync(path, "utf-8");
}

const BATCH_1: BatchPattern[] = [
  {
    slug: "factory-method",
    solutionSource: SOLUTIONS["factory-method"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/factory-method")).factoryMethodTestDef,
    loadGuided: async () => (await import("@/content/guided/factory-method")).factoryMethodGuided,
    loadContent: async () => (await import("@/content/patterns/factory-method.json")) as unknown as PatternContent,
  },
  {
    slug: "singleton",
    solutionSource: SOLUTIONS["singleton"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/singleton")).singletonTestDef,
    loadGuided: async () => (await import("@/content/guided/singleton")).singletonGuided,
    loadContent: async () => (await import("@/content/patterns/singleton.json")) as unknown as PatternContent,
  },
  {
    slug: "decorator",
    solutionSource: SOLUTIONS["decorator"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/decorator")).decoratorTestDef,
    loadGuided: async () => (await import("@/content/guided/decorator")).decoratorGuided,
    loadContent: async () => (await import("@/content/patterns/decorator.json")) as unknown as PatternContent,
  },
  {
    slug: "strategy",
    solutionSource: SOLUTIONS["strategy"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/strategy")).strategyTestDef,
    loadGuided: async () => (await import("@/content/guided/strategy")).strategyGuided,
    loadContent: async () => (await import("@/content/patterns/strategy.json")) as unknown as PatternContent,
  },
  {
    slug: "builder",
    solutionSource: SOLUTIONS["builder"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/builder")).builderTestDef,
    loadGuided: async () => (await import("@/content/guided/builder")).builderGuided,
    loadContent: async () => (await import("@/content/patterns/builder.json")) as unknown as PatternContent,
  },
  {
    slug: "adapter",
    solutionSource: SOLUTIONS["adapter"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/adapter")).adapterTestDef,
    loadGuided: async () => (await import("@/content/guided/adapter")).adapterGuided,
    loadContent: async () => (await import("@/content/patterns/adapter.json")) as unknown as PatternContent,
  },
  {
    slug: "chain-of-responsibility",
    solutionSource: SOLUTIONS["chain-of-responsibility"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/chain-of-responsibility")).chainOfResponsibilityTestDef,
    loadGuided: async () => (await import("@/content/guided/chain-of-responsibility")).chainOfResponsibilityGuided,
    loadContent: async () => (await import("@/content/patterns/chain-of-responsibility.json")) as unknown as PatternContent,
  },
  {
    slug: "template-method",
    solutionSource: SOLUTIONS["template-method"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/template-method")).templateMethodTestDef,
    loadGuided: async () => (await import("@/content/guided/template-method")).templateMethodGuided,
    loadContent: async () => (await import("@/content/patterns/template-method.json")) as unknown as PatternContent,
  },
  {
    slug: "abstract-factory",
    solutionSource: SOLUTIONS["abstract-factory"],
    loadTestDef: async () => (await import("@/lib/test-runner/tests/abstract-factory")).abstractFactoryTestDef,
    loadGuided: async () => (await import("@/content/guided/abstract-factory")).abstractFactoryGuided,
    loadContent: async () => (await import("@/content/patterns/abstract-factory.json")) as unknown as PatternContent,
  },
  {
    slug: "facade",
    solutionSource: SOLUTIONS["facade"],
    solutionPath: "src/content/patterns/__solutions__/facade.ts",
    loadTestDef: async () => (await import("@/lib/test-runner/tests/facade")).facadeTestDef,
    loadGuided: async () => (await import("@/content/guided/facade")).facadeGuided,
    loadContent: async () => (await import("@/content/patterns/facade.json")) as unknown as PatternContent,
  },
  {
    slug: "command",
    solutionSource: SOLUTIONS["command"],
    solutionPath: "src/content/patterns/__solutions__/command.ts",
    loadTestDef: async () => (await import("@/lib/test-runner/tests/command")).commandTestDef,
    loadGuided: async () => (await import("@/content/guided/command")).commandGuided,
    loadContent: async () => (await import("@/content/patterns/command.json")) as unknown as PatternContent,
  },
  {
    slug: "observer",
    solutionSource: SOLUTIONS["observer"],
    solutionPath: "src/content/patterns/__solutions__/observer.ts",
    loadTestDef: async () => (await import("@/lib/test-runner/tests/observer")).observerTestDef,
    loadGuided: async () => (await import("@/content/guided/observer")).observerGuided,
    loadContent: async () => (await import("@/content/patterns/observer.json")) as unknown as PatternContent,
  },
  {
    slug: "state",
    solutionSource: SOLUTIONS["state"],
    solutionPath: "src/content/patterns/__solutions__/state.ts",
    loadTestDef: async () => (await import("@/lib/test-runner/tests/state")).stateTestDef,
    loadGuided: async () => (await import("@/content/guided/state")).stateGuided,
    loadContent: async () => (await import("@/content/patterns/state.json")) as unknown as PatternContent,
  },
];

// ─── Per-pattern test factory ─────────────────────────────────────

function createPatternTests(batch: BatchPattern[]) {
  // Part A tests
  describe("Part A — Free Mode (Self-validation)", () => {
    for (const entry of batch) {
      it(`${entry.slug}: A6 solution passes self-validation`, async () => {
        const testDef = await entry.loadTestDef();
        expect(testDef).toBeDefined();
        const solutionCode = entry.solutionPath ? readSolution(entry.solutionPath) : entry.solutionSource;
        const results = runPartAWithSolution(testDef, solutionCode);
        const selfVal = results.find((r) => r.check.startsWith("A6:"));
        expect(selfVal?.passed, selfVal?.detail ?? "A6 not found").toBe(true);
      });

      it(`${entry.slug}: A2 all checks are valid JS`, async () => {
        const testDef = await entry.loadTestDef();
        const solutionCode = entry.solutionPath ? readSolution(entry.solutionPath) : entry.solutionSource;
        const results = runPartAWithSolution(testDef, solutionCode);
        const syntaxErrors = results.filter(
          (r) => r.check.startsWith("A2: Criterion") && !r.passed
        );
        expect(syntaxErrors, syntaxErrors.map((s) => s.detail).join("; ")).toHaveLength(0);
      });

      it(`${entry.slug}: A5 no over-specified criteria`, async () => {
        const testDef = await entry.loadTestDef();
        const solutionCode = entry.solutionPath ? readSolution(entry.solutionPath) : entry.solutionSource;
        const results = runPartAWithSolution(testDef, solutionCode);
        const overSpec = results.filter(
          (r) => r.check.startsWith("A5:") && !r.passed
        );
        expect(overSpec, overSpec.map((s) => s.detail).join("; ")).toHaveLength(0);
      });
    }
  });

  // Part B tests
  describe("Part B — Guided Mode", () => {
    for (const entry of batch) {
      it(`${entry.slug}: B1-B7 all Part B checks pass`, async () => {
        const [guided, content] = await Promise.all([
          entry.loadGuided(),
          entry.loadContent(),
        ]);
        expect(guided).toBeDefined();

        const results = runPartBChecks(guided, content);
        const failures = results.filter((r) => !r.passed);

        if (failures.length > 0) {
          console.log(`\n  Part B failures for ${entry.slug}:`);
          for (const f of failures) {
            console.log(`    ${f.check}: ${f.detail}`);
          }
        }

        expect(failures, `${entry.slug}: ${failures.map((f) => f.check).join("; ")}`).toHaveLength(0);
      });
    }
  });
}

// ─── Infrastructure tests ─────────────────────────────────────────

describe("Infrastructure", () => {
  it("A1: Worker source uses return-wrapping", async () => {
    const { checkReturnWrapping } = await import("./checks");
    const r = checkReturnWrapping();
    expect(r.passed, r.detail).toBe(true);
  });

  it("A3: stripTS only uses ['typescript'] transform", async () => {
    const { checkStripTSNoImports, checkStripTSExportClassEndToEnd } = await import("./checks");
    const r1 = checkStripTSNoImports();
    expect(r1.passed, r1.detail).toBe(true);
    const r2 = checkStripTSExportClassEndToEnd();
    expect(r2.passed, r2.detail).toBe(true);
  });

  it("A7: Worker blocks network APIs", async () => {
    const { checkRunnerConstants } = await import("./checks");
    const results = checkRunnerConstants();
    const networkCheck = results.find((r) => r.check.includes("blocks network"));
    expect(networkCheck?.passed).toBe(true);
  });
});

// ─── Run batch tests ──────────────────────────────────────────────

createPatternTests(BATCH_1);

// ─── Summary report ───────────────────────────────────────────────

describe("Batch 1 — Summary Report", () => {
  it("generates full report (all checks pass)", async () => {
    console.log("\n═══════════════════════════════════════════════════");
    console.log("  BATCH 1 — VALIDATION REPORT");
    console.log("═══════════════════════════════════════════════════");
    console.log(`  Patterns: ${BATCH_1.map((p) => p.slug).join(", ")}\n`);

    let totalA = 0;
    let passedA = 0;
    let totalB = 0;
    let passedB = 0;

    for (const entry of BATCH_1) {
      const [testDef, guided, content] = await Promise.all([
        entry.loadTestDef(),
        entry.loadGuided(),
        entry.loadContent(),
      ]);

      // Part A
      const solutionCode = entry.solutionPath ? readSolution(entry.solutionPath) : entry.solutionSource;
      const aResults = runPartAWithSolution(testDef, solutionCode);
      const aPassed = aResults.filter((r) => r.passed).length;
      const aTotal = aResults.length;
      passedA += aPassed;
      totalA += aTotal;

      // Part B
      const bResults = runPartBChecks(guided, content);
      const bPassed = bResults.filter((r) => r.passed).length;
      const bTotal = bResults.length;
      passedB += bPassed;
      totalB += bTotal;

      const aStatus = aPassed === aTotal ? "✅" : "❌";
      const bStatus = bPassed === bTotal ? "✅" : "❌";

      console.log(`  ${entry.slug}`);
      console.log(`    Part A: ${aStatus} ${aPassed}/${aTotal}`);
      if (aPassed < aTotal) {
        for (const r of aResults.filter((r) => !r.passed)) {
          console.log(`      FAIL: ${r.check}: ${r.detail}`);
        }
      }
      console.log(`    Part B: ${bStatus} ${bPassed}/${bTotal}`);
      if (bPassed < bTotal) {
        for (const r of bResults.filter((r) => !r.passed)) {
          console.log(`      FAIL: ${r.check}: ${r.detail}`);
        }
      }
    }

    console.log(`\n  Total Part A: ${passedA}/${totalA} passed`);
    console.log(`  Total Part B: ${passedB}/${totalB} passed`);
    console.log(`  Combined:     ${passedA + passedB}/${totalA + totalB} passed`);
    console.log("═══════════════════════════════════════════════════\n");

    expect(passedA).toBe(totalA);
    expect(passedB).toBe(totalB);
  });
});
