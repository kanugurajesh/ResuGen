import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getMemoryBank } from "@/lib/memory/store";
import { ApplicationDetail } from "@/components/applications/ApplicationDetail";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      resumes: { orderBy: { createdAt: "desc" } },
      coverLetters: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!application || application.userId !== userId) notFound();

  const bank = await getMemoryBank(userId);
  const sourceLabels: Record<string, string> = {};
  for (const exp of bank.experiences) sourceLabels[exp.id] = `${exp.company}`;
  for (const proj of bank.projects) sourceLabels[proj.id] = proj.name;

  return (
    <ApplicationDetail
      application={JSON.parse(JSON.stringify(application))}
      sourceLabels={sourceLabels}
      memoryBankEmpty={
        bank.experiences.length === 0 && bank.projects.length === 0 && bank.skills.length === 0
      }
    />
  );
}
