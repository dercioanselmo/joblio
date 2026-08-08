# 0001. Adzuna job discovery pipeline

**Date**: 2026-08-08
**Status**: Accepted

Built and verified 2026-08-08 (this project tracks build status in `context/progress-tracker.md` rather than `docs/scope/`, so this spec has no linked scope row; status is set directly to `Accepted` once the feature shipped and was verified, mirroring this project's own progress-tracker convention).

## Summary

This decision defines how Joblio finds jobs for a user. When a signed in user with a saved profile searches by job title and location, the app calls the Adzuna job search API, scores every result against that user's profile with Claude (an AI model), and saves every scored job to the database. The Find Jobs page then shows the user's real saved jobs instead of the placeholder data used while the page's look was being built.

## Context

Feature 09 built the Find Jobs page UI against mock data only. `context/build-plan.md` describes the intended Adzuna integration at a high level (call the API, score with an AI model, save to the database) and `context/library-docs.md` documents the exact Adzuna request and response shape. Neither document settles how the pipeline actually executes: whether the page should show real results as soon as this feature ships or stay on mock data until filtering and pagination are wired in a later feature, whether a search can run without a saved profile, whether the work happens inside the HTTP request or in a background job, how per job scoring failures are handled, whether repeated searches should deduplicate jobs, and how a free text location string becomes the country code Adzuna's API requires.

The project has no background job infrastructure anywhere, and `context/project-overview.md` explicitly lists scheduled agent runs and a live agent feed as out of scope. The team's own build process principle (`context/build-plan.md`: "every feature must be visible and testable... no invisible backend phases") argues against shipping a backend pipeline whose output nobody can see on the page yet. The project's Claude account is also known to have no funded credit as of this writing (the same blocker hit in features 07 and 08); this doesn't change the design, but it does change how the feature gets verified.

## Options considered

### Option 1: Synchronous single request, parallel per job scoring (chosen)

The `/api/agent/find` route handler does everything inside one HTTP request/response cycle: call Adzuna, then score every returned job against the user's profile with Claude, running those scoring calls concurrently (`Promise.all`), then save the results, then respond.

**Pros**:
- No new infrastructure; fits a project with no background job runner anywhere else.
- Concurrent scoring keeps total latency close to the slowest single Claude call rather than the sum of all of them.
- Matches the project's own scope boundary: "scheduled agent runs" and "live agent feed" are explicitly out of scope, implying request/response is the intended shape.

**Cons**:
- A slow Adzuna response or many slow Claude calls all add directly to how long the user's browser waits with the button disabled; no partial progress is shown mid request.
- Up to 10 concurrent outbound Claude calls per search is a real (if currently small) burst load on the account.

### Option 2: Synchronous, sequential per job scoring

Same as Option 1 but score one job at a time in a loop instead of concurrently.

**Pros**:
- Simplest possible control flow; trivially safe against any per account concurrent request limit.

**Cons**:
- Total latency scales linearly with the number of jobs returned (up to 10x slower than Option 1 in the worst case), directly worsening the one thing users notice: how long "Find Jobs" takes to respond.

### Option 3: Background job with polling

The route creates the `agent_runs` row and returns immediately; a worker (or a fire and forget async function) does the Adzuna call and scoring afterward; the client polls `agent_runs.status` until it flips to `completed`.

**Pros**:
- The HTTP request itself never times out regardless of how many jobs are scored.

**Cons**:
- Requires a queue or a durable background execution model this project has nowhere else; Next.js route handlers do not reliably keep running work after the response is sent.
- Directly contradicts the project's own listed out of scope items (scheduled/background agent runs, a live feed to poll against).

## Decision

**Chosen option**: Option 1: Synchronous single request, parallel per job scoring.

The `/api/agent/find` route runs the whole pipeline, Adzuna search through Claude scoring through database writes, inside one request, scoring every returned job concurrently, and the Find Jobs page is wired to real data as part of this same feature rather than staying on mock data.

## Rationale

Option 3 solves a latency problem the project doesn't have evidence of yet (Adzuna returns at most 10 results per search, per the existing `results_per_page: "10"` convention in `library-docs.md`) at the cost of infrastructure the project has deliberately avoided everywhere else; it is exactly the kind of premature complexity this feature doesn't need. Between the two synchronous options, sequential scoring's only advantage is simplicity, and the concurrency Option 1 needs (`Promise.all` over at most 10 independent calls) is not meaningfully more complex to write or reason about; the latency difference is the one thing a user directly feels every time they click "Find Jobs," so it is the deciding factor.

Wiring the Find Jobs page to real data now, rather than leaving it on the feature 09 mock table until a later feature, follows directly from `build-plan.md`'s own stated principle that no feature should ship an invisible backend phase; a user who runs a real search and sees the same six mock rows they saw before would reasonably conclude the feature is broken.

## Feature design

**Data model sketch**:

No schema changes. Reuses the existing `agent_runs` and `jobs` tables (`db/schema.sql`, applied in feature 04):

- `agent_runs`: one row per search (`user_id`, `status: running|completed|failed`, `job_title_searched`, `location_searched`, `jobs_found`, `started_at`, `completed_at`).
- `jobs`: one row per job this feature saves (`run_id` set, `user_id`, `source: 'search'`, `source_url`, `external_apply_url`, `title`, `company`, `location`, `salary`, `job_type`, `about_role`, `match_score`, `match_reason`, `matched_skills`, `missing_skills`, `found_at`). `responsibilities` / `requirements` / `nice_to_have` / `benefits` / `about_company` / `company_research` stay `null` from this feature (see Follow up).
- `agent_logs`: one warning row per job whose scoring failed (`run_id`, `user_id`, `level: 'warning'`, `message`, `job_id: null` since a log row is written before the batch insert assigns ids) — the job itself is still saved to `jobs` with a `null` score, not dropped (see AC-5) — and one error row if the whole Adzuna call fails.

**State transitions**:

`agent_runs.status`: `running` (created at the start of the request) → `completed` (Adzuna succeeded, zero or more jobs saved, including the zero results case) or `failed` (Adzuna itself errored before any per job work could happen).

**API surface**:

| Endpoint | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `/api/agent/find` | POST | `jobTitle: string` (req, non empty), `location: string` (opt) | `{ jobsFound, strongMatches, message }` | session required | 401 unauthenticated, 400 empty `jobTitle` / no profile row, 500 Adzuna failure |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| POST /api/agent/find | `jobTitle`, `location` | request body, from the client form |
| POST /api/agent/find | `userId` | session, `createInsforgeServer()` + `getCurrentUser()` |
| POST /api/agent/find | the user's profile (for scoring) | DB read, `profiles` where `id = userId`; 400 if no row |
| POST /api/agent/find | Adzuna `country` code | derived from `location` by `detectCountryFromLocation()` (keyword match against gb/au/ca signal words, default `'us'`), `lib/adzuna.ts` |
| POST /api/agent/find | `run_id` | the `agent_runs` row this request creates |
| POST /api/agent/find | `matchScore` / `matchReason` / `matchedSkills` / `missingSkills` per job | Claude tool call output, `agent/matcher.ts`, given the job + the profile fetched above |
| POST /api/agent/find | `salary` string per job | derived from Adzuna's `salary_min`/`salary_max`, per the existing formatting rule in `library-docs.md` |
| POST /api/agent/find | `jobsFound` | count of jobs actually inserted this run (every scored job, whether or not its scoring succeeded) |
| POST /api/agent/find | `strongMatches` | count of inserted jobs with `match_score >= MATCH_THRESHOLD` (`lib/utils.ts`) |
| POST /api/agent/find | `message` | derived from `jobsFound`/`strongMatches`, or the zero results fallback string when `jobsFound = 0` |
| GET /find-jobs (page render) | the user's job list | DB read, `jobs` where `user_id = userId` order by `found_at desc` limit 20 |
| GET /find-jobs (page render) | total job count | DB read, `jobs` count where `user_id = userId` |
| GET /find-jobs (page render) | each row's "Date Found" string | derived from `jobs.found_at` via a relative time helper (`lib/utils.ts`) |

**Key invariants**:

- Every `jobs`/`agent_runs`/`agent_logs` row this feature writes has `user_id` equal to the authenticated caller.
- `jobs.source` is always `'search'` for rows this feature creates.
- `agent_runs.jobs_found` always equals the number of `jobs` rows actually inserted for that `run_id`, which equals the raw Adzuna result count for the run (every returned job is saved, scored or not).
- `jobs.match_score` is always an integer 0 to 100 when present (already enforced by the existing DB check constraint).

**Security model**:

Standard session auth (InsForge), same as every other route in this project: 401 if no session. Row level security on `profiles`/`agent_runs`/`jobs`/`agent_logs` (already applied in feature 04) scopes every row to `auth.uid()`; this route only ever writes through the caller's own session client (`createInsforgeServer()`), never an admin client, so a request can only ever read or write its own user's rows. No new compliance scope; no PII beyond what the `profiles` table already holds.

**Configuration required**:

None new. `ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, and `CLAUDE_API_KEY` are already present in `.env.local` from earlier features.

**Critical test scenarios**:

- Happy path: a signed in user with a complete profile searches "Frontend Engineer" / "Remote"; Adzuna returns results, each is scored, all are saved, the success banner shows the real counts, and the page below shows the real rows. Verifies **AC-1**, **AC-3**, **AC-4**, **AC-7**, **AC-12**.
- Failure case: the Adzuna call itself errors (bad credentials, network failure, non 2xx); `agent_runs.status` becomes `failed`, an `agent_logs` error row is written, no jobs are saved, and the client gets a generic human readable error. Verifies **AC-9**.
- Failure case: Claude's scoring call fails for exactly one of several returned jobs; that job is still saved with a `null` score and logged, the rest are saved normally with real scores. Verifies **AC-5**.
- Auth/permission: an unauthenticated POST to `/api/agent/find` returns 401 and touches no data. Verifies **AC-13**.
- No profile: a signed in user with no `profiles` row gets a clear "complete your profile first" message and no Adzuna call is made. Verifies **AC-10**.

## Requirements

**User stories**:
- As a job seeker, I want to search by job title and location and have the app find and score real jobs against my profile, so I don't have to manually search and evaluate listings myself.
- As a job seeker, I want to see my saved jobs on the Find Jobs page right after a search, so I know the search actually did something.

**Acceptance criteria**:
- **AC-1**: A signed in user with a saved profile can submit a job title (required) and an optional location, and trigger a real search.
- **AC-2**: The search calls Adzuna's IT jobs search endpoint with the given title/location and a country code derived from the location by keyword matching (default `us`).
- **AC-3**: Every job Adzuna returns is scored against the user's profile via Claude (`matchScore`, `matchReason`, `matchedSkills`, `missingSkills`), with all per job scoring calls running concurrently.
- **AC-4**: Every successfully scored job is saved to `jobs` (`source: 'search'`, all structured fields populated except the still deferred description structuring), regardless of its score.
- **AC-5**: A job whose scoring call fails is still saved (with `match_score`/`match_reason`/`matched_skills`/`missing_skills` left `null`, rendered as no score in the UI rather than dropped), logged to `agent_logs`, and does not stop the rest of the run. (Amended 2026-08-08: originally specified as "skip it, don't save it"; changed after live testing hit the Claude account's credit block on every job, which under the original rule would have silently returned zero jobs from every real search. Never showing a job just because the AI step failed is the more useful behavior regardless of cause.)
- **AC-6**: An `agent_runs` row is created at the start of the run and updated to `completed` (with the real `jobs_found` count) or `failed` at the end.
- **AC-7**: The response reports `jobsFound` and `strongMatches` (`match_score >= MATCH_THRESHOLD`), and a message of the form "Found {N} jobs and saved {M} strong matches."
- **AC-8**: If Adzuna returns zero results, the run still completes successfully with a friendly message; this is not treated as an error.
- **AC-9**: If the Adzuna API call itself fails, `agent_runs` is marked `failed`, an `agent_logs` error row is written, and the client receives a generic, human readable error, never the raw underlying error.
- **AC-10**: If the user has no `profiles` row yet, the search is blocked with a clear message before any Adzuna call is made.
- **AC-11**: PostHog fires `job_search_started` once per search and `job_found` once per saved job, with the properties already defined in `code-standards.md`.
- **AC-12**: After a search, the Find Jobs page shows the user's real jobs (most recent first, up to the page's fetch limit) instead of the feature 09 mock table. Filter, sort, and paginate interactivity stay out of scope for this feature (feature 11).
- **AC-13**: Every read and write this feature performs is scoped to the authenticated caller; an unauthenticated request is rejected before touching any data.
- **AC-14**: A job found again on a later search (same company / apply URL) is inserted as a new row; this feature does not deduplicate across searches.

## Build plan

1. Add `MATCH_THRESHOLD` (`= 70`) and a `formatRelativeDate()` helper to `lib/utils.ts` (matches `code-standards.md`'s mandated constant, and the "2 hours ago" / "Yesterday" / "N days ago" wording the mock table already established in feature 09). Satisfies **AC-7**, **AC-12**.
2. Add `Job` and `AgentRun` types to `types/index.ts`, mirroring `db/schema.sql`. Supports every later task.
3. Build `lib/adzuna.ts`: `searchJobs(jobTitle, location, country)` (the fetch wrapper from `library-docs.md`) plus `detectCountryFromLocation(location)` (keyword heuristic: gb/uk/london-style signals → `gb`, australia/city signals → `au`, canada/city signals → `ca`, else `us`). Satisfies **AC-2**.
4. Build `agent/types.ts`: `AdzunaJob`, `NormalizedAdzunaJob`, `ScoredJob`. Supports **AC-3**, **AC-4**.
5. Build `agent/matcher.ts`: `scoreJob(job, profile)`, a forced Claude tool call (`record_match`, temperature 0.3, ~400 max tokens) returning `{ success, matchScore, matchReason, matchedSkills, missingSkills }` or `{ success: false, error }`, following the same pattern as `app/api/resume/extract/route.ts`. Satisfies **AC-3**, **AC-5**.
6. Build `agent/adzuna.ts`: `discoverJobs(jobTitle, location, profile, userId, runId)`, calling `lib/adzuna.ts`, scoring every job in parallel (`Promise.all`), logging scoring failures to `agent_logs` (without dropping the job), batch inserting every job (scored or not) into `jobs` (array insert, one round trip, per `AGENTS.md`'s InsForge pattern), returning `{ success, jobsSaved, strongMatches, matchScores, error? }`. Satisfies **AC-3**, **AC-4**, **AC-5**, **AC-14**.
7. Build `app/api/agent/find/route.ts`: auth check, body validation (zod), profile existence check, create the `agent_runs` row, call `discoverJobs`, update `agent_runs` (`completed`/`failed`), fire `job_search_started`/`job_found` via `lib/posthog-server.ts` (one client per request, one `shutdown()` in `finally`), `revalidatePath("/find-jobs")`, and return the `{ success, data: { jobsFound, strongMatches, message } }` contract, including the zero results and Adzuna failure branches. Satisfies **AC-1**, **AC-2**, **AC-6**, **AC-7**, **AC-8**, **AC-9**, **AC-10**, **AC-11**, **AC-13**.
8. Wire `components/find-jobs/SearchControls.tsx` into a client component: controlled `jobTitle`/`location` inputs, a submit handler that POSTs to the route, a loading/disabled state on the button, the success banner rendering the response's real `message`, an error banner on failure, and `router.refresh()` after a successful search. Satisfies **AC-1**, **AC-7**.
9. Convert `app/(app)/find-jobs/page.tsx` into a real data fetch (the user's `jobs`, `found_at desc`, limit 20, plus a total count), remove `MOCK_JOBS` from `JobsTable.tsx` in favor of a real `jobs: Job[]` prop, add an empty state ("No jobs yet. Search above to find your first matches."), and feed `JobsPagination` the real total/range (still no click behavior; that's feature 11). Satisfies **AC-12**.
10. Verify end to end against the real InsForge project: real Adzuna call, real DB writes, real PostHog events, real page render. Claude's scoring call is expected to hit the same funding blocker as features 07/08; verify the rest of the pipeline with mock scoring output standing in, same precedent. Satisfies **AC-1** through **AC-14**.

## Consequences

**Positive**:
- Users get real, profile matched job results instead of mock data, and the Find Jobs page becomes genuinely functional in this feature rather than staying static for two more feature cycles.
- Establishes the Adzuna → Claude → database pipeline pattern (`agent/adzuna.ts`, `agent/matcher.ts`) that future agent features can follow.

**Negative / tradeoffs**:
- Parallel scoring means up to 10 concurrent Claude calls per search, a real (if currently small) burst load on the account, versus the lower, steadier load sequential scoring would produce.
- No deduplication means a job appearing in results across multiple searches accumulates as multiple rows over time.
- No per user rate limiting means a user can trigger unlimited searches; acceptable for now given current usage, worth revisiting if cost becomes a concern.
- `responsibilities` / `requirements` / `nice_to_have` / `benefits` stay `null` from this feature; the Job Details page (feature 12) will only have the raw Adzuna snippet (`about_role`) to show until a later pass adds structuring.

**Neutral**:
- `lib/adzuna.ts` / `agent/adzuna.ts` establishes the `lib` (client) vs `agent` (orchestration) split `architecture.md`'s System Boundaries table already calls for; future agent features should follow the same split rather than putting orchestration logic in `lib/`.
- `MATCH_THRESHOLD` and `formatRelativeDate()` become shared utilities other features (dashboard stats, job details) are expected to reuse rather than reimplement.

## Follow-up

- [ ] No per user rate limit on searches; revisit if Adzuna/Claude cost becomes a concern.
- [ ] No deduplication of repeated job discoveries; revisit if the jobs list visibly accumulates duplicates for real users.
- [ ] `responsibilities`/`requirements`/`nice_to_have`/`benefits` stay `null` from this feature; a later feature should decide whether/how to populate them (a full job description fetch, or Claude best effort extraction from the snippet).
- [ ] The project's Claude account has no funded credit as of this spec (same blocker as features 07/08); this feature's Claude calls will fail with the same billing error until that's resolved. Doesn't block building or verifying the rest of the pipeline.
