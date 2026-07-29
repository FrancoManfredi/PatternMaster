"use client";

import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PatternCard from "@/components/ui/PatternCard";
import { getAllPatterns } from "@/content";
import { useProgress } from "@/components/ProgressContext";

export default function HomePage() {
  const patterns = getAllPatterns();
  const { getProgress } = useProgress();

  return (
    <div className="relative z-10 min-h-screen">
      <Header />

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative z-10 w-full max-w-[1280px] mx-auto px-[24px] pt-32 pb-24 flex flex-col items-center justify-center text-center">
          {/* Ambient background */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-20"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, var(--color-primary-fixed-dim) 0%, transparent 50%)",
            }}
          />

          {/* Logo */}
          <div className="mb-8 w-24 h-24 relative animate-[pulse_4s_ease-in-out_infinite]">
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[64px] drop-shadow-[0_0_15px_rgba(190,242,100,0.4)]">
                grid_view
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-headline text-headline-lg text-on-surface mb-6 max-w-4xl tracking-tight leading-tight">
            Domina el{" "}
            <span className="text-primary italic opacity-90 drop-shadow-[0_0_10px_rgba(190,242,100,0.3)]">
              Arte
            </span>{" "}
            del
            <br />
            Diseño de Software
          </h1>

          {/* Subtitle */}
          <p className="font-body text-body-lg text-on-surface-variant max-w-2xl mb-12">
            Aprende, practica y recibe feedback{" "}
            <span className="text-secondary font-bold">
              instantáneo por IA
            </span>{" "}
            en los patrones de diseño más importantes.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-6 items-center justify-center mb-24">
            <Link href="/catalogo" className="bg-primary text-on-primary font-headline text-sm px-8 py-4 shadow-[0_0_20px_rgba(190,242,100,0.2)] hover:shadow-[0_0_30px_rgba(190,242,100,0.4)] transition-all duration-300 uppercase tracking-widest flex items-center gap-2 group cursor-pointer">
              <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
                terminal
              </span>
              Iniciar Sesión
            </Link>
            <Link
              href="/catalogo"
              className="bg-transparent border border-secondary text-secondary font-headline text-sm px-8 py-4 hover:bg-secondary/10 transition-colors uppercase tracking-widest flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">explore</span>
              Explorar Catálogo
            </Link>
          </div>

          {/* Terminal Visualization */}
          <div className="w-full max-w-3xl text-left bg-carbon-surface overflow-hidden shadow-2xl relative border border-outline-variant/30 backdrop-blur-md">
            {/* Terminal Header */}
            <div className="bg-surface-container-highest px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-error-red" />
                <div className="w-3 h-3 rounded-full bg-warning-amber" />
                <div className="w-3 h-3 rounded-full bg-terminal-green" />
              </div>
              <span className="font-body text-label-caps text-on-surface-variant tracking-widest">
                evaluation_script.sh
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-sm">
                code
              </span>
            </div>

            {/* Terminal Body */}
            <div className="p-6 font-body text-code-sm leading-relaxed text-on-surface-variant/80 relative">
              <div className="text-secondary/70">
                root@patternmaster:~# ./evaluate_pattern --type=Strategy
              </div>
              <div className="mt-2 text-primary animate-[pulse_1s_infinite]">
                Initializing AI Engine [================&gt;] 100%
              </div>
              <div className="mt-2">
                &gt; Analyzing submission context...
              </div>
              <div className="mt-1 text-terminal-green">
                &gt; Context identified: e-commerce payment processing.
              </div>
              <div className="mt-2">
                &gt; Checking interface implementations...
              </div>
              <div className="mt-1 text-terminal-green">
                &nbsp;&nbsp;✓ PaymentStrategy interface defined correctly.
              </div>
              <div className="mt-1 text-terminal-green">
                &nbsp;&nbsp;✓ CreditCardStrategy implemented.
              </div>
              <div className="mt-1 text-error-red">
                &nbsp;&nbsp;✗ PaypalStrategy missing required
                &apos;execute()&apos; method.
              </div>
              <div className="mt-4 text-secondary flex items-center">
                <span className="mr-2">Feedback:</span> Ensure all concrete
                strategies fulfill the contract.
              </div>
              <div className="mt-4 flex">
                <span className="text-secondary/70 mr-2">
                  root@patternmaster:~#
                </span>
                <span className="w-2 h-4 bg-primary animate-[ping_1.5s_infinite] inline-block" />
              </div>
            </div>

            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none scanline-overlay" />
          </div>
        </section>

        {/* Pattern Catalog Section */}
        <section className="w-full max-w-[1280px] mx-auto px-[24px] py-24 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-outline-variant/20 pb-6">
            <div>
              <span className="font-body text-label-caps text-secondary tracking-widest uppercase mb-2 block">
                Módulo 01
              </span>
              <h2 className="font-headline text-headline-md text-on-surface">
                Catálogo de Patrones
              </h2>
            </div>
            <Link
              href="/catalogo"
              className="text-primary hover:text-primary-fixed-dim font-body text-label-caps uppercase tracking-widest flex items-center gap-2 transition-colors"
            >
              Ver todos{" "}
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {patterns.map((pattern) => (
              <PatternCard
                key={pattern.slug}
                pattern={pattern}
                progress={getProgress(pattern.slug)}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
