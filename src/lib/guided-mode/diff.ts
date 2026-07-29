/**
 * Computes which line indices in `currentCode` differ from the same position in `prevCode`.
 * Used to highlight newly-introduced lines in guided exercise steps.
 *
 * - Lines at position `i` that differ between prev and current → "new"
 * - Lines beyond prev's length → "new"
 * - Lines that are identical at the same position → NOT new
 *
 * This is intentionally a simple positional diff, not a Myers or LCS-based diff.
 * Guided step code is cumulative and structurally aligned, so positional comparison
 * produces pedagogically useful results.
 */
export function computeNewLines(prevCode: string, currentCode: string): number[] {
  const prev = prevCode.split("\n");
  const current = currentCode.split("\n");
  const newLines: number[] = [];
  for (let i = 0; i < current.length; i++) {
    if (i >= prev.length || current[i] !== prev[i]) {
      newLines.push(i);
    }
  }
  return newLines;
}
