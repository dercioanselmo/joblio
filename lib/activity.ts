import type { AgentRun, CompanyResearch } from "@/types";

export type SearchRunRow = Pick<AgentRun, "id" | "job_title_searched" | "jobs_found" | "started_at" | "completed_at">;

export type ResearchedJobRow = {
  id: string;
  company: string | null;
  company_research: CompanyResearch | null;
  updated_at: string;
};

export type ActivityDot = "info" | "success";

export type ActivityItem = {
  id: string;
  text: string;
  timestamp: string;
  dot: ActivityDot;
};

export function buildRecentActivity(
  runs: SearchRunRow[],
  researchedJobs: ResearchedJobRow[],
  limit: number = 5,
): ActivityItem[] {
  const searchEntries: ActivityItem[] = runs
    .filter((run) => run.job_title_searched !== null)
    .map((run) => ({
      id: `run-${run.id}`,
      text: `Found ${run.jobs_found} job${run.jobs_found === 1 ? "" : "s"} for ${run.job_title_searched}`,
      timestamp: run.completed_at ?? run.started_at,
      dot: "success" as const,
    }));

  const researchEntries: ActivityItem[] = researchedJobs
    .filter((job) => job.company_research !== null)
    .map((job) => ({
      id: `research-${job.id}`,
      text: `Researched ${job.company ?? "the company"}`,
      timestamp: job.updated_at,
      dot: "info" as const,
    }));

  return [...searchEntries, ...researchEntries]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
