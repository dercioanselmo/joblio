import { SearchControls } from "@/components/find-jobs/SearchControls";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import { createInsforgeServer } from "@/lib/insforge-server";
import type { Job } from "@/types";

const PAGE_SIZE = 20;

export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const { data: authData } = await insforge.auth.getCurrentUser();
  const user = authData?.user;

  let jobs: Job[] = [];
  let totalCount = 0;

  if (user) {
    const { data, count } = await insforge.database
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("found_at", { ascending: false })
      .limit(PAGE_SIZE)
      .overrideTypes<Job[], { merge: false }>();

    jobs = data ?? [];
    totalCount = count ?? 0;
  }

  return (
    <div className="min-h-screen px-8 py-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <SearchControls />
        <div className="rounded-2xl border border-border bg-surface shadow">
          <JobFilters />
          {jobs.length > 0 ? (
            <>
              <JobsTable jobs={jobs} />
              <JobsPagination shownCount={jobs.length} totalCount={totalCount} pageSize={PAGE_SIZE} />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 border-t border-border px-4 py-16 text-center">
              <p className="text-sm text-text-muted">
                No jobs yet. Search above to find your first matches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
