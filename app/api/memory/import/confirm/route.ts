import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/db";
import { importConfirmSchema } from "@/lib/memory/importSchema";

export const POST = withAuth(async (req, userId) => {
  const data = importConfirmSchema.parse(await req.json());

  await prisma.$transaction(async (tx) => {
    if (Object.values(data.profile).some((v) => v)) {
      await tx.profile.upsert({
        where: { userId },
        create: { userId, ...data.profile },
        update: data.profile,
      });
    }

    for (const exp of data.experiences) {
      await tx.experience.create({
        data: {
          userId,
          company: exp.company,
          title: exp.title,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.current ? null : exp.endDate,
          current: exp.current,
          bullets: { create: exp.bullets.map((text) => ({ text, tags: "" })) },
        },
      });
    }

    for (const proj of data.projects) {
      await tx.project.create({
        data: {
          userId,
          name: proj.name,
          description: proj.description,
          link: proj.link,
          startDate: proj.startDate,
          endDate: proj.endDate,
          bullets: { create: proj.bullets.map((text) => ({ text, tags: "" })) },
        },
      });
    }

    for (const edu of data.education) {
      await tx.education.create({ data: { userId, ...edu } });
    }

    for (const cert of data.certifications) {
      await tx.certification.create({ data: { userId, ...cert } });
    }

    for (const skill of data.skills) {
      await tx.skill.create({ data: { userId, ...skill } });
    }
  });

  return NextResponse.json({ ok: true });
});
