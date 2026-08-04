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

Page path: `app/(app)/profile/page.tsx` — now an `async` Server Component: fetches the current user via `createInsforgeServer()` + `.auth.getCurrentUser()`, the `profiles` row via `.database.from("profiles").select("*").eq("id", user.id).maybeSingle()`, maps it to form state with `profileToFormValues()` (`lib/profile.ts`), computes completion with `computeProfileCompletion()`, and passes everything down as props. Single column `mx-auto max-w-3xl flex flex-col gap-6`. Data layer: `actions/profile.ts` (`saveProfile`, `uploadResume` Server Actions), `lib/profile.ts` (mappers + completion calc), `types/index.ts` (`Profile`, `ProfileFormValues`, `WorkExperienceRoleData`, `ProfileCompletion`).

### CompletionIndicator

- Path: `components/profile/CompletionIndicator.tsx` (unchanged since feature 05 — still just `percentage`/`missingFields` props, presentational only)
- Now fed real computed values from `computeProfileCompletion()` instead of the feature-05 hardcoded `70`/`["Phone","Location","Education"]` literals. That completion algorithm (`lib/profile.ts`) was verified, not guessed — reverse-engineered against those exact design numbers: 10 required checks (Full Name, Phone, Location, LinkedIn, Portfolio, Job Title, Skills ≥1, Work Experience ≥1 role, Education — all 4 sub-fields, Job Titles Seeking), 7 passing in the design's mock state = 70%. Fields the UI already labels "(optional)" (Industries, Salary Expectation, Preferred Locations) are excluded. `is_complete` is the only completion-related value actually persisted (`profiles.is_complete`); percentage/missing-fields are always recomputed from the row, never stored, to avoid staleness.
- Card: `flex items-center justify-between gap-6 rounded-2xl border border-border bg-surface p-6 shadow`
- Missing-field pill: `rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-error`
- Ring: inline SVG, two concentric `<circle>` (track `stroke-error/15`, fill `stroke-error`) with `strokeDasharray`/`strokeDashoffset` driven by `percentage`, wrapped in a `-rotate-90` svg so the arc starts at 12 o'clock; the `<text>` counter-rotates `rotate-90` to stay upright. No `error-light` token existed for the track, so `stroke-error/15` (Tailwind opacity modifier on the existing `--color-error` token) is used instead of a new hardcoded color.

### ResumeUpload

- Path: `components/profile/ResumeUpload.tsx` — now `{ initialResumeUrl: string | null }` prop (from `profiles.resume_pdf_url`)
- File select and drag-drop both call `uploadResume(file)` (`actions/profile.ts`), which validates type/size server-side (`application/pdf`, ≤5MB — never trust the client), uploads to InsForge Storage at `resumes/{user_id}/resume.pdf` via `insforge.storage.from("resumes").upload(path, file)`, then upserts just `{ id, email, resume_pdf_url }` onto `profiles` (upsert, not update, so a brand-new user uploading a resume before ever saving the rest of the form still works — and upsert-with-partial-payload is confirmed to leave other columns untouched, verified live against the real DB, not assumed)
- When a resume URL is present (initial or just-uploaded), shows "Current resume: [View resume ↗]" above the dropzone — `text-sm text-text-secondary` / link `font-medium text-accent hover:text-accent-dark`. No design reference for this state (`profile.png` only shows the empty dropzone) — kept minimal/understated rather than inventing a bigger pattern.
- Card: `rounded-2xl border border-border bg-surface p-6 shadow`
- Dropzone: `rounded-lg border border-dashed border-border-muted bg-surface-secondary px-6 py-12 text-center`; drag-over state swaps to `border-accent bg-accent-muted`
- Upload icon circle: `flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow` containing a `lucide-react` `UploadCloud` icon in `text-accent`
- "Select Resume" is a `Button variant="secondary"` that clicks a hidden native `<input type="file" accept="application/pdf">`; button and dropzone text show "Uploading..." while in flight
- Error banner on failure: `rounded-md border border-error/20 bg-error/10 px-4 py-3 text-sm text-error` (reuses the same token pattern as ProfileForm's status banner — see below)
- "Generate Resume from Profile" is a `Button variant="primary"` with a `FileText` icon, below a `border-t border-border` divider — still **not wired**, that's feature 08

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

- Path: `components/profile/ProfileForm.tsx` — `"use client"`, `{ initialValues: ProfileFormValues, email: string }` props (both from the server component page, via `profileToFormValues()`). Single `useState<ProfileFormValues>` tree now (feature 05 had 4 separate `useState` objects — consolidated since the Server Action takes the whole shape at once and the old split risked forgetting a sub-object when assembling the save payload)
- `handleSave` is now `async`: calls `saveProfile(values)` (`actions/profile.ts`), shows "Saving..." on the button while pending (`disabled`), then a status banner — success: `border-success/20 bg-success-lightest text-success-foreground`; error: `border-error/20 bg-error/10 text-error` (note: **not** the `border-destructive/...` classes `LoginFormContent` uses — `--color-destructive` was never defined in `globals.css`'s `@theme` block, so that banner silently renders with no color at all; flagged separately, not fixed here since it's a different file, but don't copy that pattern)
- Card: `rounded-2xl border border-border bg-surface p-6 shadow`; each subsection (Personal Info, Professional Info, Work Experience, Education, Job Preferences) separated by `border-t border-border pt-6`
- Up to 3 work experience roles via `WorkExperienceRole`, added with a `+ Add role` accent-colored link (hidden once at the cap); starts at 0 roles for a brand-new user (no forced blank card — matches the "+ Add role" empty-state pattern already used for 2nd/3rd roles)
- **Cover Letter Tone added** (2026-08-04, feature 06) — paired with Preferred Locations in a `grid sm:grid-cols-2` row at the end of Job Preferences, same `Select` pattern as Remote Preference. `profile.png` never showed this field (feature 05 matched the design exactly and left it out), but `profiles.cover_letter_tone` is a real CHECK-constrained column (`formal`/`casual`/`enthusiastic`) and 06 is explicitly about wiring the *complete* form to the DB.
- Save Profile: `Button variant="primary" disabled={isSaving} className="mt-8 w-full py-3 text-base"`
- Initial work-experience role ids come from `profileToFormValues()` as `role-${index}` (deterministic from the server-fetched array) — same fixed-id-not-`crypto.randomUUID()` lesson from feature 05's hydration bug, now generalized: anything rendered from server-provided initial state must have a deterministic id. New roles added via "Add role" still use `crypto.randomUUID()` safely, since that only runs client-side after a user click, never during SSR.
