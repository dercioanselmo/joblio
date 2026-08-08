"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { Job } from "@/types";

type Props = {
  job: Job;
};

// Verified against context/designs/find-jobs.png's actual row colors, not the
// 80/60 cutoffs in ui-rules.md/ui-tokens.md — the design shows 90+ green,
// 80-89 blue, below 80 orange (e.g. 88% and 85% are blue, not green; 72% is
// orange, not blue). Design is source of truth per ui-registry.md convention.
function getMatchScoreBarColor(score: number): string {
  if (score >= 90) return "bg-success";
  if (score >= 80) return "bg-info";
  return "bg-warning";
}

// The only client-boundary piece of the (otherwise Server Component) jobs
// table — isolated to just the row so onClick navigation works without
// converting the whole table/page to a client component.
export function JobRow({ job }: Props) {
  const router = useRouter();

  return (
    <tr
      className="cursor-pointer border-t border-border hover:bg-surface-secondary"
      onClick={() => router.push(`/find-jobs/${job.id}`)}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-secondary">
            <Building2 className="h-4 w-4 text-text-secondary" aria-hidden="true" />
          </div>
          <span className="font-medium text-text-primary">{job.company ?? "Unknown"}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-text-primary">{job.title ?? "Untitled role"}</td>
      <td className="px-4 py-4">
        {job.match_score !== null ? (
          <div className="flex items-center gap-2">
            <div className="h-1 w-24 rounded-full bg-border-light">
              <div
                className={cn("h-1 rounded-full", getMatchScoreBarColor(job.match_score))}
                style={{ width: `${job.match_score}%` }}
              />
            </div>
            <span className="font-medium text-text-primary">{job.match_score}%</span>
          </div>
        ) : (
          <span className="text-text-muted">—</span>
        )}
      </td>
      <td className="px-4 py-4 text-text-primary">{job.salary ?? "Not disclosed"}</td>
      <td className="px-4 py-4 text-text-muted">{formatRelativeDate(job.found_at)}</td>
    </tr>
  );
}
