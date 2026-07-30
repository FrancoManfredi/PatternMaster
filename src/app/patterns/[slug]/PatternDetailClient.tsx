"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CodeComparison from "@/components/patterns/CodeComparison";
import ExerciseSection from "@/components/patterns/ExerciseSection";
import { highlightCode, renderBoldText } from "@/lib/syntax-highlight";
import type { PatternContent } from "@/content";

const CATEGORY_DISPLAY: Record<string, { icon: string; label: string }> = {
  CREACIONAL: { icon: "factory", label: "CREATIONAL" },
  COMPORTAMIENTO: { icon: "route", label: "BEHAVIORAL" },
  ESTRUCTURAL: { icon: "account_tree", label: "STRUCTURAL" },
};

interface PatternDetailClientProps {
  pattern: PatternContent;
}

export default function PatternDetailClient({
  pattern,
}: PatternDetailClientProps) {

  return (
    <div className="relative z-10 min-h-screen">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="w-full max-w-[1280px] mx-auto px-[24px] pt-12 pb-16 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
            {/* Left: Info */}
            <div className="flex flex-col gap-6 max-w-3xl">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 bg-secondary/10 text-secondary font-body text-label-caps uppercase tracking-widest flex items-center gap-2`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    psychology
                  </span>
                  {pattern.categoryLabel}
                </span>
                <span className="font-body text-code-sm text-on-surface-variant">
                  / {pattern.codeTag}
                </span>
              </div>

              <h1 className="font-headline text-headline-lg lg:text-[72px] lg:leading-[1.05] tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-on-surface to-on-surface-variant/60">
                {pattern.title}
              </h1>

              <p className="font-body text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
                {pattern.description}
              </p>
            </div>

            {/* Right: 3D Logo Box */}
            <div className="w-full max-w-[300px] lg:w-[400px] aspect-square relative flex-shrink-0 group perspective-1000">
              <div className="absolute inset-0 bg-surface-container overflow-hidden transform-style-3d group-hover:-rotate-y-12 transition-transform duration-700 ease-out">
                {/* Grid lines inside the box */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:20px_20px]" />

                {/* Logo icon */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <span className="material-symbols-outlined text-primary text-[120px] opacity-90 drop-shadow-[0_0_15px_rgba(191,243,101,0.4)]">
                    grid_view
                  </span>
                </div>

                {/* Tech overlays */}
                <div className="absolute bottom-4 left-4 font-body text-[10px] text-primary/70 uppercase">
                  Encapsulation: True
                  <br />
                  Context: Dynamic
                </div>
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(191,243,101,0.8)]" />
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid: Theory & Analogy */}
        <section className="w-full max-w-[1280px] mx-auto px-[24px] mb-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
            {/* Theory Card (7 cols) */}
            <div className="col-span-1 md:col-span-7 bg-surface-container-low p-8 flex flex-col gap-6 group hover:bg-surface-container transition-colors duration-500">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                <h2 className="font-headline text-headline-md text-on-surface flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    account_tree
                  </span>
                  {pattern.theory.problem}
                </h2>
                <span className="font-body text-code-sm text-outline">
                  01
                </span>
              </div>

              <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
                {pattern.theory.problemDescription}
              </p>

              {/* Before/After visual */}
              <div className="mt-auto pt-4 flex gap-4">
                <div className="flex-1 bg-carbon-surface p-4 flex flex-col items-center justify-center gap-2 border border-outline-variant/10">
                  <span className="material-symbols-outlined text-error text-3xl">
                    route
                  </span>
                  <span className="font-body text-code-sm text-on-surface-variant text-center">
                    {pattern.theory.beforeAfter.before}
                  </span>
                </div>
                <div className="flex items-center justify-center text-outline-variant">
                  <span className="material-symbols-outlined text-2xl">
                    arrow_forward
                  </span>
                </div>
                <div className="flex-1 bg-carbon-surface p-4 flex flex-col items-center justify-center gap-2 border border-primary/20 shadow-[inset_0_0_20px_rgba(191,243,101,0.05)]">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-primary text-xl">
                      directions_car
                    </span>
                    <span className="material-symbols-outlined text-primary text-xl">
                      pedal_bike
                    </span>
                    <span className="material-symbols-outlined text-primary text-xl">
                      directions_walk
                    </span>
                  </div>
                  <span className="font-body text-code-sm text-primary text-center">
                    {pattern.theory.beforeAfter.after}
                  </span>
                </div>
              </div>
            </div>

            {/* Analogy Card (5 cols) */}
            <div className="col-span-1 md:col-span-5 bg-surface-container-low p-0 overflow-hidden flex flex-col relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/90 to-transparent z-10" />

              {/* Background image area */}
              <div className="h-48 w-full bg-cover bg-center bg-surface-container-high">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary/30 text-[80px]">
                    {CATEGORY_DISPLAY[pattern.category]?.icon ?? "factory"}
                  </span>
                </div>
              </div>

              <div className="relative z-20 p-8 pt-0 -mt-8 flex flex-col gap-4 flex-1">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[16px]">
                      emoji_objects
                    </span>
                  </span>
                  <h3 className="font-headline text-headline-sm text-on-surface">
                    {pattern.analogy.title}
                  </h3>
                </div>
                <p className="font-body text-body-md text-on-surface-variant leading-relaxed">
                  {pattern.analogy.description}
                </p>
                <p className="font-body text-body-md text-on-surface-variant leading-relaxed italic">
                  {pattern.analogy.quote}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Code Comparison */}
        <CodeComparison
          codeBefore={pattern.codeBefore}
          codeAfter={pattern.codeAfter}
        />

        {/* How It Works — Terminal-style deep dive */}
        <section className="w-full max-w-[1280px] mx-auto px-[24px] mb-32 relative z-10">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-8 bg-secondary block" />
            <div>
              <span className="font-body text-label-caps text-secondary tracking-[0.15em] uppercase block">
                Arquitectura Interna
              </span>
              <h2 className="font-headline text-headline-sm text-on-surface mt-1">
                {pattern.sections.howItWorks.title}
              </h2>
            </div>
          </div>

          <div className="bg-carbon-surface border border-outline-variant/20 group hover:border-secondary/30 transition-colors duration-500">
            {/* Terminal header */}
            <div className="bg-surface-container-highest px-5 py-3 flex items-center justify-between border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 bg-error-red" />
                  <div className="w-2.5 h-2.5 bg-warning-amber" />
                  <div className="w-2.5 h-2.5 bg-terminal-green" />
                </div>
                <span className="font-body text-code-sm text-on-surface-variant/60 ml-2">
                  structure_analysis.ts — {pattern.slug}
                </span>
              </div>
              <span className="font-body text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                {CATEGORY_DISPLAY[pattern.category]?.label ?? "CREATIONAL"}
              </span>
            </div>

            {/* Terminal body */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                {/* Left: explanation */}
                <div className="lg:col-span-2 space-y-5">
                  <div className="font-body text-code-sm text-secondary/70 mb-2">
                    $ describe_pattern --mode=structural
                  </div>
                  {pattern.sections.howItWorks.description.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="font-body text-body-md text-on-surface-variant leading-[1.8] border-l-2 border-secondary/20 pl-4 hover:border-secondary/60 transition-colors">
                      <span dangerouslySetInnerHTML={{ __html: renderBoldText(paragraph) }} />
                    </p>
                  ))}
                </div>

                {/* Right: structure code */}
                <div className="lg:col-span-3 relative">
                  <div className="absolute -top-3 -left-3 w-6 h-6 bg-secondary/20 text-secondary font-body text-[10px] font-bold flex items-center justify-center">
                    {'</>'}
                  </div>
                  <div className="bg-[#0a0a0a] p-5 border border-primary/10 overflow-x-auto max-h-[480px] overflow-y-auto">
                    <pre className="font-body text-code-sm leading-[1.7] whitespace-pre">
                      <code dangerouslySetInnerHTML={{ __html: highlightCode(pattern.sections.howItWorks.structureCode) }} />
                    </pre>
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-primary/20 text-primary font-body text-[10px] flex items-center justify-center font-mono">
                    {'_'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pros & Cons — System diagnostics panel */}
        <section className="w-full max-w-[1280px] mx-auto px-[24px] mb-32 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-8 bg-primary block" />
            <div>
              <span className="font-body text-label-caps text-primary tracking-[0.15em] uppercase block">
                Trade-off Analysis
              </span>
              <h2 className="font-headline text-headline-sm text-on-surface mt-1">
                Beneficios y Consideraciones
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-outline-variant/30 overflow-hidden">
            {/* Pros */}
            <div className="bg-surface-container-low p-8 lg:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/[0.08] transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <span className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-[22px]">checklist</span>
                  </span>
                  <div>
                    <span className="font-body text-label-caps text-primary tracking-[0.1em] uppercase block">
                      SYSTEM_01
                    </span>
                    <h3 className="font-headline text-headline-sm text-on-surface mt-0.5">
                      Beneficios
                    </h3>
                  </div>
                </div>
                <ul className="space-y-4">
                  {pattern.sections.prosCons.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-4 font-body text-body-md text-on-surface-variant leading-relaxed group/item">
                      <span className="flex-shrink-0 mt-0.5 w-5 h-5 bg-primary/20 text-primary text-[12px] flex items-center justify-center font-body font-bold">
                        {i + 1}
                      </span>
                      <span className="group-hover/item:text-on-surface transition-colors duration-300">
                        {pro}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cons */}
            <div className="bg-surface-container-low p-8 lg:p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-warning-amber/5 rounded-full blur-3xl pointer-events-none group-hover:bg-warning-amber/[0.08] transition-all duration-700" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <span className="flex items-center justify-center w-10 h-10 bg-warning-amber/10 text-warning-amber">
                    <span className="material-symbols-outlined text-[22px]">balance</span>
                  </span>
                  <div>
                    <span className="font-body text-label-caps text-warning-amber tracking-[0.1em] uppercase block">
                      SYSTEM_02
                    </span>
                    <h3 className="font-headline text-headline-sm text-on-surface mt-0.5">
                      Consideraciones
                    </h3>
                  </div>
                </div>
                <ul className="space-y-4">
                  {pattern.sections.prosCons.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-4 font-body text-body-md text-on-surface-variant leading-relaxed group/item">
                      <span className="flex-shrink-0 mt-0.5 w-5 h-5 bg-warning-amber/20 text-warning-amber text-[12px] flex items-center justify-center font-body font-bold">
                        {i + 1}
                      </span>
                      <span className="group-hover/item:text-on-surface transition-colors duration-300">
                        {con}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* When to Use / When NOT to Use — Terminal verdict blocks */}
        <section className="w-full max-w-[1280px] mx-auto px-[24px] mb-32 relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-1 h-8 bg-primary block" />
            <div>
              <span className="font-body text-label-caps text-primary tracking-[0.15em] uppercase block">
                Decision Framework
              </span>
              <h2 className="font-headline text-headline-sm text-on-surface mt-1">
                ¿Cuándo aplicar este patrón?
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-outline-variant/30 overflow-hidden">
            {/* Use it */}
            <div className="bg-surface-container-low relative overflow-hidden group">
              <div className="p-8 lg:p-10 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-3 h-3 bg-terminal-green shadow-[0_0_8px_rgba(190,242,100,0.6)]" />
                  <span className="font-body text-label-caps text-terminal-green tracking-[0.15em] uppercase">
                    CUANDO USARLO
                  </span>
                </div>
                <div className="space-y-4">
                  <p className="font-body text-body-md text-on-surface-variant leading-[1.8] pl-5 border-l-2 border-primary/30">
                    {pattern.sections.whenToUse}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant/10">
                  <span className="font-body text-code-sm text-terminal-green/50">
                    verdict: <span className="text-terminal-green">RECOMMENDED</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Don't use it */}
            <div className="bg-surface-container-low relative overflow-hidden group">

              <div className="p-8 lg:p-10 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-3 h-3 bg-error shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                  <span className="font-body text-label-caps text-error tracking-[0.15em] uppercase">
                    CUANDO EVITARLO
                  </span>
                </div>
                <div className="space-y-4">
                  <p className="font-body text-body-md text-on-surface-variant leading-[1.8] pl-5 border-l-2 border-error/30">
                    {pattern.sections.whenNotToUse}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant/10">
                  <span className="font-body text-code-sm text-error/50">
                    verdict: <span className="text-error">CAUTION</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Cases — Industry evidence */}
        <section className="w-full max-w-[1280px] mx-auto px-[24px] mb-32 relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <span className="w-1 h-8 bg-info-cyan block" />
            <div>
              <span className="font-body text-label-caps text-info-cyan tracking-[0.15em] uppercase block">
                Industry Evidence
              </span>
              <h2 className="font-headline text-headline-sm text-on-surface mt-1">
                Casos Reales
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-outline-variant/30 overflow-hidden">
            {pattern.realCases.map((realCase, i) => (
              <div key={i} className="bg-surface-container-low p-8 lg:p-10 relative group hover:bg-surface-container transition-colors duration-500">
                {/* Numbered corner */}
                <div className="absolute top-4 right-4 font-body text-[40px] font-bold text-outline-variant/10 select-none leading-none group-hover:text-info-cyan/[0.08] transition-colors duration-500">
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="flex-shrink-0 w-10 h-10 bg-info-cyan/10 text-info-cyan flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">
                        {i === 0 ? 'precision_manufacturing' : i === 1 ? 'database' : 'cloud'}
                      </span>
                    </span>
                    <h3 className="font-headline text-headline-sm text-on-surface">
                      {realCase.title}
                    </h3>
                  </div>
                  <p className="font-body text-body-md text-on-surface-variant leading-[1.8]">
                    {realCase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Exercise Section */}
        <ExerciseSection pattern={pattern} />
      </main>

      <Footer />
    </div>
  );
}
