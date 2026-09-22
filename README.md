# PatternMaster

A design pattern learning platform with interactive exercises, guided walkthroughs, and instant sandbox feedback.

## Tech Stack

- **Next.js 16** (App Router) — React framework
- **Tailwind CSS v4** — utility-first styling with custom design tokens
- **TypeScript** — type-safe codebase
- **Vitest** — unit and integration testing
- **Sandbox Runner** — Web Worker-based code evaluation with Sucrase TS stripping

## Quick Start

```bash
npm install
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build
npx vitest run    # Run test suite
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── catalogo/           # Pattern catalog
│   └── patterns/[slug]/    # Individual pattern detail
├── components/
│   ├── layout/             # Header, Footer
│   ├── patterns/           # ExerciseSection, CodeComparison, GuidedExercise
│   └── ui/                 # PatternCard, CatalogCard, ProgressBadge
├── content/                # Pattern definitions (JSON) + index
├── lib/
│   ├── test-runner/        # Sandbox test runner (Worker, types, per-pattern tests)
│   ├── validate-pattern/   # Pattern content validation (Part A sandbox, Part B guided)
│   ├── guided-mode/        # Guided exercise builder and diff engine
│   ├── transforms.ts       # TS→JS stripping (Sucrase) + hexToRgba
│   ├── colors.ts           # Color utility (hexToRgba)
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
npx vitest run          # Run all tests
npx vitest run --watch  # Watch mode
```
