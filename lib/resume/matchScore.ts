function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+.# ]/g, " ").replace(/\s+/g, " ").trim();
}

export function computeMatchScore(
  keywords: string[],
  corpusText: string
): { score: number; matched: string[]; missing: string[] } {
  const corpus = ` ${normalize(corpusText)} `;
  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of keywords) {
    const needle = ` ${normalize(keyword)} `;
    if (needle.trim().length === 0) continue;
    if (corpus.includes(needle)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const total = matched.length + missing.length;
  const score = total === 0 ? 0 : Math.round((matched.length / total) * 100);
  return { score, matched, missing };
}
