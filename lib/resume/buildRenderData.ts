import { MemoryBank } from "@/lib/memory/store";
import { TailoredResume } from "@/lib/llm/schemas";

export type ResumeRenderData = {
  profile: {
    fullName: string;
    headline: string;
    phone: string | null;
    location: string | null;
    email: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
  };
  summary: string;
  skills: string[];
  experiences: {
    title: string;
    company: string;
    location: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
    bullets: string[];
  }[];
  projects: {
    name: string;
    description: string | null;
    link: string | null;
    startDate: string | null;
    endDate: string | null;
    bullets: string[];
  }[];
  educations: {
    school: string;
    degree: string;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    gpa: string | null;
  }[];
  certifications: { name: string; issuer: string | null; date: string | null }[];
};

export function buildResumeRenderData(bank: MemoryBank, tailored: TailoredResume): ResumeRenderData {
  const experienceById = new Map(bank.experiences.map((e) => [e.id, e]));
  const projectById = new Map(bank.projects.map((p) => [p.id, p]));

  return {
    profile: {
      fullName: bank.profile?.fullName || "Your Name",
      headline: tailored.headline || bank.profile?.headline || "",
      phone: bank.profile?.phone ?? null,
      location: bank.profile?.location ?? null,
      email: bank.profile?.email ?? null,
      linkedin: bank.profile?.linkedin ?? null,
      github: bank.profile?.github ?? null,
      website: bank.profile?.website ?? null,
    },
    summary: tailored.summary,
    skills: tailored.skills,
    experiences: tailored.experiences
      .map((sel) => {
        const source = experienceById.get(sel.id);
        if (!source) return null;
        return {
          title: source.title,
          company: source.company,
          location: source.location,
          startDate: source.startDate,
          endDate: source.endDate,
          current: source.current,
          bullets: sel.bullets.map((b) => b.text),
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null),
    projects: tailored.projects
      .map((sel) => {
        const source = projectById.get(sel.id);
        if (!source) return null;
        return {
          name: source.name,
          description: source.description,
          link: source.link,
          startDate: source.startDate,
          endDate: source.endDate,
          bullets: sel.bullets.map((b) => b.text),
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null),
    educations: bank.educations,
    certifications: bank.certifications,
  };
}
