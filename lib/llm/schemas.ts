// JSON Schemas passed to the OpenAI structured-outputs API (strict mode),
// plus the matching TypeScript types for the parsed results.

export type JobAnalysis = {
  titleGuess: string;
  seniority: string;
  keywords: string[];
  hardSkills: string[];
  softSkills: string[];
  responsibilities: string[];
};

export const jobAnalysisSchema = {
  type: "object",
  properties: {
    titleGuess: { type: "string", description: "Best guess at the job title" },
    seniority: { type: "string", description: "e.g. Junior, Mid, Senior, Staff, Lead" },
    keywords: {
      type: "array",
      items: { type: "string" },
      description: "Important ATS keywords/phrases from the JD, ranked most important first",
    },
    hardSkills: { type: "array", items: { type: "string" } },
    softSkills: { type: "array", items: { type: "string" } },
    responsibilities: { type: "array", items: { type: "string" } },
  },
  required: ["titleGuess", "seniority", "keywords", "hardSkills", "softSkills", "responsibilities"],
  additionalProperties: false,
} as const;

export type TailoredBullet = { bulletId: string; text: string };
export type TailoredSection = { id: string; bullets: TailoredBullet[] };
export type TailoredResume = {
  headline: string;
  summary: string;
  skills: string[];
  experiences: TailoredSection[];
  projects: TailoredSection[];
};

export const tailoredResumeSchema = {
  type: "object",
  properties: {
    headline: { type: "string", description: "Short professional headline, e.g. 'Backend Engineer'" },
    summary: {
      type: "string",
      description: "2-3 sentence professional summary tailored to the job, based only on the candidate's real background provided",
    },
    skills: {
      type: "array",
      items: { type: "string" },
      description: "Ordered list of skills to display, drawn only from the candidate's provided skills/tags",
    },
    experiences: {
      type: "array",
      description: "One entry per experience the resume should include, in display order",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Must exactly match a provided experience id" },
          bullets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                bulletId: { type: "string", description: "Must exactly match a provided bullet id" },
                text: {
                  type: "string",
                  description: "The bullet text, optionally lightly reworded for keyword alignment. Never invent facts, employers, or metrics not present in the source bullet.",
                },
              },
              required: ["bulletId", "text"],
              additionalProperties: false,
            },
          },
        },
        required: ["id", "bullets"],
        additionalProperties: false,
      },
    },
    projects: {
      type: "array",
      description: "One entry per project the resume should include, in display order",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Must exactly match a provided project id" },
          bullets: {
            type: "array",
            items: {
              type: "object",
              properties: {
                bulletId: { type: "string", description: "Must exactly match a provided bullet id" },
                text: { type: "string" },
              },
              required: ["bulletId", "text"],
              additionalProperties: false,
            },
          },
        },
        required: ["id", "bullets"],
        additionalProperties: false,
      },
    },
  },
  required: ["headline", "summary", "skills", "experiences", "projects"],
  additionalProperties: false,
} as const;

export type CoverLetterResult = { content: string };

export const coverLetterSchema = {
  type: "object",
  properties: {
    content: {
      type: "string",
      description:
        "The full cover letter body text (no letterhead), 3-4 short paragraphs, tailored to the job and grounded only in the candidate's real background provided.",
    },
  },
  required: ["content"],
  additionalProperties: false,
} as const;

export type ImportedProfile = {
  fullName: string | null;
  headline: string | null;
  phone: string | null;
  location: string | null;
  email: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  summary: string | null;
};

export type ImportedExperience = {
  company: string;
  title: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
};

export type ImportedProject = {
  name: string;
  description: string | null;
  link: string | null;
  startDate: string | null;
  endDate: string | null;
  bullets: string[];
};

export type ImportedEducation = {
  school: string;
  degree: string;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  gpa: string | null;
};

export type ImportedCertification = { name: string; issuer: string | null; date: string | null };
export type ImportedSkill = { name: string; category: string | null };

export type ImportedMemory = {
  profile: ImportedProfile;
  experiences: ImportedExperience[];
  projects: ImportedProject[];
  education: ImportedEducation[];
  certifications: ImportedCertification[];
  skills: ImportedSkill[];
};

const nullableString = { type: ["string", "null"] } as const;

export const importedMemorySchema = {
  type: "object",
  properties: {
    profile: {
      type: "object",
      properties: {
        fullName: nullableString,
        headline: nullableString,
        phone: nullableString,
        location: nullableString,
        email: nullableString,
        linkedin: nullableString,
        github: nullableString,
        website: nullableString,
        summary: nullableString,
      },
      required: [
        "fullName",
        "headline",
        "phone",
        "location",
        "email",
        "linkedin",
        "github",
        "website",
        "summary",
      ],
      additionalProperties: false,
    },
    experiences: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          title: { type: "string" },
          location: nullableString,
          startDate: { type: "string", description: "As written in the resume, e.g. 'Jan 2022'" },
          endDate: nullableString,
          current: { type: "boolean" },
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["company", "title", "location", "startDate", "endDate", "current", "bullets"],
        additionalProperties: false,
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: nullableString,
          link: nullableString,
          startDate: nullableString,
          endDate: nullableString,
          bullets: { type: "array", items: { type: "string" } },
        },
        required: ["name", "description", "link", "startDate", "endDate", "bullets"],
        additionalProperties: false,
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          school: { type: "string" },
          degree: { type: "string" },
          field: nullableString,
          startDate: nullableString,
          endDate: nullableString,
          gpa: nullableString,
        },
        required: ["school", "degree", "field", "startDate", "endDate", "gpa"],
        additionalProperties: false,
      },
    },
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: nullableString,
          date: nullableString,
        },
        required: ["name", "issuer", "date"],
        additionalProperties: false,
      },
    },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: nullableString,
        },
        required: ["name", "category"],
        additionalProperties: false,
      },
    },
  },
  required: ["profile", "experiences", "projects", "education", "certifications", "skills"],
  additionalProperties: false,
} as const;
