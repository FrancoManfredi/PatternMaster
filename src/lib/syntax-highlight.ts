// Simple, lightweight syntax highlighter for TypeScript-like code.
// Produces HTML with colored spans matching the design system tokens.
// Safe for use with dangerouslySetInnerHTML since input is authored content.
// NOTE: regexes do NOT use the 'g' flag — we build them fresh each match
// to avoid lastIndex persistence issues with exec() in a loop.

interface Token {
  type: "keyword" | "method" | "comment" | "string" | "number" | "type-anno" | "text";
  value: string;
}

function matchAt(re: RegExp, str: string): RegExpExecArray | null {
  // Match only at position 0 — rebuild regex without 'g' to avoid lastIndex issues
  const m = new RegExp(`^(?:${re.source})`, re.flags.replace("g", "")).exec(str);
  return m;
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    // Comments first
    let m = matchAt(/\/\/.*/, remaining);
    if (m) { tokens.push({ type: "comment", value: m[0] }); remaining = remaining.slice(m[0].length); continue; }

    m = matchAt(/\/\*[\s\S]*?\*\//, remaining);
    if (m) { tokens.push({ type: "comment", value: m[0] }); remaining = remaining.slice(m[0].length); continue; }

    // Strings
    m = matchAt(/"([^"\\]|\\.)*"/, remaining);
    if (m) { tokens.push({ type: "string", value: m[0] }); remaining = remaining.slice(m[0].length); continue; }

    m = matchAt(/'([^'\\]|\\.)*'/, remaining);
    if (m) { tokens.push({ type: "string", value: m[0] }); remaining = remaining.slice(m[0].length); continue; }

    m = matchAt(/`([^`\\]|\\.)*`/, remaining);
    if (m) { tokens.push({ type: "string", value: m[0] }); remaining = remaining.slice(m[0].length); continue; }

    // Keywords
    m = matchAt(/\b(interface|class|extends|implements|return|const|let|var|function|new|abstract|private|public|protected|constructor|this|typeof|import|from|export|default|async|await|yield|if|else|for|while|switch|case|break|continue|throw|try|catch|finally|type|enum|static|readonly|override|get|set|of|in|as|any|void|never|unknown|null|undefined|true|false|super)\b/, remaining);
    if (m) { tokens.push({ type: "keyword", value: m[0] }); remaining = remaining.slice(m[0].length); continue; }

    // Method calls
    m = matchAt(/\b([a-zA-Z_$][\w$]*)\s*\(/, remaining);
    if (m) { tokens.push({ type: "method", value: m[1] }); remaining = remaining.slice(m[1].length); continue; }

    // Numbers
    m = matchAt(/\b(\d+\.?\d*)\b/, remaining);
    if (m) { tokens.push({ type: "number", value: m[0] }); remaining = remaining.slice(m[0].length); continue; }

    // Single char as text
    tokens.push({ type: "text", value: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
}

function getTokenClass(type: Token["type"]): string {
  switch (type) {
    case "keyword":
      return "text-primary";
    case "method":
      return "text-info-cyan";
    case "comment":
      return "text-text-dim";
    case "string":
      return "text-warning-amber";
    case "number":
      return "text-secondary";
    case "type-anno":
      return "text-secondary";
    case "text":
    default:
      return "text-on-surface-variant";
  }
}

export function highlightCode(code: string): string {
  const tokens = tokenize(code);
  return tokens
    .map((token) => {
      if (token.type === "text" && token.value === "\n") return "\n";
      if (token.type === "text" && token.value === " ") return " ";
      return `<span class="${getTokenClass(token.type)}">${escapeHtml(token.value)}</span>`;
    })
    .join("");
}

export function renderBoldText(text: string): string {
  // Convert **text** to <strong>text</strong>, escaping HTML in captured groups
  return text.replace(/\*\*(.+?)\*\*/g, (_, match) => `<strong class='text-on-surface'>${escapeHtml(match)}</strong>`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
