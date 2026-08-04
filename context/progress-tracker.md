# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 05 Profile Page — Full UI
**Next:** 06 Profile Save Logic

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
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

- 05 Profile Page — Full UI built (2026-08-04) against `context/designs/profile.png` — `CompletionIndicator`, `ResumeUpload`, `TagInput`, `WorkExperienceRole`, `ProfileForm` in `components/profile/`, plus a first set of hand-built `components/ui/` primitives (Button, Input, Textarea, Select, Checkbox, Label — not the shadcn CLI, since `shadcn init` would have written a competing token set into `globals.css`; see `ui-registry.md` for why). Verified with a real Playwright screenshot against the design (temporarily bypassed the `/profile` proxy check to render it unauthenticated, reverted immediately after). Caught and fixed a real hydration-mismatch bug this way: the mock work-experience role's `id` used `crypto.randomUUID()` inside `useState`'s initializer, which runs on both server and client and produces different values each time — switched the initial mock role to a fixed id. Also added active-page styling (color + underline) to `NavbarLink` to match the design, since it wasn't implemented before; did NOT add the small per-item icons the design also shows, since that's a bigger change to the shared, all-pages Navbar unconfirmed against other pages' designs — flagged to the user. **Open item:** the design has no Cover Letter Tone field, but `build-plan.md` and the `profiles.cover_letter_tone` DB column both expect one — followed the design exactly per explicit instruction, so it's missing from this form and needs to be added in 06 or as a follow-up.
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
