import { Briefcase, Building2, Calendar, ExternalLink, MapPin } from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { Job } from "@/types";

type Props = {
  job: Job;
};

// Per ui-tokens.md's documented Match Score Colors table (90-100/70-89 green,
// 50-69 orange, below 50 gray) — a solid pill badge, not the JobsTable bar,
// which find-jobs.png separately overrode to a 90/80 cutoff. This badge's own
// design (job-details.png, 85% shown in green) matches the documented table
// exactly, so no override was needed here.
function matchScoreBadgeClasses(score: number): string {
  if (score >= 70) return "bg-success-lightest text-success-foreground";
  if (score >= 50) return "bg-warning/10 text-warning";
  return "bg-surface-secondary text-text-muted";
}

export function JobInfo({ job }: Props) {
  const applyUrl = job.source_url ?? job.external_apply_url;

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
              <Building2 className="h-6 w-6 text-text-secondary" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{job.title ?? "Untitled role"}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                <span>{job.company ?? "Unknown company"}</span>
                {job.match_score !== null ? (
                  <>
                    <span aria-hidden="true">&middot;</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        matchScoreBadgeClasses(job.match_score),
                      )}
                    >
                      {job.match_score}% Match Score
                    </span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">&middot;</span>
                    <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-text-muted">
                      Not yet scored
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition hover:bg-surface-secondary"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              View Job Post
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-lightest text-success">
            <span className="text-base font-bold">$</span>
          </div>
          <p className="mt-3 truncate text-lg font-bold text-text-primary">{job.salary ?? "—"}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Salary Est.</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-lightest text-info-medium">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 truncate text-lg font-bold text-text-primary">{job.location ?? "—"}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Location</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-light text-accent">
            <Briefcase className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 truncate text-lg font-bold text-text-primary">{job.job_type ?? "—"}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Job Type</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary text-text-secondary">
            <Calendar className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-3 truncate text-lg font-bold text-text-primary">{formatRelativeDate(job.found_at)}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">Date Found</p>
        </div>
      </div>
    </>
  );
}
