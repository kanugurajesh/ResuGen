import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { withAuth, ApiError } from "@/lib/api";
import { getOwnedResume } from "@/lib/resume/ownership";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withAuth<Ctx>(async (_req, userId, ctx) => {
  const { id } = await ctx.params;
  const resume = await getOwnedResume(userId, id);
  if (!resume.pdfPath) throw new ApiError(404, "PDF not generated yet");

  const buffer = await readFile(resume.pdfPath);
  const filename = `${resume.application.company}-${resume.application.role}-resume.pdf`
    .replace(/[^a-z0-9.-]+/gi, "_");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
});
