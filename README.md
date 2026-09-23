# PatternMaster

![CI](https://github.com/FrancoManfredi/PatternMaster/actions/workflows/ci.yml/badge.svg)

A design pattern learning platform with interactive exercises, guided walkthroughs, and instant sandbox feedback.

## Tech Stack

- **Next.js 16** (App Router) — React framework
- **React 19** — UI library
- **Tailwind CSS v4** — utility-first styling with custom design tokens
- **TypeScript** — type-safe codebase (strict)
- **Zod** — schema validation for content and requests
- **Vitest** — unit and integration testing
- **Sandbox Runner** — Web Worker-based code evaluation with Sucrase TS stripping

## Prerequisites

- Node.js 22 (matches CI in `.github/workflows/ci.yml`)
- npm

## Quick Start

```bash
npm ci
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npm start         # Serve production build
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Copy the template and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MOCK_CORRECTOR` | No | `true` | Reserved flag for the exercise correction backend (PM-BE-01). `true` uses the local mock, any other value uses the real provider. No code in `src/` reads it yet. |
| `ANTHROPIC_API_KEY` | Only when `MOCK_CORRECTOR` is not `true` | — | API key for the Anthropic SDK used by the planned correction backend. No code in `src/` reads it yet. |

Notes:

- `.env*` files are git-ignored (see `.gitignore`). Never commit real keys.
- `@anthropic-ai/sdk` is already listed in `package.json` for the planned backend, but the correction API route does not exist yet.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── catalogo/           # Pattern catalog
│   └── patterns/[slug]/    # Individual pattern detail
├── components/
│   ├── layout/             # Header, Footer
│   ├── patterns/           # ExerciseSection, CodeComparison, GuidedExerciseSection
│   ├── guided/             # Guided walkthrough UI
│   └── ui/                 # PatternCard, CatalogCard, SearchFilterBar
├── content/                # Pattern definitions (JSON) + index
│   ├── patterns/           # Per-pattern JSON + __tests__/ + __solutions__/
│   ├── guided/             # Guided exercise step definitions
│   └── index.ts            # PatternContent type + registry
├── lib/
│   ├── test-runner/        # Sandbox test runner (Worker, registry, types)
│   ├── validate-pattern/   # Pattern content validation (Part A sandbox, Part B guided)
│   ├── guided-mode/        # Guided exercise builder and diff engine
│   ├── guided/             # Guided helpers
│   ├── transforms.ts       # TS→JS stripping (Sucrase)
│   ├── colors.ts           # Color utility (hexToRgba)
│   ├── storage.ts          # Local progress storage
│   └── syntax-highlight.ts # Code syntax highlighting
└── public/                 # Static assets
```

## Pattern Coverage

22 design patterns across 3 categories:

- **Creational** — Factory Method, Abstract Factory, Builder, Prototype, Singleton
- **Behavioral** — Strategy, Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Template Method, Visitor
- **Structural** — Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy

## Testing

```bash
npm test              # Run all tests (vitest run)
npm run test:watch    # Watch mode
npx tsc --noEmit      # Typecheck (blocking in CI)
npm run lint          # Lint
npm run build         # Production build (blocking in CI)
```

CI runs typecheck, tests, and build on pushes and pull requests to `main` (see `.github/workflows/ci.yml`).

## Contributing Content

To add or fix a pattern, touch up to four places:

1. **Pattern JSON** — copy `src/content/patterns/factory-method.json` to `src/content/patterns/<slug>.json`, then register it in `src/content/index.ts`. Required fields match the `PatternContent` type: `slug`, `title`, `category`, `theory`, `analogy`, `realCases`, `sections`.
2. **Guided exercise** — add step definitions in `src/content/guided/<slug>.ts` (see `src/content/guided/factory-method.ts` for the shape).
3. **Sandbox tests** — add per-pattern tests in `src/content/patterns/__tests__/<slug>.test.ts`.
4. **Reference solution** — add a known-good solution in `src/content/patterns/__solutions__/<slug>.ts`.

Then validate:

```bash
npm test            # Must pass, including validate-pattern checks
npx tsc --noEmit    # Must pass
```

Content rules enforced by `src/lib/validate-pattern/`:

- Part A (sandbox): worker source parses, TS strips cleanly, criteria syntax is valid.
- Part B (guided): each step has an objective, no sandbox vocabulary leaks into guided text, no truncation placeholders, final step covers the acceptance symbols.

## Docs

Full PRD (`PRD-patrones-de-diseno.md`) does not exist in this repo yet. Until it is added, use these sources:

- `openspec/specs/sandbox-test-runner/spec.md` — sandbox runner contract
- `openspec/specs/pattern-exercise-tests/spec.md` — exercise test contract
- `src/content/index.ts` — `PatternContent` type, the source of truth for pattern JSON

## License

No `LICENSE` file exists yet. Do not add a license badge until the license is chosen and the file is committed.
