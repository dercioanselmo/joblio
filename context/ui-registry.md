# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Navbar

- Path: `components/layout/Navbar.tsx` (async server component — checks session via `createInsforgeServer()` and passes `isAuthenticated` down)
- Split into: `components/layout/NavbarLink.tsx` (client, per-link click tracking + active-page state via `usePathname()`) and `components/layout/NavbarAuthCta.tsx` (client, renders "Start for free" + `LoginModal` when signed out, "Sign out" button when signed in)
- Active nav item (2026-08-04, added to match `context/designs/profile.png`): `text-accent border-b-2 border-accent pb-px`; inactive: `text-text-dark border-b-2 border-transparent pb-px`. `/find-jobs` matches via `startsWith` so sub-routes stay highlighted. Note: `ui-rules.md` says "no underline" for active state, but the design shows one — design wins per its own "source of truth" rule. The design also shows small icons on each nav item (grid/search/person) that were **not** added, since that's a bigger change to this shared, all-pages component and unconfirmed against the dashboard/find-jobs designs — flagged for the user rather than guessed.
- Classes:
  - Header: `border-b border-border bg-surface`
  - Inner: `mx-auto flex h-20 max-w-[1720px] items-center justify-between px-6 sm:px-10 lg:px-24`
  - Nav: `hidden items-center gap-12 text-[16px] font-medium leading-6 text-text-dark sm:flex`
  - CTA (both "Start for free" and "Sign out"): `rounded-md bg-overlay px-6 py-3 text-[16px] font-semibold leading-6 text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-overlay-dark`

### Login Page

- Path: `app/(auth)/login/page.tsx`
- Redesigned (2026-08-04) to match documented Card/Button tokens — the original used `rounded-3xl` cards and `rounded-2xl bg-accent` buttons, neither of which matches `ui-tokens.md` (Card = `rounded-2xl`, Button = `rounded-md`).
- Classes:
  - Page: `landing-gradient flex min-h-screen flex-col items-center justify-center px-6 py-16` (same background treatment as Hero/BottomCta)
  - Card: `w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow sm:p-8` (matches the documented Card token exactly)
  - H1: `text-2xl font-bold text-text-black`

### LoginFormContent (used by Login Page and LoginModal — heading lives in each parent, not here)

- Path: `components/auth/LoginFormContent.tsx`
- Classes:
  - OAuth button (Secondary token): `flex w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary shadow-sm transition hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-70`, with an inline Google/GitHub glyph
  - Error banner: `rounded-md border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive`
- Logic: calls the `initiateOAuth` server action (`actions/auth.ts`) — OAuth code exchange happens server-side via `app/api/auth/callback/route.ts`, never in the browser.

### LoginModal

- Path: `components/auth/LoginModal.tsx`
- Classes:
  - Backdrop: `fixed inset-0 z-40 bg-black/40 backdrop-blur-sm`
  - Panel: `w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow sm:p-8` (same Card token as Login Page)

### SignOutButton (shared — used by Navbar and Profile placeholder)

- Path: `components/auth/SignOutButton.tsx`
- Takes `source` (analytics) and `className` (caller controls visual style since it's used in two different contexts)

### App Layout (protected pages)

- Path: `app/(app)/layout.tsx` — wraps `/dashboard`, `/profile` (and future `/find-jobs*`) with the persistent `Navbar`. `/login` intentionally has no navbar (matches the `(auth)` group's standalone auth-page pattern).

### Hero

- Path: `components/homepage/Hero.tsx`
- Classes:
  - Section: `border-x border-b border-border`
  - Gradient panel: `landing-gradient border-b border-border px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28`
  - H1: `mx-auto max-w-[920px] text-[48px] font-bold leading-[1.08] tracking-normal text-text-black sm:text-[64px] lg:text-[78px]`
  - Copy: `mx-auto mt-8 max-w-[820px] text-[22px] font-normal leading-9 text-text-slate-medium`
  - Primary CTA: `min-w-[190px] rounded-md bg-overlay px-8 py-4 text-[20px] font-semibold leading-7 text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-overlay-dark`
  - Secondary CTA: `min-w-[260px] rounded-md border border-border bg-surface/70 px-8 py-4 text-[20px] font-semibold leading-7 text-text-slate shadow-sm transition transform hover:-translate-y-0.5 hover:bg-surface`
  - Preview panel: `bg-surface-tertiary px-6 py-16 sm:px-10 lg:px-24`

### FeatureShowcase

- Path: `components/homepage/FeatureShowcase.tsx`
- Classes:
  - Section: `border-x border-border bg-surface`
  - Grid: `grid border-b border-border lg:grid-cols-2`
  - Text column: `border-r border-border px-6 py-16 sm:px-12 lg:px-24 lg:py-28`
  - Media column: `flex items-center bg-surface-muted px-6 py-14 sm:px-12 lg:px-10`
  - Heading: `max-w-[620px] text-[44px] font-bold leading-[1.1] tracking-normal text-text-slate sm:text-[56px] lg:text-[64px]`
  - Feature row: `border-b border-border py-9 pl-8 border-l-2 border-l-accent` or `border-b border-border py-9 pl-8 border-l-2 border-l-transparent`
  - Feature title: `text-[26px] font-bold leading-8 text-text-darker`
  - Feature copy: `mt-5 max-w-[760px] text-[24px] font-normal leading-10 text-text-slate-medium`
  - Divider: `section-hatch h-28 border-b border-border`

### Testimonial

- Path: `components/homepage/Testimonial.tsx`
- Classes:
  - Section: `border-x border-b border-border bg-surface px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28`
  - Eyebrow: `text-[18px] font-semibold uppercase leading-7 tracking-[0.16em] text-accent`
  - Quote: `mx-auto mt-8 max-w-[1120px] text-[34px] font-semibold leading-[1.35] tracking-normal text-text-darker sm:text-[44px] lg:text-[52px]`
  - Author: `mt-10 flex items-center justify-center gap-4`

### BottomCta

- Path: `components/homepage/BottomCta.tsx`
- Classes:
  - Section: `border-x border-b border-border`
  - Gradient panel: `landing-gradient px-6 py-24 text-center sm:px-10 lg:px-24 lg:py-28`
  - H2: `mx-auto max-w-[980px] text-[48px] font-bold leading-[1.12] tracking-normal text-text-black sm:text-[64px] lg:text-[76px]`
  - Copy: `mx-auto mt-8 max-w-[900px] text-[22px] font-normal leading-9 text-text-slate-medium`

### Footer

- Path: `components/layout/Footer.tsx`
- Classes:
  - Footer: `border-x border-border bg-surface`
  - Inner: `mx-auto flex min-h-44 max-w-[1720px] flex-col justify-between gap-8 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-16`
  - Nav: `flex flex-wrap items-center gap-8 text-[20px] font-normal leading-7 text-text-dark`

---

## UI Primitives (`components/ui/`)

Hand-built, not the shadcn CLI — running `shadcn init` would have written its own competing `--background`/`--foreground` token set into `globals.css` alongside the project's existing `@theme` tokens. These match shadcn's common prop shape (plain HTML attribute passthrough + `className` merge via `cn()` from `lib/utils.ts`) without the Radix/CVA dependency footprint, since every control here is a plain native element (no combobox/popover behavior needed by any current design).

- `Button.tsx` — `variant?: "primary" | "secondary" | "ghost"`. Base: `inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60`. Primary: `bg-accent text-accent-foreground hover:bg-accent-dark`. Secondary: `bg-surface border border-border text-text-primary hover:bg-surface-secondary`. Ghost: `bg-transparent text-text-secondary hover:bg-surface-secondary`.
- `Input.tsx` — `w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent disabled:bg-surface-secondary disabled:text-text-muted`
- `Textarea.tsx` — same field classes as `Input.tsx`, no fixed height (caller passes `rows`)
- `Select.tsx` — native `<select appearance-none>` wrapped in a `relative` div with a `lucide-react` `ChevronDown` absolutely positioned at `right-3`; same border/focus classes as `Input.tsx` plus `pr-9` for the icon
- `Checkbox.tsx` — native `<input type="checkbox">`, `h-4 w-4 rounded border-border accent-accent`
- `Label.tsx` — `block text-xs font-medium uppercase tracking-wide text-text-secondary`

---

## Profile Page (`context/designs/profile.png`, built 2026-08-04, wired to InsForge 2026-08-04)

Page path: `app/(app)/profile/page.tsx` — now an `async` Server Component: fetches the current user via `createInsforgeServer()` + `.auth.getCurrentUser()`, the `profiles` row via `.database.from("profiles").select("*").eq("id", user.id).maybeSingle()`, maps it to form state with `profileToFormValues()` (`lib/profile.ts`), computes completion with `computeProfileCompletion()`, and passes everything down as props. Single column `mx-auto max-w-3xl flex flex-col gap-6`. Data layer: `actions/profile.ts` (`saveProfile`, `uploadResume` Server Actions), `lib/profile.ts` (mappers + completion calc + `mergeExtractedIntoValues`), `types/index.ts` (`Profile`, `ProfileFormValues`, `WorkExperienceRoleData`, `ProfileCompletion`, `ExtractedProfileData`).

**2026-08-04, feature 07 (AI Profile Extraction) update:** `ProfileForm` is no longer self-owned state — `page.tsx` now renders `ProfilePageClient` (new, `components/profile/ProfilePageClient.tsx`), a client wrapper holding the single `useState<ProfileFormValues>` and rendering `ResumeUpload` and `ProfileForm` as siblings that share it, so a resume extraction triggered from `ResumeUpload` can push values into `ProfileForm`.

### CompletionIndicator

- Path: `components/profile/CompletionIndicator.tsx` (unchanged since feature 05 — still just `percentage`/`missingFields` props, presentational only)
- Now fed real computed values from `computeProfileCompletion()` instead of the feature-05 hardcoded `70`/`["Phone","Location","Education"]` literals. That completion algorithm (`lib/profile.ts`) was verified, not guessed — reverse-engineered against those exact design numbers: 10 required checks (Full Name, Phone, Location, LinkedIn, Portfolio, Job Title, Skills ≥1, Work Experience ≥1 role, Education — all 4 sub-fields, Job Titles Seeking), 7 passing in the design's mock state = 70%. Fields the UI already labels "(optional)" (Industries, Salary Expectation, Preferred Locations) are excluded. `is_complete` is the only completion-related value actually persisted (`profiles.is_complete`); percentage/missing-fields are always recomputed from the row, never stored, to avoid staleness.
- Card: `flex items-center justify-between gap-6 rounded-2xl border border-border bg-surface p-6 shadow`
- Missing-field pill: `rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-error`
- Ring: inline SVG, two concentric `<circle>` (track `stroke-error/15`, fill `stroke-error`) with `strokeDasharray`/`strokeDashoffset` driven by `percentage`, wrapped in a `-rotate-90` svg so the arc starts at 12 o'clock; the `<text>` counter-rotates `rotate-90` to stay upright. No `error-light` token existed for the track, so `stroke-error/15` (Tailwind opacity modifier on the existing `--color-error` token) is used instead of a new hardcoded color.

### ResumeUpload

- Path: `components/profile/ResumeUpload.tsx` — props `{ initialResumeUrl: string | null, onExtracted: (extracted: ExtractedProfileData) => void }` (added `onExtracted` 2026-08-04, feature 07)
- File select and drag-drop both build a `FormData` (`formData.append("resume", file)`) and call `uploadResume(formData)` (`actions/profile.ts`), which validates type/size server-side (`application/pdf`, ≤5MB — never trust the client), uploads to InsForge Storage at `resumes/{user_id}/resume.pdf` via `insforge.storage.from("resumes").upload(path, file)`, then upserts just `{ id, email, resume_pdf_url }` onto `profiles` (upsert, not update, so a brand-new user uploading a resume before ever saving the rest of the form still works — and upsert-with-partial-payload is confirmed to leave other columns untouched, verified live against the real DB, not assumed)
  - **Bug fix (2026-08-04):** `uploadResume` originally took a raw `File` argument passed straight from a client event handler into a Server Action — this silently failed (no error, no UI update, upload looked like a no-op) because Server Actions don't reliably serialize a bare `File` this way. Switched to the `FormData` pattern Next.js's own docs use for this exact case. `handleFile` is also now wrapped in `try/catch` so a thrown/rejected upload surfaces the error banner instead of leaving `isUploading` stuck `true` forever.
- When a resume URL is present (initial or just-uploaded), shows "Current resume: [View resume ↗]" above the dropzone, plus a new **"Extract from Resume"** button (`Button variant="secondary"`, `lucide-react` `Sparkles` icon) — `text-sm text-text-secondary` / link `font-medium text-accent hover:text-accent-dark`. No design reference for this state (`profile.png` only shows the empty dropzone) — kept minimal/understated rather than inventing a bigger pattern.
- Card: `rounded-2xl border border-border bg-surface p-6 shadow`
- Dropzone: `rounded-lg border border-dashed border-border-muted bg-surface-secondary px-6 py-12 text-center`; drag-over state swaps to `border-accent bg-accent-muted`
- Upload icon circle: `flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow` containing a `lucide-react` `UploadCloud` icon in `text-accent`
- "Select Resume" is a `Button variant="secondary"` that clicks a hidden native `<input type="file" accept="application/pdf">`; button and dropzone text show "Uploading..." while in flight
- Error banner on failure: `rounded-md border border-error/20 bg-error/10 px-4 py-3 text-sm text-error` (reuses the same token pattern as ProfileForm's status banner — see below); a separate `extractError` banner uses the same classes for extraction failures
- "Extract from Resume" click calls `POST /api/resume/extract` (no body — reads the already-uploaded PDF from Storage server-side), then calls `onExtracted(data)` on success so `ProfilePageClient` can merge it into `ProfileForm`'s state. **User-triggered only, never automatic** — the form stays fully editable either way.
- "Generate Resume from Profile" is a `Button variant="primary"` with a `FileText` icon, below a `border-t border-border` divider — **wired 2026-08-08, feature 08**: `handleGenerate` calls `POST /api/resume/generate` (no body — the route reads the caller's own `profiles` row server-side), then on success updates the same local `resumeUrl`/`uploadedFileName` state the upload flow uses (`uploadedFileName` set to the literal `"resume.pdf"`, since a generated file has no original filename to show). Button shows "Generating..." and is disabled while pending; failures show a `generateError` banner using the same `border-error/20 bg-error/10 text-error` token pattern as the other two banners in this component.

### TagInput (shared — Skills and Industries)

- Path: `components/profile/TagInput.tsx`
- Props: `tags: string[]`, `onChange: (tags: string[]) => void`, `placeholder: string`
- Row: `Input` (flex-1) + `Button variant="secondary"` labeled "Add"; Enter key also adds
- Tag chip (not a pill — matches the design's rectangular chip, distinct from the pill-shaped missing-field badges above): `flex items-center gap-1.5 rounded-md bg-surface-secondary px-3 py-1.5 text-sm font-medium text-text-primary`, with a `lucide-react` `X` remove button

### WorkExperienceRole

- Path: `components/profile/WorkExperienceRole.tsx`, exports `WorkExperienceRoleData` type
- Renders Company Name / Job Title / Start Date / End Date + "Currently working here" checkbox / Key Responsibilities for one role; `onRemove?` prop shows a `Trash2` icon top-right, only passed when there's more than one role
- Start/End Date use native `<input type="month">`; checking "Currently working here" clears and disables End Date

### ProfileForm

- Path: `components/profile/ProfileForm.tsx` — `"use client"`, now a **controlled** component: `{ values: ProfileFormValues, onChange: (values: ProfileFormValues) => void, email: string }` (changed 2026-08-04, feature 07 — was self-owned `useState<ProfileFormValues>` with an `initialValues` prop; lifted up to `ProfilePageClient` so `ResumeUpload`'s "Extract from Resume" can write into the same state tree). `update()` now calls `onChange({...values, ...patch})` instead of a local setter.
- `handleSave` is now `async`: calls `saveProfile(values)` (`actions/profile.ts`), shows "Saving..." on the button while pending (`disabled`), then a status banner — success: `border-success/20 bg-success-lightest text-success-foreground`; error: `border-error/20 bg-error/10 text-error` (note: **not** the `border-destructive/...` classes `LoginFormContent` uses — `--color-destructive` was never defined in `globals.css`'s `@theme` block, so that banner silently renders with no color at all; flagged separately, not fixed here since it's a different file, but don't copy that pattern)
- Card: `rounded-2xl border border-border bg-surface p-6 shadow`; each subsection (Personal Info, Professional Info, Work Experience, Education, Job Preferences) separated by `border-t border-border pt-6`
- Up to 3 work experience roles via `WorkExperienceRole`, added with a `+ Add role` accent-colored link (hidden once at the cap); starts at 0 roles for a brand-new user (no forced blank card — matches the "+ Add role" empty-state pattern already used for 2nd/3rd roles)
- **Cover Letter Tone added** (2026-08-04, feature 06) — paired with Preferred Locations in a `grid sm:grid-cols-2` row at the end of Job Preferences, same `Select` pattern as Remote Preference. `profile.png` never showed this field (feature 05 matched the design exactly and left it out), but `profiles.cover_letter_tone` is a real CHECK-constrained column (`formal`/`casual`/`enthusiastic`) and 06 is explicitly about wiring the *complete* form to the DB.
- Save Profile: `Button variant="primary" disabled={isSaving} className="mt-8 w-full py-3 text-base"`
- Initial work-experience role ids come from `profileToFormValues()` as `role-${index}` (deterministic from the server-fetched array) — same fixed-id-not-`crypto.randomUUID()` lesson from feature 05's hydration bug, now generalized: anything rendered from server-provided initial state must have a deterministic id. New roles added via "Add role" still use `crypto.randomUUID()` safely, since that only runs client-side after a user click, never during SSR.

### AI Profile Extraction (feature 07, built 2026-08-04)

- Not a visible component of its own — it's the "Extract from Resume" button on `ResumeUpload` plus a server route, `ProfilePageClient`'s merge wiring, and `lib/profile.ts`'s `mergeExtractedIntoValues()`.
- Route: `app/api/resume/extract/route.ts` (`POST`, no body). Flow: auth check via `createInsforgeServer()` → download `resumes/{user_id}/resume.pdf` from Storage → `pdf-parse` v2 (`new PDFParse({data: buffer}).getText()`, class-based API — the installed v2.4.5 is a rewrite of the old v1 function-call API `library-docs.md` still documents; confirmed by reading the installed `.d.ts` before writing any code) → Claude API call → zod-validated JSON → `{ success, data: ExtractedProfileData }`.
- **Uses the Claude API (`@anthropic-ai/sdk`), not OpenAI**, despite the route originally being written against `openai`'s `gpt-4o`. Switched 2026-08-04 because the project has no funded `OPENAI_API_KEY` (empty in `.env.local`) but does have a working `CLAUDE_API_KEY`. Call shape: `client.messages.create({ model: "claude-opus-5", tools: [RECORD_PROFILE_TOOL], tool_choice: { type: "tool", name: "record_profile" }, ... })` — a single forced tool call, not a free-text JSON response, since that's the reliable way to get schema-shaped output from the Messages API (mirrors the `response_format: json_object` intent from the old OpenAI version). `openai` package has been uninstalled.
- Request shape was verified live against the real Anthropic API (auth accepted, schema parsed) but the account currently has **no API credit** — `400 invalid_request_error: "Your credit balance is too low"`. This is a billing issue on the Anthropic Console, not a code defect; the route's error handling surfaces this as the generic "Failed to extract profile data." banner today (the raw billing message isn't user-actionable, so it isn't surfaced verbatim).
- `mergeExtractedIntoValues(current, extracted)` (`lib/profile.ts`) only overwrites fields the resume actually provided — never blanks out data the user already typed. Skills are unioned + deduped (not replaced). `roles` is replaced wholesale, but only if extraction found at least one role. `education` merges per-field.
- Explicitly **not automatic** — extraction only runs on the button click; the form remains fully editable before and after a merge (this was a specific user requirement, not a default assumption).

### Resume PDF Generation (feature 08, built 2026-08-08)

- Not a visible component of its own — it's the "Generate Resume from Profile" button on `ResumeUpload` (see above) plus a server route.
- Route: `app/api/resume/generate/route.tsx` (`.tsx`, not `.ts` — defines a react-pdf `<Document>` template, which needs JSX). `POST`, no body. Flow: auth check → read caller's `profiles` row from DB (400 with a human-readable message if no row or no `full_name` yet — a brand-new user must save the form first) → Claude call (`client.messages.create` with a forced `record_resume_content` tool call, same pattern as feature 07's extraction route) returns a professional summary paragraph plus polished bullet points per work-experience role → `@react-pdf/renderer`'s `renderToBuffer()` renders a single-page A4 PDF combining that generated content with the profile's own contact info, skills, and education (those are not AI-paraphrased, only the summary and bullets are) → buffer uploaded to `resumes/{user_id}/resume.pdf` (overwrite) → fresh signed URL → `profiles.resume_pdf_url` updated via `.update()` (not upsert — a `profiles` row is already guaranteed to exist at this point, unlike the resume-upload path).
- Uses `@anthropic-ai/sdk`, same as feature 07's extraction route, not OpenAI — same unresolved account-billing blocker (`400: "Your credit balance is too low"`) confirmed live again for this feature; auth and schema validation succeed against the real API.
- `renderToBuffer(<ResumeDocument .../>)` is called from a small helper function defined outside the route's `try/catch`, not inline inside it — `react-hooks/error-boundaries` flags JSX construction textually nested inside a `try` block, even in a non-DOM server render context.

---

## Find Jobs Page (`context/designs/find-jobs.png`, built 2026-08-08, mock data only)

Page path: `app/(app)/find-jobs/page.tsx` — plain Server Component (no data fetching yet, feature 10/11 wire it up), `min-h-screen px-8 py-10` outer, `mx-auto flex max-w-[1440px] flex-col gap-6` inner (matches `ui-rules.md`'s documented 1440px max-width / 32px padding / 24px section gap exactly, unlike the narrower `max-w-3xl` used on `/profile`). Renders `SearchControls`, then a single card (`rounded-2xl border border-border bg-surface shadow`) wrapping `JobFilters` + `JobsTable` + `JobsPagination` as plain content (no nested card chrome per component — the continuous single-card look in the design comes from the parent, each child just contributes a `border-b`/`border-t` divider where the design shows one).

### SearchControls

- Path: `components/find-jobs/SearchControls.tsx` — `"use client"` since 2026-08-08 (feature 10; was a static/presentational Server Component in feature 09)
- Card: `rounded-2xl border border-border bg-surface p-6 shadow`
- Row: `grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end` — Job Title (search icon prefix, `Input` `pl-9`), Location (plain `Input`, no icon — confirmed against the design, only Job Title has the icon), `Button variant="primary" className="h-10.5"` with a `Search` icon, label "Find Jobs" / "Searching..." while pending
- Both text inputs are now **controlled** (`jobTitle`/`location` `useState`, `placeholder` unchanged from feature 09's exact copy). Enter key in either field triggers the same search as clicking the button.
- `handleSearch` posts `{ jobTitle, location }` to `POST /api/agent/find`; on success shows the response's real `message` in the success banner (`mt-4 flex items-center gap-2 rounded-md bg-success-lightest px-4 py-3 text-sm font-medium text-success-foreground`, `lucide-react` `Sparkles` icon — same classes as feature 09's static version, now driven by state) and calls `router.refresh()` so the Server Component page re-fetches; on failure shows an error banner (`border-error/20 bg-error/10 text-error`, same token pattern used everywhere else in this project). A client-side check blocks an empty job title before any network call.

### JobFilters

- Path: `components/find-jobs/JobFilters.tsx`
- `flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center` — search-icon `Input` (`flex-1`, placeholder "Filter by company or role...") + two `Select`s ("All Matches" / "High Match" / "Low Match" and "Match Score" / "Newest" / "Oldest"), each `w-auto min-w-[150px]`
- Still non-functional as of feature 10 — no `onChange`, no state. Feature 11 wires filter/sort logic (explicitly out of scope for 10, per `docs/specs/0001-adzuna-job-discovery.md` AC-12).

### JobsTable

- Path: `components/find-jobs/JobsTable.tsx` — real data since 2026-08-08 (feature 10): `MOCK_JOBS` removed, now takes `{ jobs: Job[] }` (the real DB type, `@/types`)
- `overflow-x-auto` wrapper around a plain `<table>`; header row `text-left text-xs font-medium uppercase tracking-wide text-text-secondary` with columns Company / Role / Match Score / Salary Est. / Date Found (**no Source column** — see progress-tracker's feature 09 entry for why this deviates from `build-plan.md`, design is source of truth)
- Row: `border-t border-border hover:bg-surface-secondary`; company cell is a `h-9 w-9 rounded-lg bg-surface-secondary` icon tile (`lucide-react` `Building2`, `text-text-secondary`) + `font-medium text-text-primary` name (`job.company ?? "Unknown"` — Adzuna always provides this in practice, but the DB column is nullable)
- Match score cell: `h-1 w-24 rounded-full bg-border-light` track, inner fill `div` with `style={{ width: `${score}% }}` and a color class from `getMatchScoreBarColor()` — **90+ → `bg-success`, 80-89 → `bg-info`, below 80 → `bg-warning`**, verified against the actual pixel colors in `find-jobs.png` (not the different cutoffs documented in `ui-tokens.md`/`ui-rules.md` — see progress-tracker). Percentage text stays `text-text-primary` regardless of score; only the bar fill changes color. Renders `—` in `text-text-muted` when `match_score` is `null`.
- `job.salary` renders as-is when present, else the literal `"Not disclosed"`. `job.found_at` renders through `formatRelativeDate()` (`lib/utils.ts`, new in feature 10) — "Just now" / "N hours ago" / "Yesterday" / "N days ago", matching the exact wording feature 09's mock data established.
- Empty state (no jobs at all) is **not** handled inside this component — `app/(app)/find-jobs/page.tsx` decides whether to render `JobsTable`+`JobsPagination` or the empty-state block, so `JobsTable` itself always assumes a non-empty `jobs` array.

### JobsPagination

- Path: `components/find-jobs/JobsPagination.tsx` — real counts since 2026-08-08 (feature 10): now takes `{ shownCount, totalCount, pageSize? = 20 }` instead of hardcoded mock numbers
- `flex flex-col items-center justify-between gap-3 p-4 sm:flex-row` — "Showing **1** to **{shownCount}** of **{totalCount}** results" (bold counts) on the left, page controls on the right
- Page number buttons still use the `pageButtonClasses(active)` helper (active: `border-accent bg-accent-light text-accent`; inactive: `border-border bg-surface text-text-primary`), now computed from `Math.ceil(totalCount / pageSize)` — shows up to 3 page numbers, plus a literal `...` and the final page number when there are more than 3 pages
- **Every button in this component is now `disabled`** (Previous, page numbers, Next) — real counts are shown, but no click behavior is wired yet. Feature 11 wires actual pagination/filter/sort on top of these same real counts (per `docs/specs/0001-adzuna-job-discovery.md` AC-12).

### Adzuna Job Discovery (feature 10, built 2026-08-08, designed via `/architect`)

- Full design record: `docs/specs/0001-adzuna-job-discovery.md` (status `Accepted`) — read it before touching any of the files below; it documents the load-bearing decisions (execution model, scoring concurrency, per-job failure handling, dedupe, country detection) that aren't in `build-plan.md`/`library-docs.md`.
- `lib/adzuna.ts` — `searchJobs(jobTitle, location, country)` (the exact fetch pattern from `library-docs.md`) + `detectCountryFromLocation(location)` (keyword match against gb/au/ca signal words, default `us`, no extra API/LLM call).
- `agent/types.ts` — `NormalizedAdzunaJob`, `ScoredJob` (agent-internal shapes, not DB rows).
- `agent/matcher.ts` — `scoreJob(job, profile)`, a forced Claude tool call (`record_match`, temperature 0.3, 400 max tokens — bumped from `library-docs.md`'s stale 300, written for OpenAI's plain-JSON mode; Claude's tool-call schema needs a bit more room), same pattern as `app/api/resume/extract/route.ts`. Returns `{success:false, error}` on failure; never throws.
- `agent/adzuna.ts` — `discoverJobs(insforge, jobTitle, location, profile, userId, runId)`: normalizes Adzuna's raw response, scores every job in parallel (`Promise.all`), logs each per-job scoring failure to `agent_logs` (`level: 'warning'`, `job_id: null`) without failing the run, batch-inserts every success into `jobs` in one call (array insert, per `AGENTS.md`'s InsForge pattern), returns `{success, jobsSaved, strongMatches, matchScores}` — `matchScores` lets the route fire `job_found` PostHog events without a second DB round trip.
- `app/api/agent/find/route.ts` — the only route this feature adds. Auth check → zod-validated body → profile-exists check (400 if missing) → creates `agent_runs` (`status: 'running'`) → `job_search_started` PostHog event → `discoverJobs` → updates `agent_runs` to `completed`/`failed` → `job_found` events (one per saved job) → `revalidatePath("/find-jobs")` → `{success, data: {jobsFound, strongMatches, message}}`. `message` is literally `"Found {N} jobs and saved {M} strong matches."` when `jobsFound > 0`, else `"No jobs found for that search. Try a different title or location."`
- **`lib/posthog-server.ts` corrected as part of this feature** — it existed unused since feature 03 and didn't match its own documented contract (a cached singleton, no `flushAt`/`flushInterval`, real risk of losing events on a serverless cold exit). Now `createPostHogServer()`: a fresh client per call, `flushAt: 1, flushInterval: 0`, matching `library-docs.md` exactly. Caller must still `await shutdown()` — the route does, in every response path.
- `MATCH_THRESHOLD = 70` and `formatRelativeDate()` added to `lib/utils.ts` — `MATCH_THRESHOLD` was mandated by `code-standards.md` since the project started but never actually created until this feature needed it.
