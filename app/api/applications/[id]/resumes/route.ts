import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getOwnedApplication } from "@/lib/resume/ownership";
import { getMemoryBank } from "@/lib/memory/store";
import { sanitizeTailoredResume } from "@/lib/resume/validateTailored";
import { saveResumeSchema } from "@/lib/resume/tailoredSchema";
import { buildResumeRenderData } from "@/lib/resume/buildRenderData";
import { renderResumeTex } from "@/lib/resume/renderTex";
import { compileResumeTex } from "@/lib/resume/compile";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (req, userId, ctx) => {
  const { id } = await ctx.params;
  await getOwnedApplication(userId, id);

  const body = saveResumeSchema.parse(await req.json());
  const bank = await getMemoryBank(userId);
  const tailored = sanitizeTailoredResume(body.tailored, bank);

  const resume = await prisma.resume.create({
    data: {
      applicationId: id,
      templateId: body.templateId,
      contentJson: JSON.stringify(tailored),
      matchScoreBefore: body.matchScoreBefore ?? undefined,
      matchScoreAfter: body.matchScoreAfter ?? undefined,
      missingKeywords: JSON.stringify(body.missingKeywords ?? []),
    },
  });

  const renderData = buildResumeRenderData(bank, tailored);
  const texContent = renderResumeTex(renderData);
  const { texPath, pdfPath } = await compileResumeTex(id, resume.id, texContent);

  const updated = await prisma.resume.update({
    where: { id: resume.id },
    data: { texPath, pdfPath },
  });

  return NextResponse.json(updated, { status: 201 });
});
