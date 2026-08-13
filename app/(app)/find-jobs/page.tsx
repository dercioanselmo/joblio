import { SearchControls } from "@/components/find-jobs/SearchControls";
import { JobFilters } from "@/components/find-jobs/JobFilters";
import { JobsTable } from "@/components/find-jobs/JobsTable";
import { JobsPagination } from "@/components/find-jobs/JobsPagination";
import { createInsforgeServer } from "@/lib/insforge-server";
import { MATCH_THRESHOLD, sanitizeSearchTerm } from "@/lib/utils";
import type { Job } from "@/types";

const PAGE_SIZE = 20;

type MatchFilter = "all" | "high" | "low";
type SortOption = "matchScore" | "newest" | "oldest";

function parseFilter(value: string | undefined): MatchFilter {
  return value === "high" || value === "low" ? value : "all";
}

// Default is "newest" (most recently found first) — the newest search
// results belong at the top, so a freshly re-searched job (updated via the
// jobs_user_source_url_unique upsert) reliably surfaces where it was found.
function parseSort(value: string | undefined): SortOption {
  return value === "matchScore" || value === "oldest" ? value : "newest";
}

function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

type Props = {
  searchParams: Promise<{ q?: string; filter?: string; sort?: string; page?: string }>;
};

export default async function FindJobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const filter = parseFilter(params.filter);
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);

  const insforge = await createInsforgeServer();
  const { data: authData } = await insforge.auth.getCurrentUser();
  const user = authData?.user;

  let jobs: Job[] = [];
  let totalCount = 0;

  if (user) {
    let dbQuery = insforge.database
      .from("jobs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    if (query) {
      const term = sanitizeSearchTerm(query);
      dbQuery = dbQuery.or(`company.ilike.%${term}%,title.ilike.%${term}%`);
    }

    if (filter === "high") {
      dbQuery = dbQuery.gte("match_score", MATCH_THRESHOLD);
    } else if (filter === "low") {
      dbQuery = dbQuery.lt("match_score", MATCH_THRESHOLD);
    }

    if (sort === "newest") {
      dbQuery = dbQuery.order("found_at", { ascending: false });
    } else if (sort === "oldest") {
      dbQuery = dbQuery.order("found_at", { ascending: true });
    } else {
      dbQuery = dbQuery.order("match_score", { ascending: false, nullsFirst: false });
    }

    const { data, count } = await dbQuery
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
      .overrideTypes<Job[], { merge: false }>();

    jobs = data ?? [];
    totalCount = count ?? 0;
  }

  const isFiltered = query !== "" || filter !== "all";

  return (
    <div className="min-h-screen px-8 py-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <SearchControls />
        <div className="rounded-2xl border border-border bg-surface shadow">
          <JobFilters initialQuery={query} initialFilter={filter} initialSort={sort} />
          {jobs.length > 0 ? (
            <>
              <JobsTable jobs={jobs} />
              <JobsPagination
                shownCount={jobs.length}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                currentPage={page}
                query={query}
                filter={filter}
                sort={sort}
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 border-t border-border px-4 py-16 text-center">
              <p className="text-sm text-text-muted">
                {isFiltered
                  ? "No jobs match your filters. Try clearing the search or filter."
                  : "No jobs yet. Search above to find your first matches."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
