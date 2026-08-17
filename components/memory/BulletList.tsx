"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Chip } from "@/components/ui/Chip";

export type Bullet = { id: string; text: string; tags: string[] };

export function BulletList({
  bullets,
  parent,
  onChange,
}: {
  bullets: Bullet[];
  parent: { experienceId?: string; projectId?: string };
  onChange: (bullets: Bullet[]) => void;
}) {
  const [newText, setNewText] = useState("");
  const [newTags, setNewTags] = useState("");
  const [busy, setBusy] = useState(false);

  async function addBullet(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;
    setBusy(true);
    try {
      const tags = newTags.split(",").map((t) => t.trim()).filter(Boolean);
      const created = await apiFetch<{ id: string; text: string; tags: string }>("/api/memory/bullet", {
        method: "POST",
        body: JSON.stringify({ text: newText.trim(), tags, ...parent }),
      });
      onChange([...bullets, { id: created.id, text: created.text, tags }]);
      setNewText("");
      setNewTags("");
    } finally {
      setBusy(false);
    }
  }

  async function removeBullet(id: string) {
    await apiFetch(`/api/memory/bullet/${id}`, { method: "DELETE" });
    onChange(bullets.filter((b) => b.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      {bullets.map((b) => (
        <div key={b.id} className="flex items-start justify-between gap-3 border-t border-rule pt-2">
          <div>
            <p className="text-sm text-ink">{b.text}</p>
            {b.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {b.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => removeBullet(b.id)}
            className="shrink-0 text-xs text-ink-faint hover:text-match-bad"
          >
            Remove
          </button>
        </div>
      ))}

      <form onSubmit={addBullet} className="mt-2 flex flex-col gap-2 border-t border-dashed border-rule pt-2 sm:flex-row sm:items-start">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Add a bullet…"
          className="flex-1 rounded-sm border border-rule-strong bg-paper px-2.5 py-1.5 text-sm placeholder:text-ink-faint focus:border-accent"
        />
        <input
          value={newTags}
          onChange={(e) => setNewTags(e.target.value)}
          placeholder="tags, comma-separated"
          className="w-full rounded-sm border border-rule-strong bg-paper px-2.5 py-1.5 font-mono text-xs placeholder:text-ink-faint focus:border-accent sm:w-48"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-sm border border-rule-strong px-3 py-1.5 text-xs text-ink-soft hover:border-accent hover:text-accent"
        >
          Add
        </button>
      </form>
    </div>
  );
}
