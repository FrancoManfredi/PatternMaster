"use client";

import { useState, useMemo, useEffect } from "react";
import type { PatternContent } from "@/content";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CatalogCard from "@/components/ui/CatalogCard";
import CatalogEmptyState from "@/components/ui/CatalogEmptyState";
import SearchFilterBar, {
  type CategoryFilter,
} from "@/components/ui/SearchFilterBar";

interface CatalogPageClientProps {
  patterns: PatternContent[];
}

export default function CatalogPageClient({
  patterns,
}: CatalogPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("all");
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const md = window.matchMedia("(min-width: 768px)");

    const update = () => {
      if (lg.matches) setColumns(3);
      else if (md.matches) setColumns(2);
      else setColumns(1);
    };

    update();
    lg.addEventListener("change", update);
    md.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      md.removeEventListener("change", update);
    };
  }, []);

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return patterns.filter((p) => {
      const matchesSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query);
      const matchesCategory =
        activeCategory === "all" || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [patterns, searchQuery, activeCategory]);

  return (
    <div className="relative z-10 min-h-screen">
      <Header />

      <main className="pt-16">
        {/* Header Section */}
        <section className="max-w-[1280px] mx-auto px-[24px] w-full pt-12 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div className="flex flex-col gap-4 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2">
                <span
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{
                    boxShadow: "0 0 10px rgba(190,242,100,0.8)",
                  }}
                />
                <span className="font-body text-label-caps text-primary uppercase tracking-widest">
                  v1.0_Database
                </span>
              </div>
              <h1 className="font-headline text-headline-lg text-on-surface">
                Catálogo de{" "}
                <span
                  className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Patrones
                </span>
              </h1>
              <p className="font-body text-body-lg text-on-surface-variant max-w-xl border-l-2 border-outline-variant/30 pl-4 py-1">
                Explora la biblioteca de soluciones arquitectónicas. Aprende
                cuándo y cómo aplicarlas en sistemas de alto rendimiento.
              </p>
            </div>

            {/* Decorative Tech Graphic */}
            <div className="hidden md:flex relative w-32 h-32 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[80px] opacity-20">
                  hub
                </span>
              </div>
              {/* Orbiting dot animation */}
              <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                <div
                  className="absolute top-0 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-secondary rounded-full"
                  style={{
                    boxShadow: "0 0 8px rgba(93,230,255,0.8)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Toolbar / Search & Filters */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </section>

        {/* Catalog Grid Section */}
        <section className="max-w-[1280px] mx-auto px-[24px] w-full pb-24">
          {/* Metric Background Lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20 z-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(141, 147, 126, 0.1) 31px, rgba(141, 147, 126, 0.1) 32px)",
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {filtered.length > 0 ? (
              <>
                {filtered.map((pattern) => (
                  <CatalogCard key={pattern.slug} pattern={pattern} />
                ))}
                {/* Empty state slots to fill the row */}
                {Array.from({
                  length:
                    (columns - (filtered.length % columns)) % columns,
                }).map((_, i) => (
                  <CatalogEmptyState key={`empty-${i}`} />
                ))}
              </>
            ) : (
              <CatalogEmptyState />
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
