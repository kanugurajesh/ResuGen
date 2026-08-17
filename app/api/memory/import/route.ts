import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth, ApiError } from "@/lib/api";
import { extractMemoryFromResumeText } from "@/lib/llm/tasks";

const bodySchema = z.object({ resumeText: z.string().min(20) });

export const POST = withAuth(async (req) => {
  const { resumeText } = bodySchema.parse(await req.json());
  try {
    const draft = await extractMemoryFromResumeText(resumeText);
    return NextResponse.json(draft);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, "Failed to analyze the resume text. Please try again.");
  }
});
