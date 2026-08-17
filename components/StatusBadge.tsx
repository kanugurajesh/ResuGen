import { Chip } from "@/components/ui/Chip";

const STATUS_META = {
  SAVED: { label: "Saved", tone: "neutral" as const },
  APPLIED: { label: "Applied", tone: "accent" as const },
  INTERVIEW: { label: "Interview", tone: "good" as const },
  OFFER: { label: "Offer", tone: "good" as const },
  REJECTED: { label: "Rejected", tone: "bad" as const },
};

export type ApplicationStatus = keyof typeof STATUS_META;

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = STATUS_META[status];
  return <Chip tone={meta.tone}>{meta.label}</Chip>;
}

export const STATUS_ORDER: ApplicationStatus[] = ["SAVED", "APPLIED", "INTERVIEW", "OFFER"];
export { STATUS_META };
