"use client";

import { highlightCode } from "@/lib/syntax-highlight";

interface GuidedCodeBlockProps {
  /** Full source code to display, one logical line per element */
  code: string;
  /** 0-based indices of lines that are NEW (to highlight with diff green) */
  newLines?: number[];
}

/**
 * Renders a read-only code block with line numbers and diff highlighting.
 *
 * Lines whose index is in `newLines` get a subtle green background
 * (`bg-primary/[0.06]`) and a green left bar (`bg-primary`) — like a `+` in
 * git diff.
 *
 * Lines NOT in `newLines` render with no background (transparent), so the user
 * can visually distinguish "what was added in this step" from "what was already
 * there".
 *
 * This component has NO dependency on any specific pattern. It receives code
 * and newLines as generic props.
 */
export default function GuidedCodeBlock({ code, newLines }: GuidedCodeBlockProps) {
  const codeLines = code.split("\n");

  return (
    <div className="flex-1 p-4 font-body text-code-sm leading-[1.7] overflow-x-auto">
      <div className="flex min-w-0">
        {/* Line numbers */}
        <div className="text-outline-variant/50 select-none text-right pr-4 border-r border-outline-variant/20 flex flex-col py-0 shrink-0">
          {codeLines.map((_, i) => (
            <span key={i} className="leading-[1.7]">{i + 1}</span>
          ))}
        </div>
        {/* Code lines */}
        <div className="pl-4 flex-1 min-w-0">
          {codeLines.map((line, i) => {
            const isNew = newLines?.includes(i);
            return (
              <div
                key={i}
                className={`flex items-stretch ${
                  isNew ? "bg-primary/[0.06]" : ""
                }`}
              >
                {isNew && (
                  <div className="w-[3px] shrink-0 bg-primary rounded mr-2" />
                )}
                <span
                  className={`leading-[1.7] whitespace-pre-wrap break-all ${
                    !isNew ? "ml-[5px]" : ""
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(line) || " ",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
