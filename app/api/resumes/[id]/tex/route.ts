import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { withAuth, ApiError } from "@/lib/api";
import { getOwnedResume } from "@/lib/resume/ownership";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth<Ctx>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const resume = await getOwnedResume(userId, id);
  if (!resume.texPath) throw new ApiError(404, "Source not generated yet");

  const content = await readFile(resume.texPath, "utf-8");
  const filename = `${resume.application.company}-${resume.application.role}-resume.tex`
    .replace(/[^a-z0-9.-]+/gi, "_");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/x-tex; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
