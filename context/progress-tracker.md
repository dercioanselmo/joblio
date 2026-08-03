# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 04 Database Schema
**Next:** 05 Profile Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
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

- 02 Auth rebuilt (2026-08-04) — the original implementation ran OAuth entirely client-side (browser called `signInWithOAuth` and read the session in a client callback page) and had a stub `/api/auth/refresh` that never talked to InsForge. Also `app/middleware.ts` never executed: Next.js 16.2.9 renamed the convention to root-level `proxy.ts` exporting `proxy`, confirmed against `node_modules/next/dist/docs`. Rebuilt per InsForge's SSR auth guide: `proxy.ts` runs `updateSession()` on every non-static route to keep cookies fresh, then gates `/dashboard`, `/profile`, `/find-jobs*`. OAuth now initiates and exchanges server-side (`actions/auth.ts` + `app/api/auth/callback/route.ts`) so the refresh token stays httpOnly; `/api/auth/refresh` now uses `createRefreshAuthRouter()`. `Navbar` became an async server component that checks session state and swaps "Start for free" for "Sign out".
- Homepage uses the provided public image assets for dashboard, job list, agent log, testimonial avatar, and logo. `FeatureShowcase.tsx` renders `jobs-lists.png` and `agnet-log.png` directly (2026-08-04 — replaced hand-built `JobListCard`/`AgentLogMock` components that had drifted from the delivered design: missing table headers, no terminal chrome, wrong row count, stray "1." typo in the log. Components deleted, unused-asset gap closed).
- Hero headline corrected to "Your tools shouldn't be." (contraction) to match the design's two-line wrap — a prior edit had expanded it to "should not," pushing the H1 to three lines.
- The delivered landing page design references JobPilot, but the implemented page uses the project brand Joblio and `public/logo.png`.
- Root font was changed from Geist to Inter to satisfy `ui-rules.md`.

---

## Notes

- Added `landing-gradient` and `section-hatch` global utility classes backed by theme tokens for the landing page background treatments.
