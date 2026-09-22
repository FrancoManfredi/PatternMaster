# Exploration: Automated tests for coding exercises (Factory Method pilot)

> Pilot pattern: `factory-method.json`
> Working dir: `C:\Users\Franco\Desktop\PatternMaster\patternmaster`
> Note: project is not a git repo (per env). The exploration artifact lives at `sdd/explore/coding-exercise-tests/exploration.md`.

## Current State

**How the exercise is delivered today**

The Factory Method exercise is pure content. It lives in `src/content/patterns/factory-method.json` under the `exercise` key and the runtime sees it as a `string` (the user types code into a `<textarea>` inside `src/components/patterns/ExerciseSection.tsx`). The `ExerciseSection` component (lines 44–94) only does three things with that string:

1. Holds it in `useState<string>`.
2. On "Ejecutar Tests" click, POSTs it to `/api/correction` along with `patternSlug`, `exerciseId = "${slug}-exercise"`, and `language`.
3. Receives back a `CorrectionResult` (Zod-validated) and shows a `FeedbackPanel`. If `totalScore >= 5` it calls `markCompleted`.

There is **no code execution** anywhere. The submitted string is never compiled, never transpiled, never run. The string flows from textarea → fetch → `route.ts` → `mockCorrect()` (regex-based heuristic) **or** `buildCorrectionPrompt()` + Claude API → `CorrectionResult`. So today "tests" means "evaluation of the submitted source as a blob of text", not runtime behavior assertions.

**Existing test infrastructure**

- `vitest.config.ts` — `jsdom` env, `setupFiles: ./src/test/setup.ts`, path alias `@ → ./src`, React plugin on.
- `src/test/setup.ts` — single line: `import "@testing-library/jest-dom/vitest"`.
- `package.json` scripts: `test` → `vitest run`, `test:watch` → `vitest`. No coverage config in the JSON.
- 7 existing test files, all use `describe / it / expect from "vitest"`:
  - `src/lib/__tests__/mock-corrector.test.ts` (47 lines, 6 tests — string-shape tests of the corrector)
  - `src/lib/__tests__/schemas.test.ts` (74 lines, Zod round-trip tests)
  - `src/lib/__tests__/storage.test.ts` (59 lines, mocks `localStorage`)
  - `src/lib/__tests__/prompt.test.ts`
  - `src/components/__tests__/PatternCard.test.tsx`
  - `src/components/__tests__/ExerciseSection.test.tsx` (mocks `fetch` with `vi.fn()`)
  - `src/app/api/correction/__tests__/route.test.ts`
- Convention: tests live next to the code they cover, inside a `__tests__/` folder, named `<thing>.test.ts(x)`.
- `tsconfig.json` has `paths: { "@/*": ["./src/*"] }` and `resolveJsonModule: true` — JSON content can be imported and typed.
- `next` is `16.2.12` — see project `AGENTS.md`: "This is NOT the Next.js you know" / read `node_modules/next/dist/docs/` before writing Next.js code. **This does not affect the test layer (Vitest, not Next runtime) but the proposal phase must check API route conventions before changing `route.ts`.**

**Mock corrector shape (`src/lib/mock-corrector.ts`)**

`analyzeCode(code)` is regex-based (`/interface\s+\w+/i`, `/class\s+\w+/i`, comment regex) and bins the code into `empty | minimal | partial | good | excellent`. It returns a `CorrectionResult` with 4 criteria (patternApplication 35%, decoupling 30%, naming 20%, functionality 15%) and a `feedback` string. It is **pattern-agnostic** — it scores any code on the same rubric regardless of which GoF pattern the exercise is for. There is no Factory-Method-specific assertion in the corrector today.

**The `mock-corrector.test.ts` style to mirror**

Tests are short, behavioral, and string-based (no DOM, no fs). They use `safeParse` against the Zod schema for shape checks and `toContain` / `toBeGreaterThan` for content. This is the closest existing analog to what we are about to build for an exercise.

## Exercise summary (Factory Method)

From `src/content/patterns/factory-method.json` `exercise` field:

- `fileName: "Database_Factory.ts"` — **inconsistent** with the body (exercise is about Email/SMS/Push notifications, the filename says Database). Pre-existing content bug. Not in scope to fix here, but the test must not depend on the filename being meaningful.
- `statement`: "Implementa un Factory Method para crear diferentes tipos de notificaciones (Email, SMS, Push) para una aplicación."
- `instructions`: refactor `NotificationService` to use the factory instead of `if/else`.
- `acceptanceCriteria` (4):
  1. Define a `Notification` interface with a `send()` method.
  2. Implement `EmailNotification`, `SMSNotification`, `PushNotification`.
  3. Create a `NotificationFactory` that returns the correct implementation.
  4. Modify `NotificationService` to use the factory.
- `starterCode`: four TODOs and an empty `NotificationService.notify(type, message)` body. No imports.

## Affected Areas

- `src/content/patterns/factory-method.json` — content, not code. Read-only for the proposal.
- `src/lib/mock-corrector.ts` — pattern-agnostic today. Adding Factory-Method-specific heuristics here is **optional** and is a different workstream from "write tests that verify a correct implementation". The exploration recommends keeping corrector changes out of this change's scope (see Recommendation).
- `src/lib/schemas.ts` — already exports `CorrectionResultSchema`. Reusable for any new test that needs to assert evaluator output shape.
- `src/test/setup.ts` — single-line jest-dom import. **No changes needed.**
- `vitest.config.ts` — current config supports TS test files in `__tests__/` folders anywhere under `src/`. **No changes needed for the pilot.**
- New directory likely: `src/content/patterns/__tests__/` (matches `__tests__/` convention) plus a reference-solution module — see Approaches.
- `src/components/patterns/ExerciseSection.tsx` — does NOT need to change. Tests do not run inside the editor today; the test target is the reference solution, not the textarea pipeline.
- `src/app/api/correction/route.ts` — does NOT need to change for the pilot. (Future work: surface test results to the UI.)

## Approaches

### Option A — Reference-solution + Vitest behavioral tests (RECOMMENDED)

Add a canonical TypeScript implementation of the exercise (the "model answer") as a regular module in the repo, and write Vitest tests that import it and assert behavior. The test file IS the spec; the reference file is one valid implementation that must pass it.

- **Structure**:
  - `src/content/patterns/__solutions__/factory-method.ts` — the reference implementation (e.g. `Notification` interface, `EmailNotification` / `SMSNotification` / `PushNotification` classes, `NotificationFactory` class or factory function, refactored `NotificationService`).
  - `src/content/patterns/__tests__/factory-method.test.ts` — Vitest tests that import from `__solutions__/factory-method.ts` and assert behavior.
- **What to test (mapped to each acceptance criterion)**:
  1. AC #1: `Notification` interface exists, has a `send(message: string)` method; a `Notification` value can be constructed by each concrete class and `send` is callable. (Assert via `expect(typeof emailInstance.send).toBe('function')`.)
  2. AC #2: Each of `EmailNotification`, `SMSNotification`, `PushNotification` is exported and is constructable. Optionally: `expect(email).toBeInstanceOf(EmailNotification)` and `expect(email).toHaveProperty('send')`.
  3. AC #3: `NotificationFactory.create(type)` returns a `Notification` for `"email"`, `"sms"`, `"push"`. Returned object is an instance of the matching concrete class. Throws (or returns `null` — pick one and assert) for unknown types.
  4. AC #4: `NotificationService` exposes a `notify(type, message)` method; calling it invokes `send` on the correct concrete (use `vi.spyOn` on a concrete class to capture the call, or check a side effect like `console.log` / a spy on the prototype). This is the integration assertion.
- **Optional bonus tests** (do not bloat the pilot — see Risks):
  - Decoupling: pass a `Notification` mock into `NotificationService` via DI; verify the service does not instantiate concrete types itself. (Matches the "decoupling 30%" rubric weight.)
  - Open/Closed-ish: add a new `WhatsAppNotification implements Notification` at runtime and verify the factory could route to it (skip for the pilot — it would require reflecting into a registry, which the starter code does not require).
- **Pros**:
  - Aligns 1:1 with existing `mock-corrector.test.ts` style: short, behavioral, no DOM, no fs.
  - Tests are the living spec for the exercise — when the content team changes the AC, the test is the contract.
  - The reference file doubles as a "model answer" snippet that can be copy-pasted into `codeAfter` later if desired.
  - Zero infra changes: Vitest, jsdom, path alias, TS strict mode all already cover it.
  - Runs in the existing `npm test` script with no new dependencies.
- **Cons**:
  - Adds a `.ts` solution file that lives next to JSON content — a content-vs-code split to explain in the README/PR.
  - Does NOT verify that a *user's* submission passes. The user's text is still only scored heuristically / by Claude. This is a content-team / evaluator concern, not a unit-test concern.
- **Effort**: Low (~1 file, ~50–80 LOC of tests, ~30 LOC of reference solution).

### Option B — Test the corrector with a Factory-Method-specific corpus

Extend `src/lib/__tests__/mock-corrector.test.ts` (or add a new file) with samples that contain the exact class/interface names the Factory Method exercise expects (`Notification`, `EmailNotification`, `NotificationFactory`) and assert the corrector returns `excellent` quality.

- **Pros**: keeps everything in the corrector's test file; small diff.
- **Cons**: it tests the **evaluator**, not the **exercise**. It only proves "regex X still fires on Factory Method code" — it does not prove the code is *correct*. This is the wrong layer for "verify a correct implementation". **Reject for the pilot.**

### Option C — Snapshot / structural test against the JSON content

Write a test that reads `factory-method.json` and asserts structural properties: `exercise.acceptanceCriteria` has length 4, `starterCode` mentions `Notification`, `statement` is non-empty, `fileName` matches `/^[A-Za-z0-9_]+\.ts$/`. Pure content-shape test.

- **Pros**: catches content regressions cheaply.
- **Cons**: zero coverage of *correctness*. The user's actual ask is "what kinds of tests would verify a correct implementation", which is Option A's question, not this one. **Run as a complement, not a replacement** — see Recommendation.

### Option D — Run the user's submitted code in a sandbox

Compile the textarea string with `tsc` / `esbuild` and execute it inside the Vitest process (or a worker), then assert behavior against a shared test spec. This is the Exercism / CodeWars model.

- **Pros**: this is what the user *wants* to believe is happening, given the "Ejecutar Tests" button label.
- **Cons**: large scope (sandboxing, security, language adapters for 12 languages, error reporting). Out of scope for the pilot. **Defer to a future change** — call it out in the Risks section so it isn't forgotten.

## Recommendation

**Go with Option A as the pilot deliverable, and add a tiny Option C check in the same test file.**

Concretely:

1. Create `src/content/patterns/__solutions__/factory-method.ts` with the canonical implementation (see "Pattern reference" below). Keep it as a plain TS module — no React, no Next, no DOM.
2. Create `src/content/patterns/__tests__/factory-method.test.ts` with four `describe` blocks, one per acceptance criterion, plus a 5th `describe` for the integration behavior of `NotificationService.notify(...)`. Mirror the `vi.spyOn` / mock pattern already used in `src/lib/__tests__/storage.test.ts`.
3. Add a small `describe("factory-method.json content", ...)` block in the same file that imports the JSON (with `resolveJsonModule`) and asserts the `acceptanceCriteria` length and that `starterCode` references `Notification` and `NotificationService`. (This is the Option C complement; ~6 lines.)
4. **Do NOT modify** `mock-corrector.ts`, `route.ts`, `ExerciseSection.tsx`, or `vitest.config.ts` for this change. The pilot is about defining the testable contract for one exercise; integrating it with the runtime is a separate, larger change.
5. Wire nothing new into the UI. The "Ejecutar Tests" button keeps calling the existing correction API. The new Vitest tests run only via `npm test`.

This keeps the pilot small, mirrors existing test style exactly, and gives the content team a tangible artifact (the test file) that they can update whenever the acceptance criteria change.

## Pattern reference (what a correct solution looks like)

A reference implementation that satisfies all four acceptance criteria and would pass a sensible Vitest suite:

```ts
// src/content/patterns/__solutions__/factory-method.ts

// 1. Product interface (AC #1)
export interface Notification {
  send(message: string): void;
}

// 2. Concrete products (AC #2)
export class EmailNotification implements Notification {
  send(message: string): void {
    // Pretend to call an email provider
    console.log(`[email] ${message}`);
  }
}

export class SMSNotification implements Notification {
  send(message: string): void {
    console.log(`[sms] ${message}`);
  }
}

export class PushNotification implements Notification {
  send(message: string): void {
    console.log(`[push] ${message}`);
  }
}

// 3. Factory (AC #3). Class is a natural fit for the exercise
//    statement; a `createNotification(type)` function is also valid.
export class NotificationFactory {
  create(type: string): Notification {
    switch (type.toLowerCase()) {
      case "email":
        return new EmailNotification();
      case "sms":
        return new SMSNotification();
      case "push":
        return new PushNotification();
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }
  }
}

// 4. Service that delegates to the factory (AC #4)
export class NotificationService {
  // Inject the factory so tests can swap it out.
  constructor(private readonly factory: NotificationFactory = new NotificationFactory()) {}

  notify(type: string, message: string): void {
    const notification = this.factory.create(type);
    notification.send(message);
  }
}
```

**Structural relationships the tests should assert**

- `Notification` is an interface (or abstract contract) with a `send(message: string): void` member.
- `EmailNotification`, `SMSNotification`, `PushNotification` are exported classes, each constructable with no required args, each assignable to `Notification`.
- `NotificationFactory` is an exported class with a `create(type: string): Notification` method. It returns the matching concrete class for `"email" | "sms" | "push"` (case-insensitive tolerance is a nice-to-have, not required) and throws for unknown types — the test should pin this down.
- `NotificationService` is an exported class with a `notify(type, message): void` method. It must NOT contain a hard-coded `if/else` that instantiates concretes — the factory must be the only path. (This is the decoupling invariant worth a test.)
- The `NotificationService` should accept the factory via constructor injection so the test can pass a spy factory. The starter code does not require this, but a "good" solution will have it; the test should not over-specify.

**Test outline (sketch, not the final file)**

```ts
// src/content/patterns/__tests__/factory-method.test.ts
import { describe, it, expect, vi } from "vitest";
import factoryMethod from "@/content/patterns/factory-method.json";
import type { PatternContent } from "@/content";
import {
  EmailNotification,
  NotificationFactory,
  NotificationService,
  PushNotification,
  SMSNotification,
  type Notification,
} from "@/content/patterns/__solutions__/factory-method";

const pattern = factoryMethod as PatternContent;

describe("AC #1: Notification interface", () => {
  it("each concrete is assignable to Notification", () => {
    const samples: Notification[] = [
      new EmailNotification(),
      new SMSNotification(),
      new PushNotification(),
    ];
    for (const n of samples) expect(typeof n.send).toBe("function");
  });
});

describe("AC #2: concrete notifications", () => {
  it("exports EmailNotification, SMSNotification, PushNotification", () => {
    expect(EmailNotification).toBeDefined();
    expect(SMSNotification).toBeDefined();
    expect(PushNotification).toBeDefined();
  });
});

describe("AC #3: NotificationFactory", () => {
  const factory = new NotificationFactory();
  it("creates the right concrete for each type", () => {
    expect(factory.create("email")).toBeInstanceOf(EmailNotification);
    expect(factory.create("sms")).toBeInstanceOf(SMSNotification);
    expect(factory.create("push")).toBeInstanceOf(PushNotification);
  });
  it("throws on unknown type", () => {
    expect(() => factory.create("fax")).toThrow();
  });
});

describe("AC #4: NotificationService uses the factory", () => {
  it("notify() delegates to the factory's product", () => {
    const email = new EmailNotification();
    const sendSpy = vi.spyOn(email, "send");
    const fakeFactory = { create: vi.fn().mockReturnValue(email) } as unknown as NotificationFactory;
    const service = new NotificationService(fakeFactory);
    service.notify("email", "hello");
    expect(fakeFactory.create).toHaveBeenCalledWith("email");
    expect(sendSpy).toHaveBeenCalledWith("hello");
  });
});

describe("factory-method.json content shape", () => {
  it("has 4 acceptance criteria", () => {
    expect(pattern.exercise.acceptanceCriteria).toHaveLength(4);
  });
  it("starterCode references Notification and NotificationService", () => {
    expect(pattern.exercise.starterCode).toMatch(/Notification/);
    expect(pattern.exercise.starterCode).toMatch(/NotificationService/);
  });
});
```

## Risks

- **Scope creep into the corrector.** The natural temptation is to add a `matchFactoryMethod(code)` heuristic to `mock-corrector.ts`. **Don't**, for the pilot. The corrector is pattern-agnostic by design; making it pattern-specific couples it to content changes. If a future change wants pattern-specific scoring, it should be a registry, not a switch.
- **Filename mismatch in content.** `exercise.fileName = "Database_Factory.ts"` while the body is about Email/SMS/Push notifications. The test must NOT assert the filename or it'll lock in the bug. Flag this for a separate content-fix change.
- **User submissions still aren't executed.** This change improves the *spec* (a Vitest test the reference solution passes) but does not change the user's experience: their textarea submission still goes through `mockCorrect` / Claude, not through the new Vitest file. Be explicit about this in the proposal so the user does not assume "Ejecutar Tests" now runs Vitest.
- **Reference solution can drift from `codeAfter` in the JSON.** The `codeAfter` field in the JSON is prose, not the same as `__solutions__/factory-method.ts`. The proposal should note both exist and pick the reference file as the source of truth for tests.
- **Next.js 16 caveat (project `AGENTS.md`).** Not relevant to the Vitest test layer, but if the proposal grows to touch `route.ts` or the editor UI, the implementation must consult `node_modules/next/dist/docs/` first.
- **Path alias fragility.** The test imports the reference via `@/content/patterns/__solutions__/factory-method`. The alias is already configured in both `vitest.config.ts` and `tsconfig.json`. If anyone later renames the folder, search hits in two config files — note in the PR description.
- **JSON typing.** The `patterns` array in `src/content/index.ts` casts each JSON with `as PatternContent`. The new content-shape test should follow the same pattern (`const pattern = factoryMethod as PatternContent`) to stay consistent and to avoid `resolveJsonModule` strict-null inference surprises.
- **Future-state ambition (run user code in a sandbox).** Option D is the real end-state but is its own change. Do not let it block the pilot; mention it in the proposal as a follow-up so the conversation keeps moving.

## Infrastructure notes

- **Vitest config is sufficient.** `jsdom` env, `@/*` alias, `setupFiles` already load jest-dom. No config change required.
- **`tsconfig.json`** has `strict: true` and `resolveJsonModule: true`. The reference solution must compile under strict mode — no `any` slips. If the reference needs to be deliberately loose (e.g. a `Record<string, unknown>` config bag), document it.
- **`package.json`** has no coverage tooling. The pilot does not need it. If a future change wants a coverage gate, add `vitest run --coverage` + `@vitest/coverage-v8` as a separate task.
- **No git repo** in the working tree (per env). Commit/PR hygiene is irrelevant for the artifact save itself; the orchestrator will handle that after the proposal is approved.
- **Existing test style to mirror:** `import { describe, it, expect, vi } from "vitest";` at the top, `vi.spyOn` for behavior capture (see `storage.test.ts`), `safeParse` only when a Zod schema is involved (the new tests don't need it).
- **Naming convention to mirror:** `__tests__/` folder next to the code it tests, file name `<thing>.test.ts`. The new `__solutions__/` folder is novel — flag it in the PR description so reviewers don't think it's a stray directory.

## Ready for Proposal

**Yes.** The pilot is well-scoped:

- One new reference-solution module (~30 LOC, strict TS).
- One new test file (~70–90 LOC, mirrors existing style).
- Zero modifications to existing infra, components, or the corrector.
- The proposal phase should commit to Option A, explicitly call out that this is a *spec* for the reference solution (not a runner for user submissions), and list Option D (sandbox execution) as a deferred follow-up. Filename mismatch (`Database_Factory.ts`) should be raised as a parallel content-fix ticket, not silently edited in this change.
