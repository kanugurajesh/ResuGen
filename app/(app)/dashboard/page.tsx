import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getMemoryBank } from "@/lib/memory/store";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge, ApplicationStatus } from "@/components/StatusBadge";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [bank, applications] = await Promise.all([
    getMemoryBank(userId),
    prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const bulletCount =
    bank.experiences.reduce((n, e) => n + e.bullets.length, 0) +
    bank.projects.reduce((n, p) => n + p.bullets.length, 0);

  const statusCounts = applications.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Dashboard</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
        </div>
        <LinkButton href="/applications/new">+ New application</LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          eyebrow="memory bank"
          value={String(bank.experiences.length + bank.projects.length)}
          label={`positions/projects · ${bulletCount} bullets · ${bank.skills.length} skills`}
          href="/memory"
          cta={bulletCount === 0 ? "Add your first entry →" : "Manage →"}
        />
        <StatCard
          eyebrow="applications"
          value={String(applications.length)}
          label={
            Object.keys(statusCounts).length
              ? Object.entries(statusCounts)
                  .map(([s, n]) => `${n} ${s.toLowerCase()}`)
                  .join(" · ")
              : "none yet"
          }
          href="/applications"
          cta="View tracker →"
        />
      </div>

      <div>
        <h2 className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Recent applications
        </h2>
        {applications.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">
            Nothing yet. Paste a job description to compile your first tailored resume.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-rule border-y border-rule">
            {applications.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/applications/${a.id}`}
                  className="flex items-center justify-between px-1 py-3 hover:bg-rule/20"
                >
                  <span className="text-sm text-ink">
                    {a.role} <span className="text-ink-faint">at</span> {a.company}
                  </span>
                  <StatusBadge status={a.status as ApplicationStatus} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  eyebrow,
  value,
  label,
  href,
  cta,
}: {
  eyebrow: string;
  value: string;
  label: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-sm border border-rule bg-paper-raised p-5 hover:border-accent"
    >
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-faint">{eyebrow}</p>
      <p className="font-display text-3xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
      <span className="mt-1 text-xs text-accent">{cta}</span>
    </Link>
  );
}
