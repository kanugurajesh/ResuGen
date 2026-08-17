"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/EmptyState";
import { BulletList, Bullet } from "@/components/memory/BulletList";

type Project = {
  id: string;
  name: string;
  description: string | null;
  link: string | null;
  startDate: string | null;
  endDate: string | null;
  bullets: Bullet[];
};

const EMPTY_FORM = { name: "", description: "", link: "", startDate: "", endDate: "", bulletsText: "" };

export function ProjectSection({
  projects,
  onChange,
}: {
  projects: Project[];
  onChange: (projects: Project[]) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const created = await apiFetch<Project>("/api/memory/project", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          link: form.link.trim() || null,
          startDate: form.startDate.trim() || null,
          endDate: form.endDate.trim() || null,
          bullets: form.bulletsText
            .split("\n")
            .map((b) => b.trim())
            .filter(Boolean),
        }),
      });
      onChange([created, ...projects]);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add project");
    } finally {
      setAdding(false);
    }
  }

  async function removeProject(id: string) {
    await apiFetch(`/api/memory/project/${id}`, { method: "DELETE" });
    onChange(projects.filter((p) => p.id !== id));
  }

  function updateProject(id: string, patch: Partial<Project>) {
    onChange(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={addProject} className="rounded-sm border border-rule bg-paper-raised p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Add a project</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Link (optional)">
            <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          </Field>
          <Field label="Start date (optional)">
            <Input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="End date (optional)">
            <Input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Description (optional)">
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Bullets" hint="One accomplishment per line.">
            <Textarea
              rows={3}
              value={form.bulletsText}
              onChange={(e) => setForm({ ...form, bulletsText: e.target.value })}
            />
          </Field>
        </div>
        {error && <p className="mt-2 text-sm text-match-bad">{error}</p>}
        <Button type="submit" disabled={adding} className="mt-3">
          {adding ? "Adding…" : "Add project"}
        </Button>
      </form>

      {projects.length === 0 ? (
        <EmptyState text="No projects yet." />
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="rounded-sm border border-rule bg-paper-raised p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-base font-semibold text-ink">{proj.name}</p>
                  {proj.description && <p className="text-sm text-ink-soft">{proj.description}</p>}
                </div>
                <button
                  onClick={() => removeProject(proj.id)}
                  className="text-xs text-ink-faint hover:text-match-bad"
                >
                  Remove project
                </button>
              </div>
              <div className="mt-4">
                <BulletList
                  bullets={proj.bullets}
                  parent={{ projectId: proj.id }}
                  onChange={(bullets) => updateProject(proj.id, { bullets })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
