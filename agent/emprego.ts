import type { InsForgeClient } from "@insforge/sdk";
import { fetchSearchResultsPage, fetchJobDetail, type EmpregoSearchResult } from "@/lib/emprego";
import { scoreJob } from "@/agent/matcher";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { Profile } from "@/types";
import type { NormalizedJob } from "@/agent/types";

// AC-2 / AC-1: scan up to 5 pages looking for up to 10 currently-open
// postings — a broad keyword can span thousands of pages on this site
// (most of them expired), so both caps are load-bearing, not arbitrary.
const MAX_PAGES_SCANNED = 5;
const MAX_RESULTS = 10;

async function collectActiveResults(
  jobTitle: string,
): Promise<{ results: EmpregoSearchResult[]; parserWarning: boolean }> {
  const collected: EmpregoSearchResult[] = [];
  let parserWarning = false;

  for (let page = 1; page <= MAX_PAGES_SCANNED && collected.length < MAX_RESULTS; page++) {
    const pageResults = await fetchSearchResultsPage(jobTitle, page);

    if (pageResults === null) {
      // The fetch itself failed (network error, non-200) — stop rather than
      // hammering a site that's already not responding.
      break;
    }

    if (pageResults.length === 0) {
      // AC-8: a successful fetch that parses to zero rows on the very first
      // page is a real signal (the site's markup may have changed), distinct
      // from later pages legitimately running out of results.
      if (page === 1) parserWarning = true;
      break;
    }

    for (const result of pageResults) {
      if (!result.isExpired) collected.push(result);
      if (collected.length >= MAX_RESULTS) break;
    }
  }

  return { results: collected.slice(0, MAX_RESULTS), parserWarning };
}

async function normalizeWithDetail(
  result: EmpregoSearchResult,
): Promise<{ job: NormalizedJob; detailFetchFailed: boolean }> {
  const detail = await fetchJobDetail(result.detailUrl);

  return {
    job: {
      title: result.title,
      company: result.companyName,
      location: result.location,
      description: detail?.aboutRole ?? "",
      responsibilities: detail?.responsibilities ?? [],
      requirements: detail?.requirements ?? [],
      sourceUrl: result.detailUrl,
      // AC-7: no source-wide "apply URL" exists on this site (apply method
      // varies per posting — email, an emprego.co.mz account, or a link).
      // external_apply_url stays null; the existing Apply Now button
      // already falls back to source_url with no code change needed there.
      salary: null,
      jobType: null,
    },
    // AC-4: caller keeps this job with empty description/responsibilities/
    // requirements rather than dropping it, and logs a warning.
    detailFetchFailed: detail === null,
  };
}

export async function discoverJobs(
  insforge: InsForgeClient,
  jobTitle: string,
  profile: Profile,
  userId: string,
  runId: string,
): Promise<{
  success: boolean;
  jobsSaved?: number;
  strongMatches?: number;
  matchScores?: number[];
  error?: string;
}> {
  try {
    const { results, parserWarning } = await collectActiveResults(jobTitle);

    if (parserWarning) {
      const { error: logError } = await insforge.database.from("agent_logs").insert([
        {
          run_id: runId,
          user_id: userId,
          level: "warning",
          message:
            "emprego.co.mz search returned zero results on the first page — the site's structure may have changed.",
        },
      ]);
      if (logError) {
        console.error("[agent/emprego]", logError);
      }
    }

    if (results.length === 0) {
      return { success: true, jobsSaved: 0, strongMatches: 0, matchScores: [] };
    }

    const normalizedWithMeta = await Promise.all(results.map(normalizeWithDetail));

    const detailFailures = normalizedWithMeta.filter((entry) => entry.detailFetchFailed);
    if (detailFailures.length > 0) {
      const logRows = detailFailures.map((entry) => ({
        run_id: runId,
        user_id: userId,
        level: "warning" as const,
        message: `Saved "${entry.job.title}" without a full description: its detail page could not be read.`,
      }));
      const { error: logError } = await insforge.database.from("agent_logs").insert(logRows);
      if (logError) {
        console.error("[agent/emprego]", logError);
      }
    }

    const normalized = normalizedWithMeta.map((entry) => entry.job);
    const scored = await Promise.all(normalized.map((job) => scoreJob(job, profile)));

    // A job whose scoring call failed (e.g. no AI credit) is still saved,
    // just without a score — never dropped just because scoring couldn't run.
    const scoringFailures = scored.filter(
      (result): result is { success: false; error: string } => !result.success,
    );
    if (scoringFailures.length > 0) {
      const logRows = scoringFailures.map((failure) => ({
        run_id: runId,
        user_id: userId,
        level: "warning" as const,
        message: `Job saved without a match score: scoring failed (${failure.error})`,
      }));
      const { error: logError } = await insforge.database.from("agent_logs").insert(logRows);
      if (logError) {
        console.error("[agent/emprego]", logError);
      }
    }

    const jobRows = scored.map((result, index) => {
      const job = normalized[index];
      const base = {
        run_id: runId,
        user_id: userId,
        source: "search" as const,
        source_url: job.sourceUrl,
        external_apply_url: null,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        // AC-6: classified by the scoring call from the posting's own text;
        // null when nothing in it implies a type — never guessed here.
        job_type: result.success ? result.job.jobType : job.jobType,
        about_role: job.description || null,
        responsibilities: job.responsibilities.length > 0 ? job.responsibilities : null,
        requirements: job.requirements.length > 0 ? job.requirements : null,
        found_at: new Date().toISOString(),
      };

      if (result.success) {
        return {
          ...base,
          match_score: result.job.matchScore,
          match_reason: result.job.matchReason,
          matched_skills: result.job.matchedSkills,
          missing_skills: result.job.missingSkills,
        };
      }

      return {
        ...base,
        match_score: null,
        match_reason: null,
        matched_skills: null,
        missing_skills: null,
      };
    });

    // Re-finding a posting already saved for this user (same source_url)
    // updates that row — new score, new found_at so it sorts as freshly
    // found — instead of duplicating it. `jobs_user_source_url_unique`
    // (migrations/20260813030426) is the conflict target. company_research,
    // id, and created_at are deliberately absent from jobRows, so on
    // conflict PostgREST's ON CONFLICT DO UPDATE leaves them untouched — a
    // job the user already researched keeps that dossier across re-searches.
    const { error: upsertError } = await insforge.database
      .from("jobs")
      .upsert(jobRows, { onConflict: "user_id,source_url" });
    if (upsertError) {
      console.error("[agent/emprego]", upsertError);
      return { success: false, error: "Failed to save discovered jobs." };
    }

    const matchScores = jobRows
      .map((row) => row.match_score)
      .filter((score): score is number => score !== null);
    const strongMatches = matchScores.filter((score) => score >= MATCH_THRESHOLD).length;

    return { success: true, jobsSaved: jobRows.length, strongMatches, matchScores };
  } catch (error) {
    console.error("[agent/emprego]", error);
    return { success: false, error: String(error) };
  }
}
