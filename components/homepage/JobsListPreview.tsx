import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewJob = {
  company: string;
  matchScore: number;
  salary: string;
  source: "LinkedIn" | "URL";
};

const JOBS: PreviewJob[] = [
  { company: "Vercel", matchScore: 94, salary: "$160k - $200k", source: "LinkedIn" },
  { company: "Stripe", matchScore: 88, salary: "$180k - $240k", source: "URL" },
  { company: "Linear", matchScore: 96, salary: "$150k - $190k", source: "LinkedIn" },
  { company: "Notion", matchScore: 72, salary: "$130k - $170k", source: "LinkedIn" },
  { company: "OpenAI", matchScore: 91, salary: "$200k - $280k", source: "LinkedIn" },
  { company: "Figma", matchScore: 85, salary: "$170k - $220k", source: "URL" },
];

// Same 90/80 cutoffs as components/find-jobs/JobRow.tsx's
// getMatchScoreBarColor — kept in sync with the real table's color rule.
function getMatchScoreBarColor(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 80) return "bg-info";
  return "bg-warning";
}

const GRID_COLS = "grid-cols-[1.4fr_1.2fr_1fr_0.8fr]";

// A decorative, static replica of the real Find Jobs table (JobsTable /
// JobRow) — mock data only, not wired to the real jobs.source enum
// ('search' | 'url'), since this is marketing content, not the real page.
export function JobsListPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div
        className={cn(
          "grid items-center gap-2 border-b border-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary",
          GRID_COLS,
        )}
      >
        <span>Company</span>
        <span>Match Score</span>
        <span>Salary Est.</span>
        <span>Source</span>
      </div>
      <ul>
        {JOBS.map((job) => (
          <li
            key={job.company}
            className={cn(
              "grid items-center gap-2 border-b border-border px-5 py-3.5 last:border-b-0",
              GRID_COLS,
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-secondary">
                <Building2 className="h-3.5 w-3.5 text-text-secondary" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-text-primary">{job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-14 rounded-full bg-border-light">
                <div
                  className={cn("h-1 rounded-full", getMatchScoreBarColor(job.matchScore))}
                  style={{ width: `${job.matchScore}%` }}
                />
              </div>
              <span className="text-sm font-medium text-text-primary">{job.matchScore}%</span>
            </div>
            <span className="text-sm text-text-primary">{job.salary}</span>
            <span
              className={cn(
                "w-fit rounded-full px-2.5 py-1 text-xs font-medium",
                job.source === "LinkedIn"
                  ? "bg-linkedin-light text-linkedin"
                  : "bg-surface-secondary text-text-secondary",
              )}
            >
              {job.source}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
