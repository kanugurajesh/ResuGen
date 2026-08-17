import { getLlmProvider } from "@/lib/llm/index";
import {
  JobAnalysis,
  jobAnalysisSchema,
  TailoredResume,
  tailoredResumeSchema,
  ImportedMemory,
  importedMemorySchema,
  CoverLetterResult,
  coverLetterSchema,
} from "@/lib/llm/schemas";
import { MemoryBank } from "@/lib/memory/store";

export async function analyzeJobDescription(jobDescription: string): Promise<JobAnalysis> {
  const llm = getLlmProvider();
  return llm.generateStructured<JobAnalysis>({
    schemaName: "job_analysis",
    schema: jobAnalysisSchema,
    system:
      "You are an expert technical recruiter. Extract the signal from a job description: " +
      "the true seniority level, the concrete hard skills/tools/technologies, soft skills, " +
      "core responsibilities, and the ATS keywords a resume needs to mention to pass a ranking " +
      "algorithm for this role. Be concrete and specific — avoid generic filler like 'team player'.",
    user: `Job description:\n\n${jobDescription}`,
  });
}

function memoryBankForPrompt(bank: MemoryBank) {
  return {
    profile: bank.profile,
    skills: bank.skills.map((s) => s.name),
    experiences: bank.experiences.map((e) => ({
      id: e.id,
      title: e.title,
      company: e.company,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      bullets: e.bullets.map((b) => ({ id: b.id, text: b.text, tags: b.tags })),
    })),
    projects: bank.projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      bullets: p.bullets.map((b) => ({ id: b.id, text: b.text, tags: b.tags })),
    })),
  };
}

export async function tailorResumeToJob(
  bank: MemoryBank,
  jobDescription: string,
  analysis: JobAnalysis
): Promise<TailoredResume> {
  const llm = getLlmProvider();
  const candidate = memoryBankForPrompt(bank);

  return llm.generateStructured<TailoredResume>({
    schemaName: "tailored_resume",
    schema: tailoredResumeSchema,
    system:
      "You are an expert resume writer. You will be given (1) a job description and its extracted " +
      "requirements, and (2) a candidate's factual memory bank of real experience/project bullets, each " +
      "with a stable id. Your job is to choose which experiences/projects to include, which bullets from " +
      "each are most relevant to the job, and to lightly reword bullet text to align with the job's " +
      "language and keywords for ATS matching.\n\n" +
      "HARD RULES:\n" +
      "- Every 'id' and 'bulletId' you return MUST exactly match an id given in the candidate data. " +
      "Never invent ids.\n" +
      "- Never fabricate employers, titles, dates, metrics, or accomplishments that are not present in " +
      "the source bullet. Light rewording for clarity/keyword alignment is fine; inventing new facts is not.\n" +
      "- Prefer including fewer, more relevant bullets over padding with everything.\n" +
      "- Only include skills that appear in the candidate's provided skills list or bullet tags.\n" +
      "- Order experiences and projects with the most relevant to this job first.",
    user: JSON.stringify(
      {
        jobDescription,
        jobAnalysis: analysis,
        candidate,
      },
      null,
      2
    ),
  });
}

export async function generateCoverLetter(
  bank: MemoryBank,
  jobDescription: string,
  analysis: JobAnalysis,
  company: string,
  role: string
): Promise<string> {
  const llm = getLlmProvider();
  const result = await llm.generateStructured<CoverLetterResult>({
    schemaName: "cover_letter",
    schema: coverLetterSchema,
    system:
      "You write concise, specific cover letters. Ground every claim only in the candidate's real " +
      "background provided below — never invent employers, projects, or accomplishments. Avoid generic " +
      "filler ('I am a hard worker'); reference specific, real experience that matches the job's needs.",
    user: JSON.stringify(
      { company, role, jobDescription, jobAnalysis: analysis, candidate: memoryBankForPrompt(bank) },
      null,
      2
    ),
  });
  return result.content;
}

export async function extractMemoryFromResumeText(resumeText: string): Promise<ImportedMemory> {
  const llm = getLlmProvider();
  return llm.generateStructured<ImportedMemory>({
    schemaName: "imported_memory",
    schema: importedMemorySchema,
    system:
      "You extract structured data from a pasted resume's plain text. Preserve the candidate's actual " +
      "wording for bullets as closely as possible — do not invent, embellish, or omit accomplishments. " +
      "If a field isn't present in the text, return null for it rather than guessing. Dates should be kept " +
      "in whatever format the resume used.",
    user: `Resume text:\n\n${resumeText}`,
  });
}
