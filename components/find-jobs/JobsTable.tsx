import { JobRow } from "@/components/find-jobs/JobRow";
import type { Job } from "@/types";

type Props = {
  jobs: Job[];
};

export function JobsTable({ jobs }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-medium uppercase tracking-wide text-text-secondary">
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Match Score</th>
            <th className="px-4 py-3">Salary Est.</th>
            <th className="px-4 py-3">Date Found</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
