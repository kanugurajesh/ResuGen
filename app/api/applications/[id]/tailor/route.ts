import { NextResponse } from "next/server";
import { withAuth, ApiError } from "@/lib/api";
import { getOwnedApplication } from "@/lib/resume/ownership";
import { getMemoryBank, isMemoryBankEmpty } from "@/lib/memory/store";
import { analyzeJobDescription, tailorResumeToJob } from "@/lib/llm/tasks";
import { sanitizeTailoredResume } from "@/lib/resume/validateTailored";
import { computeMatchScore } from "@/lib/resume/matchScore";
import { memoryBankToText, tailoredResumeToText } from "@/lib/resume/textAssembly";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withAuth<Ctx>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const application = await getOwnedApplication(userId, id);

  const bank = await getMemoryBank(userId);
  if (isMemoryBankEmpty(bank)) {
    throw new ApiError(
      400,
      "Your memory bank is empty. Add some experience, projects, or skills first so there's something to tailor."
    );
  }

  const jobAnalysis = await analyzeJobDescription(application.jobDescription);

  const before = computeMatchScore(jobAnalysis.keywords, memoryBankToText(bank));

  const rawTailored = await tailorResumeToJob(bank, application.jobDescription, jobAnalysis);
  const tailored = sanitizeTailoredResume(rawTailored, bank);

  const after = computeMatchScore(jobAnalysis.keywords, tailoredResumeToText(tailored));

  return NextResponse.json({
    jobAnalysis,
    tailored,
    matchScoreBefore: before.score,
    matchScoreAfter: after.score,
    missingKeywords: after.missing,
  });
});
