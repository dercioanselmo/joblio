# 0002. Rationale — Replace Adzuna with emprego.co.mz as the job discovery source

## Context

Adzuna's job search API covers many countries, but Mozambique is not one of them, so the app currently cannot find any real jobs for its actual target market. emprego.co.mz is the market relevant source instead, since it lists jobs specifically for Mozambique.

emprego.co.mz publishes no public API, no RSS feed, and no developer documentation (confirmed by inspecting the site directly). Its pages are plain server rendered HTML from a WordPress based job board, so a request for a page returns the full listing content in the response, with no client side script needed to see it. This is different from the company research feature elsewhere in the app, which does need a real browser (Browserbase and Stagehand) because those company sites often only load content through client side scripts.

The site's own `robots.txt` disallows only admin and system paths; the job listing, search, and category pages the app needs are not disallowed, and no crawl delay is specified. Its keyword search (`?s=`) and its location browsing (`/cidade/{slug}/`) do not combine: passing both at once returns keyword results regardless of the requested city (confirmed by testing directly). A broad keyword can match many pages of results, most of them expired, so any implementation must bound how many pages it reads rather than trying to read "all" results. (During the design conversation, one AI-summarized inspection of a broad term reported roughly 5000 pages; during the actual build, reading the site's raw HTML directly showed real page counts more modestly in the range of a few dozen to a few hundred for the terms tested, though still unbounded enough that a scan cap is the right call either way. The design decision this fact informed, a fixed cap of 10 results scanned across up to 5 pages, does not change based on the corrected number, so this note is a factual correction to the record, not a reopened decision.)

Individual job pages carry clearly labeled sections (Descrição, Funções, Requisitos) that map cleanly onto the app's existing `about_role`, `responsibilities`, and `requirements` columns; these have stayed empty since the app's original Adzuna integration because Adzuna's own description text was too short and unstructured to split reliably. Salary is rarely shown on this site. There is no single, guaranteed way to apply: postings checked during this design showed three different methods (an external style link, an email address, and creating an account on emprego.co.mz itself), unlike Adzuna, which always gave a direct apply link.

## Options considered

### Option 1: Run emprego.co.mz alongside Adzuna (strangler pattern), route by detected country

Keep both pipelines. Detect whether a search's location is in Mozambique and route to emprego.co.mz; otherwise keep using Adzuna.

**Pros**:
- Lower risk cutover pattern, generally the right instinct for a live production migration.
- Keeps non Mozambique coverage.

**Cons**:
- Two discovery pipelines to maintain with genuinely different data shapes (salary present vs. usually absent, guaranteed apply link vs. not, structured description vs. not).
- The engineer has already stated the intent is a full migration, not adding a second market; Adzuna never had Mozambique coverage, so there is no real traffic to migrate incrementally, which is the exact case the strangler pattern is meant for.

### Option 2: Replace Adzuna directly with emprego.co.mz

Remove the Adzuna pipeline outright and build the emprego.co.mz pipeline as its full replacement, reusing the existing pipeline shape (search, normalize, score, save).

**Pros**:
- One discovery pipeline, one data shape, nothing dormant to maintain.
- Directly matches how the engineer framed this request ("migration", not "add a source"), and this app has no live production users depending on Adzuna's Mozambique results, since there were none to depend on.

**Cons**:
- If Mozambique only coverage later turns out to be wrong for the product, Adzuna would need to be re-added rather than re-enabled.

## Rationale

A strangler pattern earns its cost when a live system already carries real traffic that a bad cutover could break. Adzuna never returned Mozambique results, so there is no existing behavior in that market to protect, which removes the main reason to run both pipelines at once. The engineer's own framing ("migration", replacing one source with another) and the small size of this codebase (no other feature depends on Adzuna specifically, only on the `jobs` table shape both pipelines fill the same way) both point at a direct replacement being the honest, lower complexity choice here.
