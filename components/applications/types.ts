export type TailoredBullet = { bulletId: string; text: string };
export type TailoredSection = { id: string; bullets: TailoredBullet[] };
export type TailoredResume = {
  headline: string;
  summary: string;
  skills: string[];
  experiences: TailoredSection[];
  projects: TailoredSection[];
};

export type JobAnalysis = {
  titleGuess: string;
  seniority: string;
  keywords: string[];
  hardSkills: string[];
  softSkills: string[];
  responsibilities: string[];
};

export type TailorResult = {
  jobAnalysis: JobAnalysis;
  tailored: TailoredResume;
  matchScoreBefore: number;
  matchScoreAfter: number;
  missingKeywords: string[];
};

export type ResumeRecord = {
  id: string;
  templateId: string;
  contentJson: string;
  matchScoreBefore: number | null;
  matchScoreAfter: number | null;
  missingKeywords: string | null;
  texPath: string | null;
  pdfPath: string | null;
  createdAt: string;
};

export type ApplicationRecord = {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  status: "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";
  notes: string | null;
  resumes: ResumeRecord[];
  coverLetters: { id: string; content: string; createdAt: string }[];
};
