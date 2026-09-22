"use client";

import Link from "next/link";
import type { PatternContent } from "@/content";
import { hexToRgba } from "@/lib/colors";

// Map CSS variable references to hex values for hexToRgba
const VAR_TO_HEX: Record<string, string> = {
  "var(--color-primary)": "#bef264",
  "var(--color-secondary)": "#5de6ff",
  "var(--color-tertiary-fixed-dim)": "#ffb95f",
  "var(--color-warning-amber)": "#F59E0B",
  "var(--color-info-cyan)": "#22D3EE",
  "var(--color-error-red)": "#EF4444",
};

function resolveHex(color: string): string {
  return VAR_TO_HEX[color] || color;
}

interface CatalogCardProps {
  pattern: PatternContent;
}

const CATEGORY_META: Record<
  string,
  { color: string; icon: string; label: string; hoverTextClass: string }
> = {
  CREACIONAL: {
    color: "var(--color-primary)",
    icon: "architecture",
    label: "Creacional",
    hoverTextClass: "group-hover:text-primary",
  },
  COMPORTAMIENTO: {
    color: "var(--color-secondary)",
    icon: "sync_alt",
    label: "Comportamiento",
    hoverTextClass: "group-hover:text-secondary",
  },
  ESTRUCTURAL: {
    color: "var(--color-tertiary-fixed-dim)",
    icon: "account_tree",
    label: "Estructural",
    hoverTextClass: "group-hover:text-tertiary-fixed-dim",
  },
};

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "var(--color-warning-amber)",
  2: "var(--color-info-cyan)",
  3: "var(--color-error-red)",
};

export default function CatalogCard({ pattern }: CatalogCardProps) {
  const meta = CATEGORY_META[pattern.category] || CATEGORY_META.CREACIONAL;
  const difficultyColor =
    DIFFICULTY_COLORS[pattern.difficultyLevel] ||
    DIFFICULTY_COLORS[1];

  return (
    <div
      className="group bg-carbon-surface rounded-xl p-6 border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full"
      style={{
        // @ts-expect-error CSS custom properties in style
        "--cat-color": meta.color,
      }}
    >
      {/* Hover border + shadow (applied via group-hover on child) */}
      <div
        className="absolute inset-0 rounded-xl border border-transparent transition-all duration-300 pointer-events-none group-hover:border-[color:var(--cat-color)]/50 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.15)]"
        style={{
          borderColor: "transparent",
        }}
      />

      {/* Scanline hover effect */}
      <div
        className="absolute inset-0 h-[200%] -top-[100%] pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to bottom, transparent, ${hexToRgba(meta.color, 0.05)}, transparent)`,
          animation: "scan 2s linear infinite",
        }}
      />

      {/* Top row: Category badge + Difficulty bars */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        {/* Category badge */}
        <span
          className="px-2 py-1 rounded inline-flex items-center gap-1 border"
          style={{
            backgroundColor: hexToRgba(meta.color, 0.1),
            color: meta.color,
            borderColor: hexToRgba(meta.color, 0.2),
          }}
        >
          <span className="material-symbols-outlined text-[14px]">
            {meta.icon}
          </span>
          {meta.label}
        </span>

        {/* Difficulty bars */}
        <div className="flex gap-1">
          {[1, 2, 3].map((bar) => (
            <span
              key={bar}
              className="w-1.5 h-4 rounded-sm"
              style={{
                backgroundColor:
                  bar <= pattern.difficultyLevel
                    ? hexToRgba(difficultyColor, 0.8)
                    : "var(--color-outline-variant)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <h3
        className={`font-headline text-headline-sm text-on-surface mb-2 transition-colors ${meta.hoverTextClass} relative z-10`}
      >
        {pattern.title}
      </h3>

      {/* Description */}
      <p className="font-body text-body-md text-on-surface-variant flex-grow mb-6 line-clamp-3 relative z-10">
        {pattern.description}
      </p>

      {/* Button */}
      <Link
        href={`/patterns/${pattern.slug}`}
        className="w-full py-2.5 bg-surface-container border border-outline-variant/30 text-on-surface font-body text-code-sm rounded transition-all duration-300 flex items-center justify-center gap-2 group/btn relative z-10"
        style={
          {
            // Hover styles applied via CSS on the link
          } as React.CSSProperties
        }
        onMouseEnter={(e) => {
          const btn = e.currentTarget;
          btn.style.backgroundColor = meta.color;
          btn.style.borderColor = meta.color;
          btn.style.color = "var(--color-carbon-surface)";
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget;
          btn.style.backgroundColor = "";
          btn.style.borderColor = "";
          btn.style.color = "";
        }}
      >
        Explorar Patrón
        <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">
          arrow_right_alt
        </span>
      </Link>
    </div>
  );
}
