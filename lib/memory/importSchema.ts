import { z } from "zod";

const nullableString = z.string().nullable().optional();

export const importConfirmSchema = z.object({
  profile: z.object({
    fullName: nullableString,
    headline: nullableString,
    phone: nullableString,
    location: nullableString,
    email: nullableString,
    linkedin: nullableString,
    github: nullableString,
    website: nullableString,
    summary: nullableString,
  }),
  experiences: z.array(
    z.object({
      company: z.string().min(1),
      title: z.string().min(1),
      location: nullableString,
      startDate: z.string().min(1),
      endDate: nullableString,
      current: z.boolean(),
      bullets: z.array(z.string().min(1)),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      description: nullableString,
      link: nullableString,
      startDate: nullableString,
      endDate: nullableString,
      bullets: z.array(z.string().min(1)),
    })
  ),
  education: z.array(
    z.object({
      school: z.string().min(1),
      degree: z.string().min(1),
      field: nullableString,
      startDate: nullableString,
      endDate: nullableString,
      gpa: nullableString,
    })
  ),
  certifications: z.array(
    z.object({
      name: z.string().min(1),
      issuer: nullableString,
      date: nullableString,
    })
  ),
  skills: z.array(
    z.object({
      name: z.string().min(1),
      category: nullableString,
    })
  ),
});

export type ImportConfirmPayload = z.infer<typeof importConfirmSchema>;
