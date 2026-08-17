"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/field";

export default function NewApplicationPage() {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const application = await apiFetch<{ id: string }>("/api/applications", {
        method: "POST",
        body: JSON.stringify({ company, role, jobDescription }),
      });
      router.push(`/applications/${application.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save application");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Applications</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">New application</h1>
        <p className="mt-1 max-w-xl text-sm text-ink-soft">
          Paste the job description as-is. We&apos;ll parse it for keywords and tailor a resume
          from your memory bank on the next step.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Company">
            <Input value={company} onChange={(e) => setCompany(e.target.value)} required />
          </Field>
          <Field label="Role">
            <Input value={role} onChange={(e) => setRole(e.target.value)} required />
          </Field>
        </div>
        <Field label="Job description">
          <Textarea
            rows={14}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            minLength={20}
            className="font-mono text-xs"
          />
        </Field>
        {error && <p className="text-sm text-match-bad">{error}</p>}
        <Button type="submit" disabled={loading} className="w-fit">
          {loading ? "Saving…" : "Save & continue"}
        </Button>
      </form>
    </div>
  );
}
