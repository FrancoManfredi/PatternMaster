/**
 * Shared transforms — single source of truth for code transformations.
 *
 * stripTS: Strips TypeScript syntax from code using Sucrase.
 * hexToRgba: Converts hex color to rgba string.
 */

import { transform } from "sucrase";

/**
 * Strips TypeScript syntax from user code using Sucrase.
 * Also strips decorators and export/import keywords (for sandbox eval).
 *
 * IMPORTANT: Only "typescript" transform — NOT "imports".
 * "imports" converts `export class Foo {}` to CommonJS `exports.Foo = Foo;`,
 * but the sandbox Worker uses $exports (not exports) as the parameter name.
 */
export function stripTS(code: string): string {
  const result = transform(code, {
    transforms: ["typescript"],
  });
  let js = result.code;

  // Remove export keyword (new Function doesn't support module exports)
  js = js.replace(/\bexport\s+(default\s+)?/g, "");

  // Remove import statements (worker injects exports itself)
  js = js.replace(/^import\s+(?:type\s+)?[^;]+;\s*$/gm, "");

  // Strip decorator syntax (@decorator or @decorator(args))
  js = js.replace(/@\w+(?:\([^)]*\))?\s*/g, "");

  return js.trim();
}

/**
 * Converts a hex color string to rgba.
 * @param hex - Hex color string (e.g. "#ff0000" or "#f00")
 * @param alpha - Alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const expanded =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
