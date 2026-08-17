import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge, ApplicationStatus } from "@/components/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ApplicationsPage() {
  const session = await auth();
  const applications = await prisma.application.findMany({
    where: { userId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    include: { resumes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Applications</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Tracker</h1>
        </div>
        <LinkButton href="/applications/new">+ New application</LinkButton>
      </div>

      {applications.length === 0 ? (
        <EmptyState text="No applications yet. Paste a job description to get started." />
      ) : (
        <ul className="flex flex-col divide-y divide-rule border-y border-rule">
          {applications.map((a) => {
            const latest = a.resumes[0];
            return (
              <li key={a.id}>
                <Link
                  href={`/applications/${a.id}`}
                  className="flex items-center justify-between gap-4 px-1 py-4 hover:bg-rule/20"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {a.role} <span className="font-normal text-ink-faint">at</span> {a.company}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                      {latest ? `resume compiled · match ${latest.matchScoreAfter ?? "—"}%` : "not tailored yet"}
                    </p>
                  </div>
                  <StatusBadge status={a.status as ApplicationStatus} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
