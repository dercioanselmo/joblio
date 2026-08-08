import type { InsForgeClient } from "@insforge/sdk";
import { searchJobs, detectCountryFromLocation, type AdzunaJob } from "@/lib/adzuna";
import { scoreJob } from "@/agent/matcher";
import { MATCH_THRESHOLD } from "@/lib/utils";
import type { Profile } from "@/types";
import type { NormalizedAdzunaJob } from "@/agent/types";

function normalizeJob(job: AdzunaJob): NormalizedAdzunaJob {
  const salary =
    job.salary_min && job.salary_max
      ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`
      : null;

  return {
    title: job.title,
    company: job.company.display_name,
    location: job.location.display_name,
    description: job.description,
    redirectUrl: job.redirect_url,
    salary,
    jobType: job.contract_type || "fulltime",
  };
}

export async function discoverJobs(
  insforge: InsForgeClient,
  jobTitle: string,
  location: string,
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
    const country = detectCountryFromLocation(location);
    const rawJobs = await searchJobs(jobTitle, location, country);
    const normalized = rawJobs.map(normalizeJob);

    const scored = await Promise.all(normalized.map((job) => scoreJob(job, profile)));

    const failures = scored.filter(
      (result): result is { success: false; error: string } => !result.success,
    );

    if (failures.length > 0) {
      const logRows = failures.map((failure) => ({
        run_id: runId,
        user_id: userId,
        level: "warning" as const,
        message: `Job saved without a match score: scoring failed (${failure.error})`,
      }));
      const { error: logError } = await insforge.database.from("agent_logs").insert(logRows);
      if (logError) {
        console.error("[agent/adzuna]", logError);
      }
    }

    if (normalized.length === 0) {
      return { success: true, jobsSaved: 0, strongMatches: 0, matchScores: [] };
    }

    // A job whose scoring call failed (e.g. no AI credit) is still saved, just
    // without a score — never dropped just because scoring couldn't run.
    const jobRows = scored.map((result, index) => {
      const job = normalized[index];
      const base = {
        run_id: runId,
        user_id: userId,
        source: "search" as const,
        source_url: job.redirectUrl,
        external_apply_url: job.redirectUrl,
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        job_type: job.jobType,
        about_role: job.description,
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

    const { error: insertError } = await insforge.database.from("jobs").insert(jobRows);
    if (insertError) {
      console.error("[agent/adzuna]", insertError);
      return { success: false, error: "Failed to save discovered jobs." };
    }

    const matchScores = jobRows
      .map((row) => row.match_score)
      .filter((score): score is number => score !== null);
    const strongMatches = matchScores.filter((score) => score >= MATCH_THRESHOLD).length;

    return { success: true, jobsSaved: jobRows.length, strongMatches, matchScores };
  } catch (error) {
    console.error("[agent/adzuna]", error);
    return { success: false, error: String(error) };
  }
}
