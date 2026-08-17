const tones = {
  neutral: "bg-rule/40 text-ink-soft",
  accent: "bg-accent-soft text-accent-strong",
  good: "bg-match-good-soft text-match-good",
  warn: "bg-match-warn-soft text-match-warn",
  bad: "bg-match-bad-soft text-match-bad",
};

export function Chip({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof tones;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 font-mono text-[11px] tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
