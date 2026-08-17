import { Chip } from "@/components/ui/Chip";

function toneFor(score: number): "good" | "warn" | "bad" {
  if (score >= 75) return "good";
  if (score >= 45) return "warn";
  return "bad";
}

function textToneClass(score: number): string {
  const tone = toneFor(score);
  return tone === "good" ? "text-match-good" : tone === "warn" ? "text-match-warn" : "text-match-bad";
}

function ScoreBar({ value }: { value: number }) {
  const tone = toneFor(value);
  const barColor =
    tone === "good" ? "bg-match-good" : tone === "warn" ? "bg-match-warn" : "bg-match-bad";
  return (
    <span className="inline-block h-1.5 w-20 overflow-hidden rounded-full bg-rule align-middle">
      <span className={`block h-full ${barColor}`} style={{ width: `${Math.min(100, value)}%` }} />
    </span>
  );
}

export function MatchScore({
  before,
  after,
  missingKeywords = [],
}: {
  before?: number | null;
  after?: number | null;
  missingKeywords?: string[];
}) {
  if (before == null && after == null) return null;

  return (
    <div className="font-mono text-xs">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="uppercase tracking-wide text-ink-faint">Match</span>
        {before != null && (
          <span className="flex items-center gap-1.5">
            <ScoreBar value={before} />
            <span className={textToneClass(before)}>{before}%</span>
          </span>
        )}
        {before != null && after != null && <span className="text-ink-faint">&rarr;</span>}
        {after != null && (
          <span className="flex items-center gap-1.5">
            <ScoreBar value={after} />
            <span className={textToneClass(after)}>{after}%</span>
          </span>
        )}
      </div>
      {missingKeywords.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-ink-faint">unresolved:</span>
          {missingKeywords.map((k) => (
            <Chip key={k} tone="warn">
              {k}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
