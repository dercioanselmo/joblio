# Joblio

Joblio is a full-stack AI-powered job hunting assistant. Set up your profile once, upload a resume, and an agent discovers relevant jobs from Adzuna, scores each one against your profile with GPT-4o, and — for the ones you're interested in — researches the company across its public web pages into a structured briefing (overview, tech stack, culture, why the role exists, interview prep). You review everything and apply with one click. The whole process is tracked on a dashboard with PostHog-powered analytics.

---

## Tech Stack

| Layer                             | Tool                                                | Purpose                                                          |
| ---------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| Framework                          | [Next.js 16](https://nextjs.org) (App Router)        | Full-stack framework — pages, API routes, Server Actions        |
| Language                           | TypeScript (strict mode)                              | Throughout                                                       |
| UI runtime                         | React 19                                              | Server Components by default, Client Components where needed    |
| Styling                            | Tailwind CSS v4                                       | Utility-first styling, design tokens via `@theme` in `globals.css` |
| UI primitives                      | Hand-built components (shadcn-shaped, no CLI)         | Button, Input, Textarea, Select, Checkbox, Label                |
| Icons                              | [lucide-react](https://lucide.dev)                    | Icon set used throughout the UI                                 |
| Backend (auth, DB, storage)        | [InsForge](https://insforge.dev)                      | Postgres-based BaaS — auth, database, storage, RLS               |
| Auth providers                     | Google OAuth, GitHub OAuth (via InsForge)             | Sign-in                                                          |
| Job discovery                      | [Adzuna API](https://developer.adzuna.com)            | Job search and discovery, IT-jobs category filtered              |
| AI model                           | Azure AI Foundry `gpt-4o` deployment (via `openai` SDK) | Job matching/scoring, resume extraction/generation, company research synthesis |
| Cloud browser                      | [Browserbase](https://www.browserbase.com)            | Runs the company-research browsing session                      |
| AI browser control                 | [Stagehand](https://www.stagehand.dev)                | Drives page navigation and structured content extraction         |
| Charts                             | [Recharts](https://recharts.org)                      | Dashboard analytics charts (line/bar/area)                       |
| PDF generation                     | [@react-pdf/renderer](https://react-pdf.org)          | Renders the generated resume PDF                                 |
| PDF parsing                        | [pdf-parse](https://www.npmjs.com/package/pdf-parse)   | Extracts text from an uploaded resume PDF                        |
| Analytics                          | [PostHog](https://posthog.com) (`posthog-js` + `posthog-node`) | Event tracking, used to power the dashboard's activity feed logic |
| Validation                         | [Zod](https://zod.dev)                                | Schema validation for AI responses and request bodies            |
| Linting                            | ESLint (`eslint-config-next`)                          | Code quality                                                     |


### AI Infrastructure — Azure AI Foundry

The application is powered by a gpt-4o deployment created and configured in Azure AI Foundry. The deployment is hosted within my Azure AI Foundry environment and is integrated into the application through the Azure OpenAI API using the openai SDK.

**AI Integration**

The application routes all AI-powered functionality through the Azure AI Foundry gpt-4o deployment, including:

Job matching and candidate evaluation
Resume field extraction
Resume generation
Company research and synthesis

The Azure OpenAI client configuration is centralized in lib/azure-openai.ts.


---

## Features

- **Auth** — Google / GitHub OAuth via InsForge, protected routes for `/dashboard`, `/profile`, `/find-jobs*`
- **Profile** — full resume-style profile form; upload a resume PDF and either extract structured fields from it with AI or generate a clean new resume PDF from your current profile data
- **Job discovery** — search by title + location; the agent calls Adzuna, scores every result against your profile (0–100, with matched/missing skills and a written reason), and saves everything — even jobs whose scoring call fails are kept, just unscored
- **Find Jobs page** — filter (all / high / low match), sort (score / newest / oldest), free-text search, and pagination, all reflected in the URL (shareable, bookmarkable)
- **Job details** — full structured listing, match score breakdown, and a company research card
- **Company research agent** — a single Browserbase + Stagehand session visits the company's homepage and a few sub-pages, then GPT-4o synthesizes a 9-field briefing (overview, tech stack, culture, why this role, your edge, gaps to address, smart questions, interview prep, sources) — always returns a briefing even if the site can't be found
- **Dashboard** — stat cards (jobs found, avg. match rate, companies researched, jobs this week), a real recent-activity feed merged from search runs and researched companies, and analytics charts

---

## Project Structure

```
app/
├── (app)/                # Protected route group (shared Navbar layout)
│   ├── dashboard/         # Dashboard page
│   ├── find-jobs/         # Find Jobs list + [id] job details page
│   └── profile/           # Profile form + resume management
├── (auth)/login/          # Login page (no navbar)
└── api/
    ├── agent/find/         # Trigger Adzuna job discovery
    ├── agent/research/     # Trigger company research agent
    ├── auth/                # OAuth callback + session refresh
    └── resume/              # Extract-from-resume / generate-resume routes

agent/          # Agent logic only — Adzuna discovery, matching, company research. No React.
actions/        # Server Actions for UI-triggered mutations (profile save, auth)
components/     # UI only, grouped by page/feature — no DB calls
lib/            # Third-party client setup + shared utilities
types/          # Shared TypeScript types
db/             # Base schema
migrations/     # Applied InsForge/Postgres migrations
docs/specs/     # Design specs for load-bearing features (written via /architect)
context/        # Project documentation the AI agent reads before building —
                #   project overview, architecture, UI tokens/rules/registry,
                #   code standards, library usage notes, build plan, progress tracker
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- An [InsForge](https://insforge.dev) project (Postgres-based backend)
- API keys for: Adzuna, Browserbase, Azure AI Foundry (`gpt-4o` deployment), PostHog

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in real values:

```bash
cp .env.local.example .env.local
```

| Variable                        | Required for                                   |
| -------------------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`            | Local dev URL                                   |
| `NEXT_PUBLIC_INSFORGE_URL`       | InsForge browser client                         |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY`  | InsForge browser client                         |
| `INSFORGE_API_KEY`               | Server-side admin/CLI tooling (not the running app) |
| `NEXT_PUBLIC_POSTHOG_KEY`        | PostHog browser + server event capture           |
| `NEXT_PUBLIC_POSTHOG_HOST`       | PostHog browser + server event capture           |
| `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` | Job discovery                                  |
| `BROWSERBASE_API_KEY` / `BROWSERBASE_PROJECT_ID` | Company research agent (Stagehand session) |
| `AZURE_OPENAI_API_BASE_URL` / `AZURE_OPENAI_API_KEY` / `AZURE_OPENAI_DEPLOYMENT` | All AI calls (matching, extraction, resume generation, research synthesis) |

### 3. Set up the database

```bash
npm run db:import-schema
npm run db:create-resume-bucket
```

This applies `db/schema.sql` (profiles, agent_runs, jobs, agent_logs — all with RLS scoped to `auth.uid()`) and creates the private `resumes` storage bucket.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script                       | What it does                                  |
| ------------------------------ | ---------------------------------------------- |
| `npm run dev`                  | Start the Next.js dev server (Turbopack)       |
| `npm run build`                | Production build                               |
| `npm run start`                | Start the production server                    |
| `npm run lint`                 | Run ESLint                                     |
| `npm run db:import-schema`     | Apply `db/schema.sql` to the InsForge project   |
| `npm run db:create-resume-bucket` | Create the private `resumes` storage bucket |

---

## Docker

`Dockerfile` is a 3-stage build (`deps` → `builder` → `runner`) using Next's [`output: "standalone"`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) (set in `next.config.ts`), so the final image ships only the traced server files, not a full `node_modules` install. Runs as a non-root user, listens on port 3000.

**Build-time vs runtime variables — this matters:**

- `NEXT_PUBLIC_*` vars are inlined into the client bundle during `next build`. They must be passed as `--build-arg` at `docker build` time — setting them only at `docker run` has no effect on already-built pages.
- Every other var (`ADZUNA_*`, `BROWSERBASE_*`, `AZURE_OPENAI_*`, `INSFORGE_API_KEY`, PostHog server overrides) is read server-side at request time and should be injected at container **runtime** (`docker run -e` / ECS task definition / Secrets Manager) — never baked into the image. A few of these (`AZURE_OPENAI_*`, `BROWSERBASE_*`) do need a non-empty *placeholder* at build time too, because their client SDKs are constructed eagerly at module load and `next build`'s page-data-collection step imports those modules — see the comment in `Dockerfile` for exactly why. The placeholders have no effect on the running container; each module re-evaluates from scratch against the real runtime env on process start.

### Build and run locally

```bash
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_INSFORGE_URL=<your-insforge-url> \
  --build-arg NEXT_PUBLIC_INSFORGE_ANON_KEY=<your-anon-key> \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key> \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST=<your-posthog-host> \
  -t joblio:latest .

docker run -p 3000:3000 --env-file .env.local joblio:latest
```

From there, point an ECS task definition (Fargate or EC2) at the pushed image, set the non-`NEXT_PUBLIC_` variables as task-definition environment/secrets, expose container port 3000 behind an ALB, and health-check `/` — it always responds with either a redirect or 200, never a 5xx for an unauthenticated request.

---

## Documentation

Project context and conventions live in [`context/`](context/) and are read by the AI coding agent before every change — see [`AGENTS.md`](AGENTS.md) for the read order. Notably:

- [`context/project-overview.md`](context/project-overview.md) — product scope, user flows, features in/out of scope
- [`context/architecture.md`](context/architecture.md) — stack, folder structure, data flow, DB schema, invariants
- [`context/build-plan.md`](context/build-plan.md) — the 17-feature build plan
- [`context/progress-tracker.md`](context/progress-tracker.md) — what's built, what's next, and the real decisions made along the way
