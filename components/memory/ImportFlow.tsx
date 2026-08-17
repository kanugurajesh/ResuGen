"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/field";

type Draft = {
  profile: {
    fullName: string | null;
    headline: string | null;
    phone: string | null;
    location: string | null;
    email: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
    summary: string | null;
  };
  experiences: {
    company: string;
    title: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    bullets: string[];
  }[];
  projects: {
    name: string;
    description: string | null;
    link: string | null;
    startDate: string | null;
    endDate: string | null;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    gpa: string | null;
  }[];
  certifications: { name: string; issuer: string | null; date: string | null }[];
  skills: { name: string; category: string | null }[];
};

export function ImportFlow() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze() {
    if (resumeText.trim().length < 20) {
      setError("Paste more of your resume text — at least a couple of sentences.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<Draft>("/api/memory/import", {
        method: "POST",
        body: JSON.stringify({ resumeText }),
      });
      setDraft(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze resume text");
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/memory/import/confirm", { method: "POST", body: JSON.stringify(draft) });
      router.push("/memory");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  if (!draft) {
    return (
      <div className="flex flex-col gap-4">
        <Field label="Resume text">
          <Textarea
            rows={16}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste the full text of your current resume here…"
            className="font-mono text-xs"
          />
        </Field>
        {error && <p className="text-sm text-match-bad">{error}</p>}
        <Button onClick={analyze} disabled={loading} className="w-fit">
          {loading ? "Analyzing…" : "Analyze resume"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <p className="rounded-sm border border-accent-soft bg-accent-soft px-3 py-2 text-xs text-accent-strong">
        Review what was extracted below. Remove anything wrong before saving — nothing is written
        to your memory bank until you confirm.
      </p>

      <Section title="Profile">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              ["fullName", "Full name"],
              ["headline", "Headline"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["location", "Location"],
              ["linkedin", "LinkedIn"],
              ["github", "GitHub"],
              ["website", "Website"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <Input
                value={draft.profile[key] ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, profile: { ...draft.profile, [key]: e.target.value } })
                }
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title={`Experience (${draft.experiences.length})`}>
        {draft.experiences.map((exp, i) => (
          <RemovableCard
            key={i}
            onRemove={() => setDraft({ ...draft, experiences: draft.experiences.filter((_, j) => j !== i) })}
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              <input
                className="rounded-sm border border-rule-strong bg-paper px-2 py-1"
                value={exp.title}
                onChange={(e) =>
                  updateAt(draft, setDraft, "experiences", i, { title: e.target.value })
                }
              />
              <input
                className="rounded-sm border border-rule-strong bg-paper px-2 py-1"
                value={exp.company}
                onChange={(e) =>
                  updateAt(draft, setDraft, "experiences", i, { company: e.target.value })
                }
              />
            </div>
            <textarea
              className="mt-2 w-full rounded-sm border border-rule-strong bg-paper px-2 py-1 font-mono text-xs"
              rows={Math.max(2, exp.bullets.length)}
              value={exp.bullets.join("\n")}
              onChange={(e) =>
                updateAt(draft, setDraft, "experiences", i, {
                  bullets: e.target.value.split("\n").filter((b) => b.trim()),
                })
              }
            />
          </RemovableCard>
        ))}
      </Section>

      <Section title={`Projects (${draft.projects.length})`}>
        {draft.projects.map((proj, i) => (
          <RemovableCard
            key={i}
            onRemove={() => setDraft({ ...draft, projects: draft.projects.filter((_, j) => j !== i) })}
          >
            <input
              className="w-full rounded-sm border border-rule-strong bg-paper px-2 py-1 text-sm"
              value={proj.name}
              onChange={(e) => updateAt(draft, setDraft, "projects", i, { name: e.target.value })}
            />
            <textarea
              className="mt-2 w-full rounded-sm border border-rule-strong bg-paper px-2 py-1 font-mono text-xs"
              rows={Math.max(2, proj.bullets.length)}
              value={proj.bullets.join("\n")}
              onChange={(e) =>
                updateAt(draft, setDraft, "projects", i, {
                  bullets: e.target.value.split("\n").filter((b) => b.trim()),
                })
              }
            />
          </RemovableCard>
        ))}
      </Section>

      <Section title={`Education (${draft.education.length})`}>
        {draft.education.map((edu, i) => (
          <RemovableCard
            key={i}
            onRemove={() => setDraft({ ...draft, education: draft.education.filter((_, j) => j !== i) })}
          >
            <p className="text-sm text-ink">
              {edu.degree}
              {edu.field && `, ${edu.field}`} — {edu.school}
            </p>
          </RemovableCard>
        ))}
      </Section>

      <Section title={`Skills (${draft.skills.length})`}>
        <div className="flex flex-wrap gap-2">
          {draft.skills.map((s, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-sm bg-rule/40 px-2 py-1 font-mono text-xs"
            >
              {s.name}
              <button
                onClick={() => setDraft({ ...draft, skills: draft.skills.filter((_, j) => j !== i) })}
                className="text-ink-faint hover:text-match-bad"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </Section>

      {error && <p className="text-sm text-match-bad">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={confirm} disabled={saving} className="w-fit">
          {saving ? "Saving…" : "Save to memory bank"}
        </Button>
        <button onClick={() => setDraft(null)} className="text-xs text-ink-soft hover:text-ink">
          Start over
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{title}</p>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </div>
  );
}

function RemovableCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-sm border border-rule bg-paper-raised p-3">
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 text-xs text-ink-faint hover:text-match-bad"
      >
        Remove
      </button>
      {children}
    </div>
  );
}

function updateAt<K extends "experiences" | "projects">(
  draft: Draft,
  setDraft: (d: Draft) => void,
  key: K,
  index: number,
  patch: Partial<Draft[K][number]>
) {
  const next = [...draft[key]];
  next[index] = { ...next[index], ...patch };
  setDraft({ ...draft, [key]: next });
}
