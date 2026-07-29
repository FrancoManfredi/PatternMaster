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
};

// ─── Batch 1 patterns ─────────────────────────────────────────────

interface BatchPattern {
  slug: string;
  solutionSource: string;
  loadTestDef: () => Promise<PatternTestDef>;
  loadGuided: () => Promise<GuidedExercise>;
  loadContent: () => Promise<PatternContent>;
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
];

// ─── Per-pattern test factory ─────────────────────────────────────

function createPatternTests(batch: BatchPattern[]) {
  // Part A tests
  describe("Part A — Free Mode (Self-validation)", () => {
    for (const entry of batch) {
      it(`${entry.slug}: A6 solution passes self-validation`, async () => {
        const testDef = await entry.loadTestDef();
        expect(testDef).toBeDefined();
        const results = runPartAWithSolution(testDef, entry.solutionSource);
        const selfVal = results.find((r) => r.check.startsWith("A6:"));
        expect(selfVal?.passed, selfVal?.detail ?? "A6 not found").toBe(true);
      });

      it(`${entry.slug}: A2 all checks are valid JS`, async () => {
        const testDef = await entry.loadTestDef();
        const results = runPartAWithSolution(testDef, entry.solutionSource);
        const syntaxErrors = results.filter(
          (r) => r.check.startsWith("A2: Criterion") && !r.passed
        );
        expect(syntaxErrors, syntaxErrors.map((s) => s.detail).join("; ")).toHaveLength(0);
      });

      it(`${entry.slug}: A5 no over-specified criteria`, async () => {
        const testDef = await entry.loadTestDef();
        const results = runPartAWithSolution(testDef, entry.solutionSource);
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
      const aResults = runPartAWithSolution(testDef, entry.solutionSource);
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
