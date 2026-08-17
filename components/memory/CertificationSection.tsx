"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/EmptyState";

type Certification = { id: string; name: string; issuer: string | null; date: string | null };

export function CertificationSection({
  certifications,
  onChange,
}: {
  certifications: Certification[];
  onChange: (certifications: Certification[]) => void;
}) {
  const [form, setForm] = useState({ name: "", issuer: "", date: "" });
  const [error, setError] = useState<string | null>(null);

  async function addCertification(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setError(null);
    try {
      const created = await apiFetch<Certification>("/api/memory/certification", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          issuer: form.issuer.trim() || null,
          date: form.date.trim() || null,
        }),
      });
      onChange([...certifications, created]);
      setForm({ name: "", issuer: "", date: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add certification");
    }
  }

  async function remove(id: string) {
    await apiFetch(`/api/memory/certification/${id}`, { method: "DELETE" });
    onChange(certifications.filter((c) => c.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={addCertification} className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Issuer">
          <Input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
        </Field>
        <Field label="Date">
          <Input
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            placeholder="e.g. 2023"
          />
        </Field>
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-sm text-match-bad">{error}</p>}

      {certifications.length === 0 ? (
        <EmptyState text="No certifications yet." />
      ) : (
        <ul className="flex flex-col divide-y divide-rule border-y border-rule">
          {certifications.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-3">
              <span className="text-sm text-ink">
                {c.name}
                {c.issuer && <span className="text-ink-soft"> · {c.issuer}</span>}
                {c.date && <span className="text-ink-faint"> · {c.date}</span>}
              </span>
              <button onClick={() => remove(c.id)} className="text-xs text-ink-faint hover:text-match-bad">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
