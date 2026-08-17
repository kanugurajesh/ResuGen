"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/EmptyState";
import { BulletList, Bullet } from "@/components/memory/BulletList";

type Experience = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: Bullet[];
};

const EMPTY_FORM = { company: "", title: "", location: "", startDate: "", endDate: "", current: false, bulletsText: "" };

export function ExperienceSection({
  experiences,
  onChange,
}: {
  experiences: Experience[];
  onChange: (experiences: Experience[]) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addExperience(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.title.trim() || !form.startDate.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const created = await apiFetch<Experience>("/api/memory/experience", {
        method: "POST",
        body: JSON.stringify({
          company: form.company.trim(),
          title: form.title.trim(),
          location: form.location.trim() || null,
          startDate: form.startDate.trim(),
          endDate: form.current ? null : form.endDate.trim() || null,
          current: form.current,
          bullets: form.bulletsText
            .split("\n")
            .map((b) => b.trim())
            .filter(Boolean),
        }),
      });
      onChange([created, ...experiences]);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add experience");
    } finally {
      setAdding(false);
    }
  }

  async function removeExperience(id: string) {
    await apiFetch(`/api/memory/experience/${id}`, { method: "DELETE" });
    onChange(experiences.filter((e) => e.id !== id));
  }

  function updateExperience(id: string, patch: Partial<Experience>) {
    onChange(experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={addExperience} className="rounded-sm border border-rule bg-paper-raised p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Add a role</p>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Company">
            <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </Field>
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Location (optional)">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </Field>
          <Field label="Start date">
            <Input
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              placeholder="e.g. Jan 2022"
            />
          </Field>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input
              id="current"
              type="checkbox"
              checked={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.checked })}
            />
            <label htmlFor="current" className="text-sm text-ink-soft">
              I currently work here
            </label>
          </div>
          {!form.current && (
            <Field label="End date">
              <Input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </Field>
          )}
        </div>
        <div className="mt-3">
          <Field label="Bullets" hint="One accomplishment per line. These are the facts tailoring will draw from.">
            <Textarea
              rows={4}
              value={form.bulletsText}
              onChange={(e) => setForm({ ...form, bulletsText: e.target.value })}
              placeholder={"Led migration of billing service to event-driven architecture, cutting latency 40%\nOwned on-call rotation for payments platform serving 2M users"}
            />
          </Field>
        </div>
        {error && <p className="mt-2 text-sm text-match-bad">{error}</p>}
        <Button type="submit" disabled={adding} className="mt-3">
          {adding ? "Adding…" : "Add role"}
        </Button>
      </form>

      {experiences.length === 0 ? (
        <EmptyState text="No experience yet. Add your work history above." />
      ) : (
        <div className="flex flex-col gap-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="rounded-sm border border-rule bg-paper-raised p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-display text-base font-semibold text-ink">{exp.title}</p>
                  <p className="text-sm text-ink-soft">
                    {exp.company}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  <p className="font-mono text-[11px] text-ink-faint">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate || "?"}
                  </p>
                </div>
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-xs text-ink-faint hover:text-match-bad"
                >
                  Remove role
                </button>
              </div>
              <div className="mt-4">
                <BulletList
                  bullets={exp.bullets}
                  parent={{ experienceId: exp.id }}
                  onChange={(bullets) => updateExperience(exp.id, { bullets })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
