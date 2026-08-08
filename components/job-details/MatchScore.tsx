import { Check, Sparkles, X } from "lucide-react";
import type { Job } from "@/types";

type Props = {
  job: Job;
};

export function MatchScore({ job }: Props) {
  const matchedSkills = job.matched_skills ?? [];
  const missingSkills = job.missing_skills ?? [];

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-6 shadow">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-lightest">
            <Sparkles className="h-4 w-4 text-success" aria-hidden="true" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            AI Match Reasoning
          </h2>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-text-primary">
          {job.match_reason ?? "No match reasoning available yet."}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          Required Skills vs Your Profile
        </h2>

        <div className="mt-4">
          <p className="text-sm text-text-muted">You have</p>
          {matchedSkills.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {matchedSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-success-lightest px-3 py-1.5 text-sm font-medium text-success-foreground"
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-muted">No matched skills available yet.</p>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm text-text-muted">Gap skills</p>
          {missingSkills.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-3 py-1.5 text-sm font-medium text-accent"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-text-muted">No gap skills identified.</p>
          )}
        </div>
      </div>
    </>
  );
}
