"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/apiClient";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MatchScore } from "@/components/MatchScore";
import { TailorResult, TailoredResume, ResumeRecord } from "@/components/applications/types";

export function TailorPanel({
  applicationId,
  sourceLabels,
  onResumeSaved,
}: {
  applicationId: string;
  sourceLabels: Record<string, string>;
  onResumeSaved: (resume: ResumeRecord) => void;
}) {
  const [result, setResult] = useState<TailorResult | null>(null);
  const [tailored, setTailored] = useState<TailoredResume | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runTailor() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<TailorResult>(`/api/applications/${applicationId}/tailor`, {
        method: "POST",
      });
      setResult(res);
      setTailored(res.tailored);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tailoring failed");
    } finally {
      setLoading(false);
    }
  }

  async function generatePdf() {
    if (!tailored || !result) return;
    setGenerating(true);
    setError(null);
    try {
      const resume = await apiFetch<ResumeRecord>(`/api/applications/${applicationId}/resumes`, {
        method: "POST",
        body: JSON.stringify({
          tailored,
          matchScoreBefore: result.matchScoreBefore,
          matchScoreAfter: result.matchScoreAfter,
          missingKeywords: result.missingKeywords,
          templateId: "classic",
        }),
      });
      onResumeSaved(resume);
      setResult(null);
      setTailored(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (!tailored || !result) {
    return (
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Tailor</p>
        <p className="mt-2 max-w-lg text-sm text-ink-soft">
          Runs the job description against your memory bank: picks the most relevant experience,
          reorders it, and rewrites bullets to align with the role&apos;s keywords — using only
          facts already in your memory bank.
        </p>
        {error && <p className="mt-2 text-sm text-match-bad">{error}</p>}
        <Button onClick={runTailor} disabled={loading} className="mt-4 w-fit">
          {loading ? "Tailoring…" : "Tailor resume"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
          Tailored draft — edit anything before compiling
        </p>
        <div className="mt-2">
          <MatchScore
            before={result.matchScoreBefore}
            after={result.matchScoreAfter}
            missingKeywords={result.missingKeywords}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-sm border border-rule bg-paper-raised p-5">
        <input
          value={tailored.headline}
          onChange={(e) => setTailored({ ...tailored, headline: e.target.value })}
          className="font-display text-lg font-semibold text-ink outline-none focus:border-b focus:border-accent"
        />
        <textarea
          value={tailored.summary}
          onChange={(e) => setTailored({ ...tailored, summary: e.target.value })}
          rows={3}
          className="w-full rounded-sm border border-rule-strong bg-paper px-2.5 py-2 text-sm"
        />

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">Skills</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tailored.skills.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1">
                <Chip tone="accent">{s}</Chip>
                <button
                  onClick={() =>
                    setTailored({ ...tailored, skills: tailored.skills.filter((_, j) => j !== i) })
                  }
                  className="text-xs text-ink-faint hover:text-match-bad"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {tailored.experiences.length > 0 && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Experience
            </p>
            <div className="mt-2 flex flex-col gap-4">
              {tailored.experiences.map((section, si) => (
                <div key={section.id}>
                  <p className="font-mono text-[11px] text-ink-faint">
                    sourced from: {sourceLabels[section.id] ?? section.id}
                  </p>
                  <ul className="mt-1 flex flex-col gap-1.5">
                    {section.bullets.map((b, bi) => (
                      <li key={b.bulletId}>
                        <textarea
                          value={b.text}
                          onChange={(e) => {
                            const next = { ...tailored };
                            next.experiences = [...next.experiences];
                            next.experiences[si] = {
                              ...section,
                              bullets: section.bullets.map((bullet, j) =>
                                j === bi ? { ...bullet, text: e.target.value } : bullet
                              ),
                            };
                            setTailored(next);
                          }}
                          rows={2}
                          className="w-full rounded-sm border border-rule-strong bg-paper px-2 py-1.5 text-sm"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {tailored.projects.length > 0 && (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">
              Projects
            </p>
            <div className="mt-2 flex flex-col gap-4">
              {tailored.projects.map((section, si) => (
                <div key={section.id}>
                  <p className="font-mono text-[11px] text-ink-faint">
                    sourced from: {sourceLabels[section.id] ?? section.id}
                  </p>
                  <ul className="mt-1 flex flex-col gap-1.5">
                    {section.bullets.map((b, bi) => (
                      <li key={b.bulletId}>
                        <textarea
                          value={b.text}
                          onChange={(e) => {
                            const next = { ...tailored };
                            next.projects = [...next.projects];
                            next.projects[si] = {
                              ...section,
                              bullets: section.bullets.map((bullet, j) =>
                                j === bi ? { ...bullet, text: e.target.value } : bullet
                              ),
                            };
                            setTailored(next);
                          }}
                          rows={2}
                          className="w-full rounded-sm border border-rule-strong bg-paper px-2 py-1.5 text-sm"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-match-bad">{error}</p>}
      <div className="flex items-center gap-3">
        <Button onClick={generatePdf} disabled={generating} className="w-fit">
          {generating ? "Compiling…" : "Compile PDF"}
        </Button>
        <button
          onClick={() => {
            setResult(null);
            setTailored(null);
          }}
          className="text-xs text-ink-soft hover:text-ink"
        >
          Discard draft
        </button>
      </div>
    </div>
  );
}
