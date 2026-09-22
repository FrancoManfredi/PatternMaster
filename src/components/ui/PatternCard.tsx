"use client";

import Link from "next/link";
import type { PatternContent } from "@/content";
import { hexToRgba } from "@/lib/colors";

interface PatternCardProps {
  pattern: PatternContent;
  progress: number;
}

const ACCENT_COLORS: Record<string, string> = {
  "info-cyan": "var(--color-info-cyan)",
  primary: "var(--color-primary)",
};

const ACCENT_HEX: Record<string, string> = {
  "info-cyan": "#22d3ee",
  primary: "#bef264",
};

export default function PatternCard({ pattern, progress }: PatternCardProps) {
  const accentKey =
    pattern.category === "CREACIONAL" ? "info-cyan" : "primary";
  const accentColor = ACCENT_COLORS[accentKey];
  const accentHex = ACCENT_HEX[accentKey];
  const watermark = pattern.title.charAt(0);

  return (
    <div
      className="group relative bg-surface-container p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 border border-outline-variant/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] flex flex-col h-full justify-between"
    >
      {/* Watermark letter */}
      <div
        className="absolute top-0 right-0 p-4 opacity-5 font-headline text-[120px] leading-none select-none pointer-events-none group-hover:opacity-10 transition-opacity"
        style={{ color: accentColor }}
      >
        {watermark}
      </div>

      {/* Gradient hover overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          backgroundImage: `linear-gradient(to bottom right, ${hexToRgba(accentHex, 0.05)}, transparent)`,
        }}
      />

      <div className="relative z-10">
        {/* Header: Category + Difficulty */}
        <div className="flex justify-between items-start mb-6">
          <span
            className="bg-surface-container-high font-body text-label-caps px-3 py-1 uppercase tracking-widest"
            style={{
              color: accentColor,
              borderColor: hexToRgba(accentHex, 0.2),
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            {pattern.category}
          </span>
          <div className="flex items-center gap-1 text-on-surface-variant text-code-sm">
            <span className="material-symbols-outlined text-[14px]">
              signal_cellular_alt_{pattern.difficultyLevel}_bar
            </span>
            {pattern.difficulty}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-headline text-headline-sm text-on-surface mb-3 transition-colors group-hover:text-[var(--accent-hover)]"
          style={{ "--accent-hover": accentColor } as React.CSSProperties}
        >
          {pattern.title}
        </h3>

        {/* Description */}
        <p className="font-body text-body-md text-on-surface-variant line-clamp-3 mb-8">
          {pattern.description}
        </p>
      </div>

      {/* Progress + Action */}
      <div className="relative z-10 mt-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="font-body text-code-sm text-on-surface-variant">
            Progreso
          </span>
          <span className="font-body text-code-sm" style={{ color: accentColor }}>
            {progress}%
          </span>
        </div>
        <div className="w-full h-1 bg-surface-container-highest overflow-hidden mb-6">
          <div
            className="h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(190,242,100,0.8)]"
            style={{ width: `${progress}%`, backgroundColor: accentColor }}
          />
        </div>

        <Link
          href={`/patterns/${pattern.slug}`}
          className="w-full py-3 bg-surface border border-outline-variant/30 text-on-surface font-body text-label-caps tracking-widest transition-all duration-300 flex justify-center items-center gap-2 group/btn"
          onMouseEnter={(e) => {
            const el = e.currentTarget;
            el.style.backgroundColor = hexToRgba(accentHex, 0.1);
            el.style.borderColor = hexToRgba(accentHex, 0.5);
            el.style.color = accentColor;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            el.style.backgroundColor = "";
            el.style.borderColor = "";
            el.style.color = "";
          }}
        >
          Iniciar Práctica
          <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">
            play_arrow
          </span>
        </Link>
      </div>
    </div>
  );
}
