# Resume Builder

Paste a job description, get a tailored, ATS-safe resume compiled from your own memory bank —
a persistent record of your real experience, projects, and skills. Nothing is invented: tailoring
only selects and lightly rewords bullets that already exist in your memory bank.

## How it works

1. **Memory bank** (`/memory`) — your source of truth: profile, work experience, projects,
   education, certifications, skills. Paste an existing resume at `/memory/import` to bootstrap it
   in minutes (you review/edit everything before it's saved).
2. **New application** (`/applications/new`) — paste a job description and company/role.
3. **Tailor** — the JD is parsed for real keywords, then your memory bank is matched and reworded
   against it. You see a before/after keyword match score and can edit anything before compiling.
4. **Compile** — the tailored resume is rendered to LaTeX and compiled to a real PDF via
   [Tectonic](https://tectonic-typesetting.github.io/). Download the PDF, or the `.tex` source to
   keep polishing in Overleaf.
5. **Track** (`/applications`) — every application keeps its JD, tailored resume(s), status
   (Saved → Applied → Interview → Offer/Rejected), and notes together.

A cover letter generator is also available on each application, grounded in the same memory bank.

## Setup

```bash
npm install
npx prisma migrate dev   # creates dev.db
```

Copy `.env.example` to `.env` if you don't already have one, and fill in:

- `OPENAI_API_KEY` — required for JD analysis, tailoring, resume import, and cover letters.
- `AUTH_SECRET` — session signing secret (a default is pre-filled for local dev; replace it for
  anything beyond your own machine).
- `TECTONIC_BIN` — path to the Tectonic binary used to compile PDFs. Already vendored at
  `tools/tectonic/tectonic.exe` for this machine. If that binary is missing (e.g. on a fresh clone
  — it's git-ignored because it's a 50MB executable), download it from the
  [Tectonic releases page](https://github.com/tectonic-typesetting/tectonic/releases) for your
  platform and point `TECTONIC_BIN` at it, or install the `tectonic` package via your OS package
  manager.

Then:

```bash
npm run dev
```

Open http://localhost:3000, sign up, and add a few entries to your memory bank before tailoring
your first application — tailoring has nothing to work with on an empty account.

## Notes

- Multiple people can use the same deployment — each account has its own isolated memory bank and
  applications.
- The first PDF compile downloads LaTeX packages on demand (cached afterwards by Tectonic), so it
  can take longer than later ones.
- Generated PDFs/`.tex` files live under `storage/` (git-ignored) and `dev.db` is your local
  SQLite database (also git-ignored).
