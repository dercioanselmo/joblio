type JobRow = {
  company: string;
  title: string;
  score: number;
  salary?: string;
  source?: string;
};

export function JobListCard({ jobs }: { jobs: JobRow[] }) {
  return (
    <div className="w-full rounded-xl bg-surface p-6 shadow-sm border border-border">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-[14px] font-semibold text-text-dark">Recent matches</h4>
        <div className="text-[12px] text-text-muted">Jobs by Adzuna</div>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={`${job.company}-${job.title}`} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-surface-secondary flex items-center justify-center text-[12px] font-semibold text-text-dark">{job.company.charAt(0)}</div>
              <div>
                <div className="text-[14px] font-medium text-text-dark">{job.title}</div>
                <div className="text-[12px] text-text-secondary">{job.company}</div>
              </div>
            </div>

            <div className="flex w-64 max-w-[35%] flex-col items-end">
              <div className="mb-2 flex items-center gap-3">
                <div className="text-[14px] font-semibold text-text-dark">{job.score}%</div>
                <div className="w-28 overflow-hidden rounded-full bg-border-light h-2">
                  <div
                    style={{ width: `${job.score}%` }}
                    className={`h-2 rounded-full ${job.score >= 80 ? "bg-success" : job.score >= 60 ? "bg-info" : "bg-warning"}`}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 text-[12px] text-text-secondary">
                <div>{job.salary ?? "—"}</div>
                <div className="rounded-full bg-surface-secondary px-2 py-0.5 text-[12px] font-medium">{job.source ?? "Search"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobListCard;
