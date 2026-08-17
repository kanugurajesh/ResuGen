import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "@/lib/api";

const execFileAsync = promisify(execFile);

function resolveTectonicBin(): string {
  const configured = process.env.TECTONIC_BIN || "tools/tectonic/tectonic.exe";
  return path.isAbsolute(configured)
    ? configured
    : path.join(/* turbopackIgnore: true */ process.cwd(), configured);
}

export function storageDir(applicationId: string): string {
  return path.join(process.cwd(), "storage", "resumes", applicationId);
}

export async function compileResumeTex(
  applicationId: string,
  resumeId: string,
  texContent: string
): Promise<{ texPath: string; pdfPath: string }> {
  const dir = storageDir(applicationId);
  await mkdir(dir, { recursive: true });

  const texFile = path.join(dir, `${resumeId}.tex`);
  const pdfFile = path.join(dir, `${resumeId}.pdf`);
  await writeFile(texFile, texContent, "utf-8");

  const bin = resolveTectonicBin();
  try {
    await execFileAsync(bin, ["-X", "compile", texFile, "--outdir", dir], {
      timeout: 60_000,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new ApiError(500, `Resume PDF compilation failed: ${message}`);
  }

  return { texPath: texFile, pdfPath: pdfFile };
}
