"use client";

import { useState } from "react";
import { ResumeRecord } from "@/components/applications/types";
import { MatchScore } from "@/components/MatchScore";

export function ResumeList({ resumes }: { resumes: ResumeRecord[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(resumes[0]?.id ?? null);

  return (
    <div className="mt-3 flex flex-col gap-3">
      {resumes.map((resume) => {
        const missing = resume.missingKeywords ? (JSON.parse(resume.missingKeywords) as string[]) : [];
        const expanded = expandedId === resume.id;
        return (
          <div key={resume.id} className="rounded-sm border border-rule bg-paper-raised p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] text-ink-faint">
                  {new Date(resume.createdAt).toLocaleString()}
                </p>
                <div className="mt-1">
                  <MatchScore
                    before={resume.matchScoreBefore}
                    after={resume.matchScoreAfter}
                    missingKeywords={missing}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => setExpandedId(expanded ? null : resume.id)}
                  className="text-ink-soft hover:text-accent"
                >
                  {expanded ? "Hide preview" : "Preview"}
                </button>
                <a
                  href={`/api/resumes/${resume.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  Download PDF
                </a>
                <a
                  href={`/api/resumes/${resume.id}/tex`}
                  className="text-ink-soft hover:text-accent"
                >
                  Download .tex
                </a>
              </div>
            </div>
            {expanded && (
              <iframe
                src={`/api/resumes/${resume.id}/pdf`}
                className="mt-4 h-[600px] w-full rounded-sm border border-rule"
                title="Resume preview"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
