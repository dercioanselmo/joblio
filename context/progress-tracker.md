# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 06 Profile Save Logic
**Next:** 07 AI Profile Extraction from Resume

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- 06 Profile Save Logic built (2026-08-04) — `actions/profile.ts` (`saveProfile`, `uploadResume`), `lib/profile.ts` (DB↔form mappers + completion calc), `types/index.ts` (new — first use of the file architecture.md had planned but nobody had created yet). Two decisions made without stopping to ask, both documented here per usual practice:
  - **Cover Letter Tone added to the form** (Job Preferences section, paired with Preferred Locations) — feature 05 deliberately left it out to match `profile.png` exactly, but `profiles.cover_letter_tone` is a real CHECK-constrained DB column and 06 is explicitly about wiring the *complete* form to the DB, so leaving a documented required field permanently unmapped wasn't defensible.
  - **Completion %/missing fields are computed on-the-fly, not persisted** — `db/schema.sql` only has `is_complete boolean`, no `completion_percentage`/`missing_fields` columns, and adding them would mean another migration on an already-applied schema. `is_complete` (the one field build-plan explicitly says to persist) is written by `saveProfile`; percentage and the missing-fields list are recomputed from the row every time (page load and post-save), which avoids staleness risk for a value that's cheap to derive. The 10-check completion algorithm in `lib/profile.ts` was verified, not guessed: reverse-engineered against `profile.png`'s exact "70%, missing Phone/Location/Education" by testing candidate required-field sets until one reproduced those numbers exactly (7 of 10 checks passing, with LinkedIn/Portfolio counted as required — excluding them does not reproduce 70%).
  - Verified end-to-end against the live InsForge project rather than just type-checking: a scratch script using `createAdminClient` (real existing user id from `auth.users`, found via `db query`) exercised the actual `.upsert([row], {onConflict:'id'})` and `.storage.from('resumes').upload()` calls `saveProfile`/`uploadResume` use, confirmed full round-trip type fidelity (arrays, jsonb, nullables, enums), and specifically confirmed that the resume-only partial upsert does **not** clobber other already-saved profile fields (this was an assumption the plan depended on — PostgREST's `ON CONFLICT DO UPDATE` only touches columns present in the payload — and it held). Separately verified via a real (temporarily-bypassed-proxy) Playwright render that the brand-new-user/no-profile-row path renders cleanly with 0% completion and no forced-empty work experience card.
  - Along the way, confirmed by reading the installed `@insforge/sdk`/`@supabase/postgrest-js` `.d.ts` files directly (not just the skill docs, which disagreed with each other on the storage `.upload()` signature) that `storage.upload(path, file)` is 2-arg with no `upsert` option — overwrite-on-same-path is implicit — and that `database.from(table)` has a native `.upsert(rows, {onConflict})` because it's the real `@supabase/postgrest-js` builder underneath, which none of the InsForge skill docs mention.
- 05 Profile Page — Full UI built (2026-08-04) against `context/designs/profile.png` — `CompletionIndicator`, `ResumeUpload`, `TagInput`, `WorkExperienceRole`, `ProfileForm` in `components/profile/`, plus a first set of hand-built `components/ui/` primitives (Button, Input, Textarea, Select, Checkbox, Label — not the shadcn CLI, since `shadcn init` would have written a competing token set into `globals.css`; see `ui-registry.md` for why). Verified with a real Playwright screenshot against the design (temporarily bypassed the `/profile` proxy check to render it unauthenticated, reverted immediately after). Caught and fixed a real hydration-mismatch bug this way: the mock work-experience role's `id` used `crypto.randomUUID()` inside `useState`'s initializer, which runs on both server and client and produces different values each time — switched the initial mock role to a fixed id. Also added active-page styling (color + underline) to `NavbarLink` to match the design, since it wasn't implemented before; did NOT add the small per-item icons the design also shows, since that's a bigger change to the shared, all-pages Navbar unconfirmed against other pages' designs — flagged to the user. **Open item, resolved in 06:** the design has no Cover Letter Tone field, but `build-plan.md` and the `profiles.cover_letter_tone` DB column both expect one — followed the design exactly per explicit instruction at the time, added it in feature 06 once the form needed to actually round-trip through the DB.
- 04 Database Schema reviewed and re-applied to the new project (2026-08-04) — `db/schema.sql` was missing `ON DELETE CASCADE` on every `auth.users(id)` foreign key (blocking account deletion once any data existed), was missing the `agent_logs.job_id → jobs(id)` foreign key entirely, and its RLS policies neither scoped `TO authenticated` nor wrapped `auth.uid()` in a subquery (both are InsForge's documented canonical pattern — see the `insforge-cli` skill's `access-control.md`). Fixed: `auth.users` FKs now `ON DELETE CASCADE`; internal `run_id`/`job_id` FKs now `ON DELETE SET NULL` so job/log data survives if the parent run or job record is removed; added the missing `agent_logs.job_id` FK; policies now `FOR ALL TO authenticated USING/WITH CHECK ((SELECT auth.uid()) = ...)`; added composite indexes `jobs(user_id, found_at)` and `jobs(user_id, match_score)` matching the actual sort-by-user query shape from build-plan feature 11. Applied via `migrations/20260804004742_joblio-schema.sql` + `db migrations up --all`; verified against `pg_policies` and `pg_constraint` that both role scoping and cascade rules landed as written.
- 02 Auth rebuilt (2026-08-04) — the original implementation ran OAuth entirely client-side (browser called `signInWithOAuth` and read the session in a client callback page) and had a stub `/api/auth/refresh` that never talked to InsForge. Also `app/middleware.ts` never executed: Next.js 16.2.9 renamed the convention to root-level `proxy.ts` exporting `proxy`, confirmed against `node_modules/next/dist/docs`. Rebuilt per InsForge's SSR auth guide: `proxy.ts` runs `updateSession()` on every non-static route to keep cookies fresh, then gates `/dashboard`, `/profile`, `/find-jobs*`. OAuth now initiates and exchanges server-side (`actions/auth.ts` + `app/api/auth/callback/route.ts`) so the refresh token stays httpOnly; `/api/auth/refresh` now uses `createRefreshAuthRouter()`. `Navbar` became an async server component that checks session state and swaps "Start for free" for "Sign out".
- InsForge project migrated mid-build (2026-08-04) — the original project (`n4ym3cpa`) auto-paused from free-tier inactivity (all requests 503'd). `.env.local` and `.insforge/project.json` now point at a fresh project (`yyy6rv9p.eu-central`). Its `allowedRedirectUrls` started empty (new project, nothing configured yet) — added `http://localhost:3000/api/auth/callback` via `insforge.toml` + `config apply`, which was the actual cause of the post-OAuth redirect-back-to-login loop. Google/GitHub OAuth providers were already enabled on the new project. Database/storage are empty on the new project — 04 Database Schema will need to be re-applied there.
- Login page redesigned (2026-08-04) — original used `rounded-3xl` cards and `rounded-2xl bg-accent` buttons, matching neither the documented Card (`rounded-2xl`) nor Button (`rounded-md`) tokens in `ui-tokens.md`. Rebuilt against the documented tokens with the same `landing-gradient` background as Hero/BottomCta for brand consistency; OAuth buttons now use the Secondary button token with provider icons.
- Fixed real post-login redirect loop (2026-08-04) — InsForge logs showed the OAuth code exchange (`POST /exchange`) succeeding on every attempt, but the user still bounced back to `/login`. Root cause was in `proxy.ts`: the protected-route auth check built a `createServerClient()` reading cookies from `response.cookies` (only contains what `updateSession()` itself just wrote, e.g. on a refresh) instead of `request.cookies` (what the browser actually sent, including the fresh `insforge_access_token` from the just-completed login) — so it always saw "no user" and redirected to `/login` even immediately after a successful sign-in. Fixed by using `updateSession()`'s own returned `accessToken` (it already resolves the current valid token, refreshed or not) instead of a second, misreading API call. Also stopped `PostHogProviderContent` from calling the browser SDK's `getCurrentUser()` when there's no `insforge_access_token` cookie yet — that call's internal fallback hits the InsForge host directly cross-origin and always 401s for anonymous visitors, which was confusing console noise (visible on every page load, not just after login) but not the actual bug.
- `app/(app)/layout.tsx` added — `/dashboard` had no shared layout and never rendered `Navbar` after login. Moved `dashboard` into the `(app)` route group alongside a new placeholder `/profile` page (full profile UI is still feature 05); both now get the persistent Navbar via the shared layout. Both pages also get a working "Sign out" (via the shared `SignOutButton`) ahead of schedule since there was otherwise no way to end a session and test the flow.
- Homepage uses the provided public image assets for dashboard, job list, agent log, testimonial avatar, and logo. `FeatureShowcase.tsx` renders `jobs-lists.png` and `agnet-log.png` directly (2026-08-04 — replaced hand-built `JobListCard`/`AgentLogMock` components that had drifted from the delivered design: missing table headers, no terminal chrome, wrong row count, stray "1." typo in the log. Components deleted, unused-asset gap closed).
- Hero headline corrected to "Your tools shouldn't be." (contraction) to match the design's two-line wrap — a prior edit had expanded it to "should not," pushing the H1 to three lines.
- The delivered landing page design references JobPilot, but the implemented page uses the project brand Joblio and `public/logo.png`.
- Root font was changed from Geist to Inter to satisfy `ui-rules.md`.

---

## Notes

- Added `landing-gradient` and `section-hatch` global utility classes backed by theme tokens for the landing page background treatments.
