const ESCAPES: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "{": "\\{",
  "}": "\\}",
  "$": "\\$",
  "&": "\\&",
  "%": "\\%",
  "#": "\\#",
  "_": "\\_",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

export function tex(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/[\\{}$&%#_~^]/g, (ch) => ESCAPES[ch] ?? ch);
}

// For bullet/summary text that may contain simple markdown-ish emphasis from LLM output.
export function texMultiline(text: string | null | undefined): string {
  if (!text) return "";
  return tex(text).replace(/\r?\n/g, " \\\\ ");
}
