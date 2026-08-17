"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationRecord } from "@/components/applications/types";
import { TailorPanel } from "@/components/applications/TailorPanel";
import { ResumeList } from "@/components/applications/ResumeList";
import { CoverLetterPanel } from "@/components/applications/CoverLetterPanel";
import { Textarea } from "@/components/ui/field";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"] as const;

export function ApplicationDetail({
  application,
  sourceLabels,
  memoryBankEmpty,
}: {
  application: ApplicationRecord;
  sourceLabels: Record<string, string>;
  memoryBankEmpty: boolean;
}) {
  const [app, setApp] = useState(application);
  const [notes, setNotes] = useState(app.notes ?? "");
  const [showJd, setShowJd] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  async function updateStatus(status: (typeof STATUSES)[number]) {
    const updated = await apiFetch<ApplicationRecord>(`/api/applications/${app.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setApp((a) => ({ ...a, status: updated.status }));
  }

  async function saveNotes() {
    setSavingNotes(true);
    try {
      await apiFetch(`/api/applications/${app.id}`, {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      });
    } finally {
      setSavingNotes(false);
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Application</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            {app.role} <span className="font-normal text-ink-faint">at</span> {app.company}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={app.status} />
          <select
            value={app.status}
            onChange={(e) => updateStatus(e.target.value as (typeof STATUSES)[number])}
            className="rounded-sm border border-rule-strong bg-paper-raised px-2 py-1.5 font-mono text-xs uppercase tracking-wide"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowJd((v) => !v)}
          className="font-mono text-[11px] uppercase tracking-wide text-ink-faint hover:text-ink-soft"
        >
          {showJd ? "Hide job description ▲" : "Show job description ▼"}
        </button>
        {showJd && (
          <pre className="mt-3 whitespace-pre-wrap rounded-sm border border-rule bg-paper-raised p-4 font-mono text-xs leading-5 text-ink-soft">
            {app.jobDescription}
          </pre>
        )}
      </div>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Notes</p>
        <Textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          placeholder="Interview notes, contacts, follow-ups…"
          className="mt-2"
        />
        {savingNotes && <p className="mt-1 text-xs text-ink-faint">Saving…</p>}
      </div>

      <hr className="border-rule" />

      {memoryBankEmpty ? (
        <p className="rounded-sm border border-match-warn-soft bg-match-warn-soft px-4 py-3 text-sm text-match-warn">
          Your memory bank is empty, so there&apos;s nothing to tailor yet.{" "}
          <a href="/memory" className="underline">
            Add your experience
          </a>{" "}
          first.
        </p>
      ) : (
        <TailorPanel
          applicationId={app.id}
          sourceLabels={sourceLabels}
          onResumeSaved={(resume) => setApp((a) => ({ ...a, resumes: [resume, ...a.resumes] }))}
        />
      )}

      {app.resumes.length > 0 && (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
            Compiled resumes
          </p>
          <ResumeList resumes={app.resumes} />
        </div>
      )}

      <hr className="border-rule" />

      <CoverLetterPanel
        applicationId={app.id}
        existing={app.coverLetters[0] ?? null}
        disabled={memoryBankEmpty}
      />
    </div>
  );
}
