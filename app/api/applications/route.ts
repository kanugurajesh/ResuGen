import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  jobDescription: z.string().min(20),
});

export const GET = withAuth(async (_req, userId) => {
  const applications = await prisma.application.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: { resumes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return NextResponse.json(applications);
});

export const POST = withAuth(async (req, userId) => {
  const data = createSchema.parse(await req.json());
  const application = await prisma.application.create({ data: { ...data, userId } });
  return NextResponse.json(application, { status: 201 });
});
