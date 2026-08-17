import { MemoryBank } from "@/lib/memory/store";
import { TailoredResume } from "@/lib/llm/schemas";

export function memoryBankToText(bank: MemoryBank): string {
  const parts: string[] = [];
  if (bank.profile?.headline) parts.push(bank.profile.headline);
  if (bank.profile?.summary) parts.push(bank.profile.summary);
  parts.push(...bank.skills.map((s) => s.name));
  for (const exp of bank.experiences) {
    parts.push(exp.title, exp.company);
    parts.push(...exp.bullets.map((b) => b.text));
    parts.push(...exp.bullets.flatMap((b) => b.tags));
  }
  for (const proj of bank.projects) {
    parts.push(proj.name);
    if (proj.description) parts.push(proj.description);
    parts.push(...proj.bullets.map((b) => b.text));
    parts.push(...proj.bullets.flatMap((b) => b.tags));
  }
  for (const edu of bank.educations) {
    parts.push(edu.degree, edu.school);
    if (edu.field) parts.push(edu.field);
  }
  parts.push(...bank.certifications.map((c) => c.name));
  return parts.filter(Boolean).join(" \n ");
}

export function tailoredResumeToText(tailored: TailoredResume): string {
  const parts: string[] = [tailored.headline, tailored.summary, ...tailored.skills];
  for (const section of [...tailored.experiences, ...tailored.projects]) {
    parts.push(...section.bullets.map((b) => b.text));
  }
  return parts.filter(Boolean).join(" \n ");
}
