import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getOwnedResume } from "@/lib/resume/ownership";
import { getMemoryBank } from "@/lib/memory/store";
import { sanitizeTailoredResume } from "@/lib/resume/validateTailored";
import { tailoredResumeInputSchema } from "@/lib/resume/tailoredSchema";
import { buildResumeRenderData } from "@/lib/resume/buildRenderData";
import { renderResumeTex } from "@/lib/resume/renderTex";
import { compileResumeTex } from "@/lib/resume/compile";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth<Ctx>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const resume = await getOwnedResume(userId, id);
  return NextResponse.json({
    ...resume,
    contentJson: JSON.parse(resume.contentJson),
    missingKeywords: resume.missingKeywords ? JSON.parse(resume.missingKeywords) : [],
  });
});

export const PATCH = withAuth<Ctx>(async (req, userId, ctx) => {
  const { id } = await ctx.params;
  const resume = await getOwnedResume(userId, id);

  const tailoredInput = tailoredResumeInputSchema.parse((await req.json()).tailored);
  const bank = await getMemoryBank(userId);
  const tailored = sanitizeTailoredResume(tailoredInput, bank);

  const renderData = buildResumeRenderData(bank, tailored);
  const texContent = renderResumeTex(renderData);
  const { texPath, pdfPath } = await compileResumeTex(resume.applicationId, resume.id, texContent);

  const updated = await prisma.resume.update({
    where: { id: resume.id },
    data: { contentJson: JSON.stringify(tailored), texPath, pdfPath },
  });

  return NextResponse.json(updated);
});
