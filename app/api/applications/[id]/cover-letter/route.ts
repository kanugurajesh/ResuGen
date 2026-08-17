import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import { prisma } from "@/lib/db";
import { getOwnedApplication } from "@/lib/resume/ownership";
import { getMemoryBank, isMemoryBankEmpty } from "@/lib/memory/store";
import { analyzeJobDescription, generateCoverLetter } from "@/lib/llm/tasks";
import { ApiError } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const application = await getOwnedApplication(userId, id);

  const bank = await getMemoryBank(userId);
  if (isMemoryBankEmpty(bank)) {
    throw new ApiError(400, "Your memory bank is empty. Add some experience first.");
  }

  const jobAnalysis = await analyzeJobDescription(application.jobDescription);
  const content = await generateCoverLetter(
    bank,
    application.jobDescription,
    jobAnalysis,
    application.company,
    application.role
  );

  const coverLetter = await prisma.coverLetter.create({
    data: { applicationId: id, content },
  });

  return NextResponse.json(coverLetter, { status: 201 });
});
