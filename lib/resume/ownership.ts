import { prisma } from "@/lib/db";
import { ApiError } from "@/lib/api";

export async function getOwnedApplication(userId: string, applicationId: string) {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application || application.userId !== userId) {
    throw new ApiError(404, "Application not found");
  }
  return application;
}

export async function getOwnedResume(userId: string, resumeId: string) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { application: true },
  });
  if (!resume || resume.application.userId !== userId) {
    throw new ApiError(404, "Resume not found");
  }
  return resume;
}
