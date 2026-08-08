import { FileText } from "lucide-react";
import type { Job } from "@/types";

type Props = {
  job: Job;
};

export function JobDescription({ job }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-secondary">
          <FileText className="h-4 w-4 text-text-secondary" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-text-primary">Job Description</h2>
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
        {job.about_role ?? "No description available for this job."}
      </p>
    </div>
  );
}
