# Verify: 18 Job Discovery — emprego.co.mz Migration · spec 0002 · updated 2026-08-13

_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Go to `/find-jobs`, confirm the search card shows only a Job Title input and the Find Jobs button (no Location input) → AC-1
- [ ] Search a common Portuguese job title (e.g. "engenheiro", "gestor", "técnico"), confirm the success message reads "Found N jobs and saved M strong matches." with no mention of location → AC-1, AC-9
- [ ] Search a nonsense term unlikely to match anything, confirm the message reads "No jobs found for that search. Try a different title." (no "or location") → AC-9
- [ ] Open a job found via this source on `/find-jobs/[id]`, confirm the Job Description card shows real Responsibilities and Requirements content, not just a short blob → AC-3
- [ ] On that same job details page, click "Apply Now" / "View Job Post", confirm it opens the real `emprego.co.mz/vaga/...` page in a new tab (not a broken link, not the emprego.co.mz homepage) → AC-7
- [ ] Confirm the Salary Est. field shows "Not disclosed" rather than a broken or blank value for an emprego.co.mz-sourced job → Consequences (salary usually absent)

## Commands

- [ ] `npx tsc --noEmit` → no errors
- [ ] `npx eslint .` → no errors
- [ ] `npm run build` → succeeds, `/api/agent/find` present in the route table
- [ ] A scratch script calling `discoverJobs(insforge, "<term>", profile, userId, runId)` directly against the real site and a real profile → returns `{success: true, jobsSaved, strongMatches, matchScores}`, and the inserted `jobs` rows have `external_apply_url: null`, `source_url` set, `about_role`/`responsibilities`/`requirements` populated for at least the jobs whose detail page fetch succeeded → AC-1, AC-3, AC-7

## Acceptance-criteria coverage

- AC-1 (up to 10 open postings, no location input) — covered by the UI search step and the scratch-script command
- AC-2 (scan up to 5 pages, stop early at 10) — covered structurally by `agent/emprego.ts`'s `collectActiveResults()`; no isolated manual step, exercised by every real search
- AC-3 (about_role/responsibilities/requirements from the detail page) — covered by the job details page manual step
- AC-4 (detail fetch failure still saves the job, warning logged) — not independently exercised live (would need a deliberately broken detail URL); covered at the unit level during the build (`fetchJobDetail` returning `null` is handled explicitly in `agent/emprego.ts`)
- AC-5 (expired postings never saved) — covered implicitly: every real search verified during the build returned only non-expired postings, matching `lib/emprego.ts`'s `isExpired` filter
- AC-6 (job_type classified or null) — covered by the scratch-script command; the real verification run returned `"fulltime"` for all four saved jobs
- AC-7 (external_apply_url always null, source_url always the real page, Apply Now still works) — covered by the job details page manual step and the scratch-script command
- AC-8 (parser breakage warning on a first-page zero-result parse) — not independently exercised live (the site did not break during verification); covered at the code level in `collectActiveResults()`
- AC-9 (zero-results message, no "or location") — covered by the nonsense-search manual step
- AC-10 (Adzuna fully removed) — covered by the build's own deletion of `lib/adzuna.ts`/`agent/adzuna.ts` and the passing typecheck/lint/build afterward
