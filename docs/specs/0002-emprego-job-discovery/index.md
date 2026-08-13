# 0002. Replace Adzuna with emprego.co.mz as the job discovery source

**Date**: 2026-08-13
**Status**: In Progress

## Summary

Joblio's job search currently pulls from Adzuna, which has no listings for Mozambique. This decision replaces Adzuna with emprego.co.mz, a Mozambique job board, as the only job discovery source. Since the site has no public API, the app will fetch its pages directly and read the job data out of the page content (a technique often called scraping). The matching and scoring logic stays exactly as it is today; only the step that finds jobs changes.

## Requirements

**User stories**:
- As a job seeker in Mozambique, I want to search for jobs by title and see current, real openings from emprego.co.mz, so that I can find work relevant to my market.
- As a job seeker, I want each job's description broken into an overview, responsibilities, and requirements, so that I can quickly judge fit without reading a wall of text.
- As a job seeker, I want a way to reach the real job posting to apply, even when there is no single external apply link.

**Acceptance criteria**:
- **AC-1**: Searching by job title (location is no longer a search input for this source) returns up to 10 currently open (not expired) postings from emprego.co.mz.
- **AC-2**: To find those 10, the search reads emprego.co.mz's keyword search result pages in order, up to 5 pages, stopping early once 10 open postings are found.
- **AC-3**: Each saved job's `about_role`, `responsibilities`, and `requirements` are filled from that posting's own detail page (Descrição, Funções, Requisitos) whenever that page can be read successfully.
- **AC-4**: If a specific posting's detail page cannot be read (network error or unexpected page structure), the job is still saved using only what the search results page already showed (title, company, location), with `about_role`/`responsibilities`/`requirements` left empty for that one job, and a warning recorded in `agent_logs` naming the posting.
- **AC-5**: A posting marked expired on emprego.co.mz is never saved.
- **AC-6**: `job_type` is set by asking the existing GPT-4o matching call to classify it from the posting's raw contract text (for example "6 meses, renováveis"), left empty when it cannot be classified into the existing fulltime, parttime, or contract values.
- **AC-7**: `external_apply_url` is always left empty for jobs from this source; `source_url` always points at the real emprego.co.mz job page, so the existing Apply Now button (which already falls back to `source_url`) keeps working with no code change.
- **AC-8**: If a page fetch succeeds (the request itself did not fail) but the parser finds zero of the fields it expects, a warning is recorded in `agent_logs` noting the page may have changed shape, distinct from a genuine zero result search.
- **AC-9**: A search that finds zero open, matching postings after scanning up to 5 pages shows the same "No jobs found for that search" message the app already shows today.
- **AC-10**: Adzuna is fully removed; there is exactly one job discovery pipeline.
- **AC-11** (added 2026-08-13, real usage after the initial build): Re-searching a posting already saved for this user (same `source_url`) updates that row (score, description, `found_at`) instead of inserting a duplicate. An existing `company_research` dossier on that row is never overwritten by a re-search.

## Decision

**Chosen option**: Option 2: Replace Adzuna directly with emprego.co.mz

The app becomes Mozambique focused. `lib/adzuna.ts` and `agent/adzuna.ts` are replaced by `lib/emprego.ts` and `agent/emprego.ts`; `agent/types.ts`'s `NormalizedAdzunaJob` is renamed `NormalizedJob` (it no longer names a specific provider). `agent/matcher.ts` and `MATCH_THRESHOLD` are unchanged other than the small addition described in AC-6.

Reasoning and options considered: see `rationale.md`.

## Feature design

**Data model sketch**:

No new tables or columns. The existing `jobs` table already fits: `title`, `company`, `location`, `about_role`, `responsibilities`, `requirements`, `source` (`'search'`, unchanged), `source_url`, `external_apply_url` (now always null for this source), `salary` (now usually null), `job_type` (now GPT-4o classified or null), `match_score`/`match_reason`/`matched_skills`/`missing_skills` (unchanged, still written by `agent/matcher.ts`). `agent_runs` and `agent_logs` are reused exactly as they are today.

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/api/agent/find` | POST | `jobTitle` (required, `location` removed) | `{ jobsFound, strongMatches, message }` | session cookie | 400 no title / no profile, 401 signed out, 500 search failed |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Search | list of open postings | emprego.co.mz `?s={jobTitle}` result pages, scanned up to 5 pages |
| Search | whether a posting is expired | the posting's status/validity text on the result or detail page |
| Search | `about_role`, `responsibilities`, `requirements` | that posting's own detail page (Descrição, Funções, Requisitos), empty if that fetch fails (AC-4) |
| Search | `source_url` | the posting's own emprego.co.mz URL |
| Search | `external_apply_url` | always empty (decided in AC-7) |
| Search | `salary` | usually empty; the site rarely publishes it |
| Search | `job_type` | the existing GPT-4o match call, extended to classify it from the posting's raw contract text (AC-6) |
| Search | `match_score`/`match_reason`/`matched_skills`/`missing_skills` | `agent/matcher.ts`'s existing `scoreJob`, unchanged |

**Key invariants**:
- A search never saves more than 10 jobs.
- A search never reads more than 5 pages of results looking for those 10.
- A saved job is never expired at the time it was found.
- `jobs.source` stays `'search'` for these rows, matching the existing check constraint; no new source value is introduced.
- A `(user_id, source_url)` pair is never duplicated (AC-11) — enforced at the database via `jobs_user_source_url_unique`, not just an application-level check.

**Security model**: Unchanged from today. The route requires a signed in session and a completed profile, exactly as the Adzuna version did; no new authorization surface.

**Configuration required**:
- `ADZUNA_APP_ID` / `ADZUNA_APP_KEY`: removed, no longer used.
- No new environment variables. emprego.co.mz's pages are public; there is no key to configure.

**Critical test scenarios**:
- Happy path: search "Engenheiro Civil", get up to 10 open postings with populated description sections and real match scores, verifies **AC-1**, **AC-3**, **AC-9**.
- Failure case: a posting's detail page fails to load mid search, that one job is still saved with the fields it has, a warning is logged, the rest of the search completes normally, verifies **AC-4**.
- Failure case: a broad keyword whose results are mostly expired, the search stops at 5 pages scanned rather than continuing indefinitely, verifies **AC-2**.
- Parser breakage: a results page returns HTTP 200 but the parser finds no postings on it, a distinct warning is logged rather than treating it as a genuine empty search, verifies **AC-8**.

## Build plan

Per this project's own build approach (mock UI first, then wire real logic, stated in `context/build-plan.md`'s Core Principle), this is a backend swap behind an already built UI, so there is no UI shell phase here; the existing Find Jobs page and job details page already render whatever the `jobs` table holds.

1. Add `cheerio` to `context/code-standards.md`'s approved dependencies list and install it, satisfies **AC-1** — done
2. Build `lib/emprego.ts`: fetch and parse a keyword search results page (title, company, location, expired flag, detail page URL), one page at a time, satisfies **AC-1**, **AC-2**, **AC-5** — done
3. Build the detail page fetch and parse in `lib/emprego.ts` (Descrição, Funções, Requisitos, raw contract text), with the zero results parsed warning from **AC-8**, satisfies **AC-3**, **AC-8** — done
4. Build `agent/emprego.ts` (`discoverJobs`, replacing `agent/adzuna.ts`): page scanning loop capped at 5 pages and 10 open postings, per job detail fetch with the AC-4 fallback, insert into `jobs`, satisfies **AC-1**, **AC-2**, **AC-4**, **AC-7** — done
5. Extend `agent/matcher.ts`'s `record_match` tool call to also return a classified `jobType` (or null) from the posting's raw contract text, satisfies **AC-6** — done
6. Rename `agent/types.ts`'s `NormalizedAdzunaJob` to `NormalizedJob` — done
7. Update `app/api/agent/find/route.ts`: drop `location` from the request schema, call the new `discoverJobs`, satisfies **AC-1**, **AC-9**, **AC-10** — done
8. Update `components/find-jobs/SearchControls.tsx`: remove the Location input and its state, satisfies **AC-1** — done
9. Delete `lib/adzuna.ts`, `agent/adzuna.ts`, and the `ADZUNA_APP_ID`/`ADZUNA_APP_KEY` entries in `context/code-standards.md`'s environment variable table and `.env.local.example`, satisfies **AC-10** — done
10. Verify live against the real site before wiring the UI test pass — done (see `progress-tracker.md`'s build entry for the real, live-verified result)

**Not in the original plan, added during the build**: `agent/research.ts`'s `deriveHomepageUrl()` (feature 13) assumed `job.source_url` redirects through to the employer's real site, the way Adzuna's did. emprego.co.mz job pages don't redirect anywhere (first-party posting pages), so this was fixed to exclude `emprego.co.mz`'s own hostname the same way `adzuna.com`'s tracking domain was already excluded — otherwise every future company research run on an emprego.co.mz job would have researched the job board instead of the employer.

**Not in the original plan, added 2026-08-13 from real usage after the build (AC-11)**: re-searching an already-saved job created a duplicate row instead of updating it, and the same job scored noticeably differently across identical searches. Fixed with `migrations/20260813030426_jobs-user-source-url-unique.sql` (`UNIQUE (user_id, source_url)`) plus switching `discoverJobs`'s final write from `.insert()` to `.upsert(jobRows, { onConflict: "user_id,source_url" })` — `company_research` is deliberately excluded from `jobRows` so an existing dossier survives a re-search untouched. `agent/matcher.ts`'s scoring temperature was also lowered 0.3 → 0.1 to reduce (not eliminate) score variance for an unchanged job/profile pair. Find Jobs' default sort also changed from Match Score to Newest (`app/(app)/find-jobs/page.tsx`), so a freshly (re-)found job surfaces at the top. See `progress-tracker.md`'s matching build entry for the live verification.

## Consequences

**Positive**:
- The app can finally return real results for its actual target market.
- Job descriptions become genuinely structured (overview, responsibilities, requirements) for the first time, an improvement over the Adzuna era's single unstructured blob.
- One discovery pipeline instead of a hypothetical two.

**Negative / tradeoffs**:
- Scraping is inherently more fragile than a real API: emprego.co.mz can change its page structure at any time with no notice or version, unlike Adzuna's documented, versioned API. AC-8's parser breakage warning is a partial mitigation, not a guarantee.
- Salary est. will show "Not disclosed" for nearly every job, since the site rarely publishes it (the existing UI already handles a missing salary gracefully, so this is a data availability change, not a bug).
- job_type will often be empty for postings whose contract text GPT-4o cannot classify.
- The app now only meaningfully serves Mozambique; broadening later would mean designing multi source support again.

**Neutral**:
- Existing `jobs` rows sourced from Adzuna during earlier development stay in the database untouched; nothing distinguishes their origin after this change, since there was never a column recording it. This is fine since nothing reads that origin.
- The Location field leaves the Find Jobs search UI; `components/find-jobs/SearchControls.tsx` changes from two inputs to one.

## Follow-up

- [ ] Feature 19 (bilingual support, not yet designed) will need to decide how Portuguese language job data from this source is handled in the UI; this spec deliberately leaves job data in Portuguese and defers translation strategy to that feature.
- [ ] `context/architecture.md`'s Stack table and Data Flow diagrams still name Adzuna; update them once this feature ships (owned by `/sync`, not this spec).
- [ ] Consider a lightweight integration check that re-verifies emprego.co.mz's page structure periodically, given AC-8 only detects breakage at search time, not proactively.

## Migration plan

**Strategy**: Direct replace (no feature flag, no side by side run). This app has no production traffic depending on Adzuna's Mozambique results, since there were none, which is what makes a direct replace appropriate here rather than a strangler rollout.
**Phases**:
1. Build the new `lib/emprego.ts` / `agent/emprego.ts` pipeline and verify it live against the real site.
2. Cut `app/api/agent/find/route.ts` over to it in the same change, remove the Adzuna files and the Location input.
**Rollback**: Revert the single commit; no data migration or backfill occurred, so reverting is complete.
**Risks**: The site's HTML structure could differ across categories or change between the design and build; the build should verify against a few different real category/keyword searches, not just one, before considering the pipeline done.
