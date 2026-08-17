import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getOwnedApplication } from "@/lib/resume/ownership";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth<Ctx>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  await getOwnedApplication(userId, id);
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      resumes: { orderBy: { createdAt: "desc" } },
      coverLetters: { orderBy: { createdAt: "desc" } },
    },
  });
  return NextResponse.json(application);
});

const patchSchema = z.object({
  status: z.enum(["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"]).optional(),
  notes: z.string().optional().nullable(),
  appliedDate: z.string().datetime().optional().nullable(),
  followUpDate: z.string().datetime().optional().nullable(),
});

export const PATCH = withAuth<Ctx>(async (req, userId, ctx) => {
  const { id } = await ctx.params;
  await getOwnedApplication(userId, id);
  const data = patchSchema.parse(await req.json());
  const application = await prisma.application.update({
    where: { id },
    data: {
      status: data.status,
      notes: data.notes,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : data.appliedDate,
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : data.followUpDate,
    },
  });
  return NextResponse.json(application);
});

export const DELETE = withAuth<Ctx>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  await getOwnedApplication(userId, id);
  await prisma.application.delete({ where: { id } });
  return NextResponse.json({ ok: true });
});
