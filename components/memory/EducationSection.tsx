"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/EmptyState";

type Education = {
  id: string;
  school: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  gpa: string | null;
};

const EMPTY = { school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" };

export function EducationSection({
  educations,
  onChange,
}: {
  educations: Education[];
  onChange: (educations: Education[]) => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function addEducation(e: React.FormEvent) {
    e.preventDefault();
    if (!form.school.trim() || !form.degree.trim()) return;
    setError(null);
    try {
      const created = await apiFetch<Education>("/api/memory/education", {
        method: "POST",
        body: JSON.stringify({
          school: form.school.trim(),
          degree: form.degree.trim(),
          field: form.field.trim() || null,
          startDate: form.startDate.trim() || null,
          endDate: form.endDate.trim() || null,
          gpa: form.gpa.trim() || null,
        }),
      });
      onChange([...educations, created]);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add education");
    }
  }

  async function remove(id: string) {
    await apiFetch(`/api/memory/education/${id}`, { method: "DELETE" });
    onChange(educations.filter((e) => e.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={addEducation} className="rounded-sm border border-rule bg-paper-raised p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="School">
            <Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
          </Field>
          <Field label="Degree">
            <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
          </Field>
          <Field label="Field of study">
            <Input value={form.field} onChange={(e) => setForm({ ...form, field: e.target.value })} />
          </Field>
          <Field label="Start">
            <Input value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="End">
            <Input value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Field>
          <Field label="GPA (optional)">
            <Input value={form.gpa} onChange={(e) => setForm({ ...form, gpa: e.target.value })} />
          </Field>
        </div>
        <Button type="submit" className="mt-3">
          Add education
        </Button>
      </form>
      {error && <p className="text-sm text-match-bad">{error}</p>}

      {educations.length === 0 ? (
        <EmptyState text="No education added yet." />
      ) : (
        <ul className="flex flex-col divide-y divide-rule border-y border-rule">
          {educations.map((edu) => (
            <li key={edu.id} className="flex items-center justify-between py-3">
              <span className="text-sm text-ink">
                <strong>{edu.degree}</strong>
                {edu.field && `, ${edu.field}`} <span className="text-ink-soft">— {edu.school}</span>
              </span>
              <button onClick={() => remove(edu.id)} className="text-xs text-ink-faint hover:text-match-bad">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
