export function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-sm border border-dashed border-rule-strong p-6 text-center text-sm text-ink-faint">
      {text}
    </div>
  );
}
