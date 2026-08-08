import type { Job } from "@/types";

type Props = {
  job: Job;
};

export function JobActions({ job }: Props) {
  const applyUrl = job.external_apply_url ?? job.source_url;
  if (!applyUrl) return null;

  return (
    <a
      href={applyUrl}
      target="_blank"
      rel="noreferrer"
      className="flex w-full items-center justify-center rounded-md bg-accent px-6 py-4 text-base font-semibold text-accent-foreground shadow-sm transition transform hover:-translate-y-0.5 hover:bg-accent-dark"
    >
      Apply Now at {job.company ?? "the company"}
    </a>
  );
}
