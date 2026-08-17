"use client";

import { useState } from "react";
import Link from "next/link";
import type { MemoryBank } from "@/lib/memory/store";
import { ProfileSection } from "@/components/memory/ProfileSection";
import { ExperienceSection } from "@/components/memory/ExperienceSection";
import { ProjectSection } from "@/components/memory/ProjectSection";
import { EducationSection } from "@/components/memory/EducationSection";
import { CertificationSection } from "@/components/memory/CertificationSection";
import { SkillSection } from "@/components/memory/SkillSection";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "experience", label: "Experience" },
  { key: "projects", label: "Projects" },
  { key: "education", label: "Education" },
  { key: "certifications", label: "Certifications" },
  { key: "skills", label: "Skills" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function MemoryBankApp({ initialBank }: { initialBank: MemoryBank }) {
  const [bank, setBank] = useState(initialBank);
  const [tab, setTab] = useState<TabKey>(
    initialBank.experiences.length === 0 && initialBank.profile === null ? "profile" : "experience"
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">Memory bank</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
            Your source of truth
          </h1>
          <p className="mt-1 max-w-xl text-sm text-ink-soft">
            Every tailored resume is built only from what&apos;s here. Add real experience once,
            reuse it for every application.
          </p>
        </div>
        <Link
          href="/memory/import"
          className="whitespace-nowrap rounded-sm border border-rule-strong px-3 py-1.5 text-xs text-ink-soft hover:border-accent hover:text-accent"
        >
          Import from existing resume →
        </Link>
      </div>

      <div className="flex gap-1 border-b border-rule font-mono text-xs uppercase tracking-wide">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 transition-colors ${
              tab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-ink-faint hover:text-ink-soft"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "profile" && <ProfileSection profile={bank.profile} onSaved={(p) => setBank((b) => ({ ...b, profile: p }))} />}
        {tab === "experience" && (
          <ExperienceSection
            experiences={bank.experiences}
            onChange={(experiences) => setBank((b) => ({ ...b, experiences }))}
          />
        )}
        {tab === "projects" && (
          <ProjectSection
            projects={bank.projects}
            onChange={(projects) => setBank((b) => ({ ...b, projects }))}
          />
        )}
        {tab === "education" && (
          <EducationSection
            educations={bank.educations}
            onChange={(educations) => setBank((b) => ({ ...b, educations }))}
          />
        )}
        {tab === "certifications" && (
          <CertificationSection
            certifications={bank.certifications}
            onChange={(certifications) => setBank((b) => ({ ...b, certifications }))}
          />
        )}
        {tab === "skills" && (
          <SkillSection skills={bank.skills} onChange={(skills) => setBank((b) => ({ ...b, skills }))} />
        )}
      </div>
    </div>
  );
}
