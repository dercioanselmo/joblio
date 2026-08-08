import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  shownCount: number;
  totalCount: number;
  pageSize?: number;
  currentPage: number;
  query: string;
  filter: "all" | "high" | "low";
  sort: "matchScore" | "newest" | "oldest";
};

function pageButtonClasses(active: boolean): string {
  return cn(
    "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition",
    active
      ? "border-accent bg-accent-light text-accent"
      : "border-border bg-surface text-text-primary hover:bg-surface-secondary",
  );
}

function disabledButtonClasses(): string {
  return "flex h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-muted cursor-not-allowed";
}

function activeLinkClasses(): string {
  return "flex h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-primary transition hover:bg-surface-secondary";
}

export function JobsPagination({
  shownCount,
  totalCount,
  pageSize = 20,
  currentPage,
  query,
  filter,
  sort,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const hrefForPage = (page: number): string => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filter !== "all") params.set("filter", filter);
    if (sort !== "matchScore") params.set("sort", sort);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/find-jobs?${qs}` : "/find-jobs";
  };

  const pageWindow = [...new Set([1, currentPage - 1, currentPage, currentPage + 1, totalPages])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const rangeStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = rangeStart === 0 ? 0 : rangeStart + shownCount - 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
      <p className="text-sm text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{rangeStart}</span> to{" "}
        <span className="font-semibold text-text-primary">{rangeEnd}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalCount}</span> results
      </p>
      <div className="flex items-center gap-2">
        {currentPage <= 1 ? (
          <span className={disabledButtonClasses()}>Previous</span>
        ) : (
          <Link href={hrefForPage(currentPage - 1)} className={activeLinkClasses()}>
            Previous
          </Link>
        )}
        {pageWindow.map((page, index) => {
          const previousPage = pageWindow[index - 1];
          const showEllipsisBefore = previousPage !== undefined && page - previousPage > 1;
          return (
            <div key={page} className="flex items-center gap-2">
              {showEllipsisBefore ? <span className="px-1 text-sm text-text-muted">...</span> : null}
              {page === currentPage ? (
                <span className={pageButtonClasses(true)}>{page}</span>
              ) : (
                <Link href={hrefForPage(page)} className={pageButtonClasses(false)}>
                  {page}
                </Link>
              )}
            </div>
          );
        })}
        {currentPage >= totalPages ? (
          <span className={disabledButtonClasses()}>Next</span>
        ) : (
          <Link href={hrefForPage(currentPage + 1)} className={activeLinkClasses()}>
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
