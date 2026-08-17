"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/field";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";

type Skill = { id: string; name: string; category: string | null };

export function SkillSection({
  skills,
  onChange,
}: {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const created = await apiFetch<Skill>("/api/memory/skill", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), category: category.trim() || null }),
      });
      onChange([...skills, created]);
      setName("");
      setCategory("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add skill");
    } finally {
      setBusy(false);
    }
  }

  async function removeSkill(id: string) {
    await apiFetch(`/api/memory/skill/${id}`, { method: "DELETE" });
    onChange(skills.filter((s) => s.id !== id));
  }

  const byCategory = groupByCategory(skills);

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={addSkill} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            Skill
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kubernetes" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] uppercase tracking-wide text-ink-soft">
            Category (optional)
          </label>
          <Input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Infrastructure"
          />
        </div>
        <Button type="submit" disabled={busy}>
          Add skill
        </Button>
      </form>
      {error && <p className="text-sm text-match-bad">{error}</p>}

      {skills.length === 0 ? (
        <EmptyState text="No skills yet. Add the tools, languages, and platforms you work with." />
      ) : (
        <div className="flex flex-col gap-4">
          {Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat}>
              <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{cat}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {items.map((s) => (
                  <span key={s.id} className="group inline-flex items-center gap-1.5">
                    <Chip tone="neutral">{s.name}</Chip>
                    <button
                      onClick={() => removeSkill(s.id)}
                      className="text-xs text-ink-faint opacity-0 group-hover:opacity-100 hover:text-match-bad"
                      aria-label={`Remove ${s.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  const groups: Record<string, Skill[]> = {};
  for (const skill of skills) {
    const key = skill.category || "General";
    groups[key] = groups[key] ? [...groups[key], skill] : [skill];
  }
  return groups;
}
