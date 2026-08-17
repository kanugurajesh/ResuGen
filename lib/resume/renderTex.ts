import { ResumeRenderData } from "@/lib/resume/buildRenderData";
import { tex } from "@/lib/resume/escapeLatex";

function dateRange(start: string | null, end: string | null, current: boolean): string {
  const startTex = tex(start ?? "");
  if (current) return `${startTex} -- Present`;
  const endTex = tex(end ?? "Present");
  return `${startTex} -- ${endTex}`;
}

function contactLine(profile: ResumeRenderData["profile"]): string {
  const parts: string[] = [];
  if (profile.location) parts.push(tex(profile.location));
  if (profile.phone) parts.push(tex(profile.phone));
  if (profile.email) parts.push(`\\href{mailto:${tex(profile.email)}}{${tex(profile.email)}}`);
  if (profile.linkedin) parts.push(`\\href{${tex(profile.linkedin)}}{LinkedIn}`);
  if (profile.github) parts.push(`\\href{${tex(profile.github)}}{GitHub}`);
  if (profile.website) parts.push(`\\href{${tex(profile.website)}}{Portfolio}`);
  return parts.join(" \\quad$\\vert$\\quad ");
}

function bulletList(bullets: string[]): string {
  if (bullets.length === 0) return "";
  const items = bullets.map((b) => `  \\item ${tex(b)}`).join("\n");
  return `\\begin{itemize}[leftmargin=1.15em, itemsep=0pt, topsep=2pt, parsep=0pt]\n${items}\n\\end{itemize}`;
}

export function renderResumeTex(data: ResumeRenderData): string {
  const sections: string[] = [];

  if (data.summary) {
    sections.push(`\\section*{Summary}\n${tex(data.summary)}`);
  }

  if (data.skills.length > 0) {
    sections.push(`\\section*{Skills}\n${data.skills.map(tex).join(" \\quad $\\cdot$ \\quad ")}`);
  }

  if (data.experiences.length > 0) {
    const entries = data.experiences
      .map((e) => {
        const header = `\\textbf{${tex(e.title)}} \\hfill ${dateRange(e.startDate, e.endDate, e.current)} \\\\\n${tex(
          e.company
        )}${e.location ? ` \\hfill ${tex(e.location)}` : ""}`;
        return `${header}\n${bulletList(e.bullets)}`;
      })
      .join("\n\\vspace{6pt}\n");
    sections.push(`\\section*{Experience}\n${entries}`);
  }

  if (data.projects.length > 0) {
    const entries = data.projects
      .map((p) => {
        const titlePart = p.link ? `\\href{${tex(p.link)}}{${tex(p.name)}}` : tex(p.name);
        const dates =
          p.startDate || p.endDate ? dateRange(p.startDate, p.endDate, false) : "";
        const header = `\\textbf{${titlePart}}${dates ? ` \\hfill ${dates}` : ""}`;
        const desc = p.description ? `\\\\\n${tex(p.description)}` : "";
        return `${header}${desc}\n${bulletList(p.bullets)}`;
      })
      .join("\n\\vspace{6pt}\n");
    sections.push(`\\section*{Projects}\n${entries}`);
  }

  if (data.educations.length > 0) {
    const entries = data.educations
      .map((e) => {
        const degreeLine = `\\textbf{${tex(e.degree)}${e.field ? `, ${tex(e.field)}` : ""}}`;
        const dates =
          e.startDate || e.endDate ? ` \\hfill ${dateRange(e.startDate, e.endDate, false)}` : "";
        const gpa = e.gpa ? ` \\quad GPA: ${tex(e.gpa)}` : "";
        return `${degreeLine}${dates} \\\\\n${tex(e.school)}${gpa}`;
      })
      .join("\n\\vspace{4pt}\n");
    sections.push(`\\section*{Education}\n${entries}`);
  }

  if (data.certifications.length > 0) {
    const entries = data.certifications
      .map((c) => {
        const issuer = c.issuer ? `, ${tex(c.issuer)}` : "";
        const date = c.date ? ` \\hfill ${tex(c.date)}` : "";
        return `${tex(c.name)}${issuer}${date}`;
      })
      .join(" \\\\\n");
    sections.push(`\\section*{Certifications}\n${entries}`);
  }

  return `\\documentclass[10.5pt,letterpaper]{article}

\\usepackage[margin=0.65in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\definecolor{headingcolor}{RGB}{20,20,20}
\\hypersetup{colorlinks=true, urlcolor=headingcolor, linkcolor=headingcolor}
\\pagestyle{empty}

\\titleformat{\\section}{\\bfseries\\large\\color{headingcolor}}{}{0em}{}[\\vspace{-4pt}\\hrule\\vspace{4pt}]
\\titlespacing{\\section}{0pt}{10pt}{4pt}

\\setlength{\\parindent}{0pt}

\\begin{document}

{\\LARGE \\bfseries ${tex(data.profile.fullName)}} \\\\[2pt]
{\\large ${tex(data.profile.headline)}} \\\\[4pt]
${contactLine(data.profile)}

${sections.join("\n\n")}

\\end{document}
`;
}
