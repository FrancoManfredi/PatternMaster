"use client";

import { highlightCode } from "@/lib/syntax-highlight";

interface CodeComparisonProps {
  codeBefore: string;
  codeAfter: string;
}

export default function CodeComparison({
  codeBefore,
  codeAfter,
}: CodeComparisonProps) {
  return (
    <section className="w-full max-w-[1280px] mx-auto px-[24px] mb-24 relative z-10">
      <div className="flex flex-col gap-8">
        <div className="flex items-end justify-between">
          <h2 className="font-headline text-headline-md text-on-surface">
            Evolución del Código
          </h2>
          <span className="font-body text-code-sm text-outline tracking-widest uppercase hidden sm:block">
            Refactoring in progress_
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-outline-variant/30 overflow-hidden">
          {/* Bad Code */}
          <div className="bg-carbon-surface p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-body text-label-caps text-error bg-error/10 px-2 py-1 uppercase tracking-widest">
                ANTI_PATTERN
              </span>
              <span className="font-body text-code-sm text-outline-variant">
                Navigator.ts
              </span>
            </div>
            <pre className="font-body text-code-sm overflow-x-auto p-4 bg-[#0a0a0a] leading-[1.7]">
              <code dangerouslySetInnerHTML={{ __html: highlightCode(codeBefore) }} />
            </pre>
            <div className="mt-2 text-body-md text-on-surface-variant/80 border-l-2 border-error pl-4">
              Difícil de mantener. Añadir un nuevo modo implica modificar la
              clase Contexto directamente, violando OCP (Open/Closed Principle).
            </div>
          </div>

          {/* Good Code */}
          <div className="bg-surface-container p-6 flex flex-col gap-4 relative">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <span className="font-body text-label-caps text-primary bg-primary/10 px-2 py-1 uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  done
                </span>{" "}
                STRATEGY_PATTERN
              </span>
              <span className="font-body text-code-sm text-outline-variant">
                RouteStrategy.ts
              </span>
            </div>
            <pre className="font-body text-code-sm overflow-x-auto p-4 bg-carbon-surface relative z-10 border border-primary/20 leading-[1.7]">
              <code dangerouslySetInnerHTML={{ __html: highlightCode(codeAfter) }} />
            </pre>
            <div className="mt-2 text-body-md text-on-surface-variant/80 border-l-2 border-primary pl-4 relative z-10">
              El Contexto delega el trabajo. Podemos añadir nuevas estrategias
              sin tocar el código existente.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
