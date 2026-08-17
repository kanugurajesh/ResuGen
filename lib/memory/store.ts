import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";
import { parseTags, serializeTags } from "@/lib/memory/tags";
import {
  ResourceKey,
  resourceSchemas,
  bulletSchema,
  experienceSchema,
  projectSchema,
  educationSchema,
  certificationSchema,
  skillSchema,
} from "@/lib/memory/schemas";

export type MemoryBullet = { id: string; text: string; tags: string[] };
export type MemoryExperience = {
  id: string;
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: MemoryBullet[];
};
export type MemoryProject = {
  id: string;
  name: string;
  description: string | null;
  link: string | null;
  startDate: string | null;
  endDate: string | null;
  bullets: MemoryBullet[];
};

export type MemoryBank = {
  profile: {
    fullName: string | null;
    headline: string | null;
    phone: string | null;
    location: string | null;
    email: string | null;
    linkedin: string | null;
    github: string | null;
    website: string | null;
    summary: string | null;
  } | null;
  experiences: MemoryExperience[];
  projects: MemoryProject[];
  educations: {
    id: string;
    school: string;
    degree: string;
    field: string | null;
    startDate: string | null;
    endDate: string | null;
    gpa: string | null;
  }[];
  certifications: { id: string; name: string; issuer: string | null; date: string | null }[];
  skills: { id: string; name: string; category: string | null }[];
};

export async function getMemoryBank(userId: string): Promise<MemoryBank> {
  const [profile, experiences, projects, educations, certifications, skills] =
    await Promise.all([
      prisma.profile.findUnique({ where: { userId } }),
      prisma.experience.findMany({
        where: { userId },
        include: { bullets: true },
        orderBy: { startDate: "desc" },
      }),
      prisma.project.findMany({
        where: { userId },
        include: { bullets: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.education.findMany({ where: { userId } }),
      prisma.certification.findMany({ where: { userId } }),
      prisma.skill.findMany({ where: { userId } }),
    ]);

  return {
    profile,
    experiences: experiences.map((e) => ({
      ...e,
      bullets: e.bullets.map((b) => ({ id: b.id, text: b.text, tags: parseTags(b.tags) })),
    })),
    projects: projects.map((p) => ({
      ...p,
      bullets: p.bullets.map((b) => ({ id: b.id, text: b.text, tags: parseTags(b.tags) })),
    })),
    educations,
    certifications,
    skills,
  };
}

export function isMemoryBankEmpty(bank: MemoryBank): boolean {
  return (
    bank.experiences.length === 0 &&
    bank.projects.length === 0 &&
    bank.skills.length === 0 &&
    bank.educations.length === 0
  );
}

async function assertOwnsExperience(userId: string, experienceId: string) {
  const exp = await prisma.experience.findUnique({ where: { id: experienceId } });
  if (!exp || exp.userId !== userId) throw new ApiError(404, "Experience not found");
}

async function assertOwnsProject(userId: string, projectId: string) {
  const proj = await prisma.project.findUnique({ where: { id: projectId } });
  if (!proj || proj.userId !== userId) throw new ApiError(404, "Project not found");
}

export async function createResource(
  userId: string,
  resource: ResourceKey,
  rawData: unknown
) {
  switch (resource) {
    case "experience": {
      const data = experienceSchema.parse(rawData);
      return prisma.experience.create({
        data: {
          userId,
          company: data.company,
          title: data.title,
          location: data.location,
          startDate: data.startDate,
          endDate: data.current ? null : data.endDate,
          current: data.current,
          bullets: { create: data.bullets.map((text) => ({ text, tags: "" })) },
        },
        include: { bullets: true },
      });
    }
    case "project": {
      const data = projectSchema.parse(rawData);
      return prisma.project.create({
        data: {
          userId,
          name: data.name,
          description: data.description,
          link: data.link,
          startDate: data.startDate,
          endDate: data.endDate,
          bullets: { create: data.bullets.map((text) => ({ text, tags: "" })) },
        },
        include: { bullets: true },
      });
    }
    case "education": {
      const data = educationSchema.parse(rawData);
      return prisma.education.create({ data: { userId, ...data } });
    }
    case "certification": {
      const data = certificationSchema.parse(rawData);
      return prisma.certification.create({ data: { userId, ...data } });
    }
    case "skill": {
      const data = skillSchema.parse(rawData);
      return prisma.skill.create({ data: { userId, ...data } });
    }
    case "bullet": {
      const data = bulletSchema.parse(rawData);
      if (!data.experienceId && !data.projectId) {
        throw new ApiError(400, "Bullet must belong to an experience or project");
      }
      if (data.experienceId) await assertOwnsExperience(userId, data.experienceId);
      if (data.projectId) await assertOwnsProject(userId, data.projectId);
      return prisma.bullet.create({
        data: {
          text: data.text,
          tags: serializeTags(data.tags),
          experienceId: data.experienceId ?? null,
          projectId: data.projectId ?? null,
        },
      });
    }
    default: {
      const _exhaustive: never = resource;
      throw new ApiError(400, `Unknown resource: ${_exhaustive}`);
    }
  }
}

export async function updateResource(
  userId: string,
  resource: ResourceKey,
  id: string,
  rawData: unknown
) {
  switch (resource) {
    case "experience": {
      const data = experienceSchema.partial().parse(rawData);
      await assertOwnsExperience(userId, id);
      return prisma.experience.update({
        where: { id },
        data: {
          company: data.company,
          title: data.title,
          location: data.location,
          startDate: data.startDate,
          endDate: data.current ? null : data.endDate,
          current: data.current,
        },
        include: { bullets: true },
      });
    }
    case "project": {
      const data = projectSchema.partial().parse(rawData);
      await assertOwnsProject(userId, id);
      return prisma.project.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          link: data.link,
          startDate: data.startDate,
          endDate: data.endDate,
        },
        include: { bullets: true },
      });
    }
    case "education": {
      const data = educationSchema.partial().parse(rawData);
      await assertOwns(prisma.education, userId, id, "Education");
      return prisma.education.update({ where: { id }, data });
    }
    case "certification": {
      const data = certificationSchema.partial().parse(rawData);
      await assertOwns(prisma.certification, userId, id, "Certification");
      return prisma.certification.update({ where: { id }, data });
    }
    case "skill": {
      const data = skillSchema.partial().parse(rawData);
      await assertOwns(prisma.skill, userId, id, "Skill");
      return prisma.skill.update({ where: { id }, data });
    }
    case "bullet": {
      const data = bulletSchema.partial().parse(rawData);
      const bullet = await prisma.bullet.findUnique({
        where: { id },
        include: { experience: true, project: true },
      });
      if (!bullet) throw new ApiError(404, "Bullet not found");
      const ownerId = bullet.experience?.userId ?? bullet.project?.userId;
      if (ownerId !== userId) throw new ApiError(404, "Bullet not found");
      return prisma.bullet.update({
        where: { id },
        data: {
          text: data.text,
          tags: data.tags ? serializeTags(data.tags) : undefined,
        },
      });
    }
    default: {
      const _exhaustive: never = resource;
      throw new ApiError(400, `Unknown resource: ${_exhaustive}`);
    }
  }
}

export async function deleteResource(userId: string, resource: ResourceKey, id: string) {
  switch (resource) {
    case "experience":
      await assertOwnsExperience(userId, id);
      return prisma.experience.delete({ where: { id } });
    case "project":
      await assertOwnsProject(userId, id);
      return prisma.project.delete({ where: { id } });
    case "education":
      await assertOwns(prisma.education, userId, id, "Education");
      return prisma.education.delete({ where: { id } });
    case "certification":
      await assertOwns(prisma.certification, userId, id, "Certification");
      return prisma.certification.delete({ where: { id } });
    case "skill":
      await assertOwns(prisma.skill, userId, id, "Skill");
      return prisma.skill.delete({ where: { id } });
    case "bullet": {
      const bullet = await prisma.bullet.findUnique({
        where: { id },
        include: { experience: true, project: true },
      });
      if (!bullet) throw new ApiError(404, "Bullet not found");
      const ownerId = bullet.experience?.userId ?? bullet.project?.userId;
      if (ownerId !== userId) throw new ApiError(404, "Bullet not found");
      return prisma.bullet.delete({ where: { id } });
    }
    default: {
      const _exhaustive: never = resource;
      throw new ApiError(400, `Unknown resource: ${_exhaustive}`);
    }
  }
}

async function assertOwns(
  model: { findUnique: (args: { where: { id: string } }) => Promise<{ userId: string } | null> },
  userId: string,
  id: string,
  label: string
) {
  const row = await model.findUnique({ where: { id } });
  if (!row || row.userId !== userId) throw new ApiError(404, `${label} not found`);
}

export function isResourceKey(value: string): value is ResourceKey {
  return value in resourceSchemas;
}

export async function updateProfile(userId: string, rawData: unknown) {
  const { profileSchema } = await import("@/lib/memory/schemas");
  const data = profileSchema.parse(rawData);
  return prisma.profile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export type { ResourceKey };
