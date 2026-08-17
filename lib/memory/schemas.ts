import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  github: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  location: z.string().optional().nullable(),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  current: z.boolean().default(false),
  bullets: z.array(z.string().min(1)).optional().default([]),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  bullets: z.array(z.string().min(1)).optional().default([]),
});

export const educationSchema = z.object({
  school: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  gpa: z.string().optional().nullable(),
});

export const certificationSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
});

export const skillSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().nullable(),
});

export const bulletSchema = z.object({
  text: z.string().min(1),
  tags: z.array(z.string()).default([]),
  experienceId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export const resourceSchemas = {
  experience: experienceSchema,
  project: projectSchema,
  education: educationSchema,
  certification: certificationSchema,
  skill: skillSchema,
  bullet: bulletSchema,
} as const;

export type ResourceKey = keyof typeof resourceSchemas;
