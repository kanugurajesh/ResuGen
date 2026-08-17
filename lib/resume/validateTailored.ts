import { MemoryBank } from "@/lib/memory/store";
import { TailoredResume } from "@/lib/llm/schemas";

// Defensive pass over the LLM's tailoring output: drop any experience/project/bullet id
// that doesn't correspond to something real in the candidate's memory bank. This is the
// structural half of the anti-hallucination guardrail (the prompt is the other half).
export function sanitizeTailoredResume(tailored: TailoredResume, bank: MemoryBank): TailoredResume {
  const experienceIds = new Set(bank.experiences.map((e) => e.id));
  const projectIds = new Set(bank.projects.map((p) => p.id));
  const bulletIds = new Set([
    ...bank.experiences.flatMap((e) => e.bullets.map((b) => b.id)),
    ...bank.projects.flatMap((p) => p.bullets.map((b) => b.id)),
  ]);
  const knownSkills = new Set([
    ...bank.skills.map((s) => s.name.toLowerCase()),
    ...bank.experiences.flatMap((e) => e.bullets.flatMap((b) => b.tags.map((t) => t.toLowerCase()))),
    ...bank.projects.flatMap((p) => p.bullets.flatMap((b) => b.tags.map((t) => t.toLowerCase()))),
  ]);

  return {
    headline: tailored.headline,
    summary: tailored.summary,
    skills: tailored.skills.filter((s) => knownSkills.has(s.toLowerCase())),
    experiences: tailored.experiences
      .filter((e) => experienceIds.has(e.id))
      .map((e) => ({ id: e.id, bullets: e.bullets.filter((b) => bulletIds.has(b.bulletId)) }))
      .filter((e) => e.bullets.length > 0),
    projects: tailored.projects
      .filter((p) => projectIds.has(p.id))
      .map((p) => ({ id: p.id, bullets: p.bullets.filter((b) => bulletIds.has(b.bulletId)) }))
      .filter((p) => p.bullets.length > 0),
  };
}
