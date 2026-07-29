/**
 * Generates a JavaScript starter code from a TypeScript starter.
 * Strips type annotations while preserving TODO comments and code structure.
 */
export function generateJSStarter(tsCode: string): string {
  return tsCode
    // Remove interface blocks (convert to empty — they're just placeholders)
    .replace(/interface\s+\w+\s*\{[^}]*\}\s*/g, "")
    // Remove type annotations in function params: `param: Type` → `param`
    // Also handles: `param: Type[]`, `param: Type<T>`
    .replace(/(\w+)\s*:\s*\w+(?:<[^>]*>)?(?:\[\])?(?=\s*[,)])/g, "$1")
    // Remove return type annotations: `) : Type` → `)`
    .replace(/\)\s*:\s*\w+(?:<[^>]*>)?(?:\[\])?\s*({)/g, ")$1")
    // Remove variable type annotations: `name: Type = value` → `name = value`
    .replace(/(\w+)\s*:\s*\w+(?:<[^>]*>)?(?:\[\])?\s*=/g, "$1 =")
    // Remove standalone type annotations after colons (e.g. `const x: Type`)
    .replace(/:\s*\w+(?:<[^>]*>)?(?:\[\])?\s*(?=;|\)|,|\n|$)/g, "")
    // Clean up double spaces from removals
    .replace(/\s{2,}/g, " ")
    // Clean up space before opening paren
    .replace(/\(\s/g, "(")
    // Clean up space before closing paren
    .replace(/\s\)/g, ")")
    .trim();
}
