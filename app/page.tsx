import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { LinkButton } from "@/components/ui/Button";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-rule px-8 py-5 sm:px-12">
        <span className="font-display text-lg font-semibold text-ink">
          Resume<span className="text-accent">/</span>Builder
        </span>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/login" className="text-ink-soft hover:text-ink">
            Log in
          </Link>
          <LinkButton href="/signup">Get started</LinkButton>
        </nav>
      </header>

      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-14 px-8 py-20 sm:px-12">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            source → tailored → compiled
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Paste a job description. Compile a resume built from what you&apos;ve actually done.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft">
            Keep one honest record of your work — the memory bank. Every application pulls only
            from it, rewords for the role, and typesets a clean LaTeX resume in seconds. Nothing
            invented, nothing generic.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <LinkButton href="/signup">Get started — it&apos;s your data</LinkButton>
            <Link href="/login" className="text-sm text-ink-soft hover:text-accent">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-rule pt-10 sm:grid-cols-3">
          <PipelineCard
            eyebrow="01 · memory bank"
            title="Your real history"
            body="Experience, projects, and skills, each bullet tagged and reusable — the single source of truth."
          />
          <PipelineCard
            eyebrow="02 · tailoring"
            title="Matched to the role"
            body="The JD is parsed for real keywords; your bullets are selected and reworded to fit — never fabricated."
          />
          <PipelineCard
            eyebrow="03 · compiled"
            title="A typeset PDF"
            body="Rendered through a real LaTeX pipeline. Download the PDF, or the .tex to keep polishing in Overleaf."
          />
        </div>
      </section>
    </div>
  );
}

function PipelineCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="rounded-sm border border-rule bg-paper-raised p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-accent">{eyebrow}</p>
      <h3 className="mt-2 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
    </div>
  );
}
