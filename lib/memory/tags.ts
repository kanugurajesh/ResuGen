export function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function serializeTags(tags: string[]): string {
  return tags.map((t) => t.trim()).filter(Boolean).join(",");
}
