import { z } from "zod";

const bulletSchema = z.object({ bulletId: z.string(), text: z.string().min(1) });
const sectionSchema = z.object({ id: z.string(), bullets: z.array(bulletSchema) });

export const tailoredResumeInputSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  experiences: z.array(sectionSchema),
  projects: z.array(sectionSchema),
});

export const saveResumeSchema = z.object({
  tailored: tailoredResumeInputSchema,
  matchScoreBefore: z.number().optional().nullable(),
  matchScoreAfter: z.number().optional().nullable(),
  missingKeywords: z.array(z.string()).optional().default([]),
  templateId: z.string().optional().default("classic"),
});
