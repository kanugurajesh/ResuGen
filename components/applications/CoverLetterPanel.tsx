"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";

type CoverLetter = { id: string; content: string; createdAt: string };

export function CoverLetterPanel({
  applicationId,
  existing,
  disabled,
}: {
  applicationId: string;
  existing: CoverLetter | null;
  disabled: boolean;
}) {
  const [letter, setLetter] = useState(existing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const created = await apiFetch<CoverLetter>(`/api/applications/${applicationId}/cover-letter`, {
        method: "POST",
      });
      setLetter(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate cover letter");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Cover letter</p>
      {letter ? (
        <div className="mt-3 flex flex-col gap-3">
          <pre className="whitespace-pre-wrap rounded-sm border border-rule bg-paper-raised p-4 font-sans text-sm leading-6 text-ink">
            {letter.content}
          </pre>
          <Button onClick={generate} disabled={loading || disabled} variant="secondary" className="w-fit">
            {loading ? "Regenerating…" : "Regenerate"}
          </Button>
        </div>
      ) : (
        <div className="mt-3">
          <p className="max-w-lg text-sm text-ink-soft">
            Generate a cover letter grounded in the same memory bank and job analysis.
          </p>
          <Button onClick={generate} disabled={loading || disabled} className="mt-3 w-fit">
            {loading ? "Generating…" : "Generate cover letter"}
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-match-bad">{error}</p>}
    </div>
  );
}
