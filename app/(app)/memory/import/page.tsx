import { ImportFlow } from "@/components/memory/ImportFlow";

export default function MemoryImportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Memory bank</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          Import from an existing resume
        </h1>
        <p className="mt-1 max-w-xl text-sm text-ink-soft">
          Paste your current resume as plain text. We&apos;ll extract your experience, projects,
          education, and skills — you review and edit before anything is saved.
        </p>
      </div>
      <ImportFlow />
    </div>
  );
}
