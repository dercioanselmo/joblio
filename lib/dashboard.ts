import type { Job } from "@/types";

export type DashboardJobRow = Pick<Job, "match_score" | "company_research" | "found_at">;

export type DashboardStats = {
  totalJobsFound: number;
  totalJobsTrend: number | null;
  avgMatchRate: number;
  avgMatchRateTrend: number | null;
  companiesResearched: number;
  jobsThisWeek: number;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoresOf(jobs: DashboardJobRow[]): number[] {
  return jobs
    .map((job) => job.match_score)
    .filter((score): score is number => score !== null);
}

export function computeDashboardStats(jobs: DashboardJobRow[]): DashboardStats {
  const now = Date.now();
  const weekAgo = now - 7 * ONE_DAY_MS;
  const twoWeeksAgo = now - 14 * ONE_DAY_MS;

  const thisWeekJobs = jobs.filter((job) => new Date(job.found_at).getTime() >= weekAgo);
  const lastWeekJobs = jobs.filter((job) => {
    const foundAt = new Date(job.found_at).getTime();
    return foundAt >= twoWeeksAgo && foundAt < weekAgo;
  });

  const totalJobsTrend =
    lastWeekJobs.length > 0
      ? Math.round(((thisWeekJobs.length - lastWeekJobs.length) / lastWeekJobs.length) * 100)
      : null;

  const overallAvg = average(scoresOf(jobs));
  const thisWeekAvg = average(scoresOf(thisWeekJobs));
  const lastWeekAvg = average(scoresOf(lastWeekJobs));

  const avgMatchRateTrend =
    thisWeekAvg !== null && lastWeekAvg !== null ? Math.round(thisWeekAvg - lastWeekAvg) : null;

  return {
    totalJobsFound: jobs.length,
    totalJobsTrend,
    avgMatchRate: overallAvg !== null ? Math.round(overallAvg) : 0,
    avgMatchRateTrend,
    companiesResearched: jobs.filter((job) => job.company_research !== null).length,
    jobsThisWeek: thisWeekJobs.length,
  };
}

export function formatTrend(value: number): string {
  return `${value >= 0 ? "+" : ""}${value}%`;
}
