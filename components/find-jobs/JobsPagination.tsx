import { cn } from "@/lib/utils";

type Props = {
  shownCount: number;
  totalCount: number;
  pageSize?: number;
};

function pageButtonClasses(active: boolean): string {
  return cn(
    "flex h-9 min-w-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed",
    active
      ? "border-accent bg-accent-light text-accent"
      : "border-border bg-surface text-text-primary",
  );
}

// Click behavior (page navigation, filter/sort) is out of scope for this
// feature — see docs/specs/0001-adzuna-job-discovery.md AC-12. Every button
// here is disabled; feature 11 wires real pagination on top of these counts.
export function JobsPagination({ shownCount, totalCount, pageSize = 20 }: Props) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumbers = Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1);
  const showEllipsisAndLast = totalPages > pageNumbers.length + 1;

  return (
    <div className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
      <p className="text-sm text-text-secondary">
        Showing <span className="font-semibold text-text-primary">{totalCount === 0 ? 0 : 1}</span> to{" "}
        <span className="font-semibold text-text-primary">{shownCount}</span> of{" "}
        <span className="font-semibold text-text-primary">{totalCount}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled
          className="flex h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-muted disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {pageNumbers.map((page) => (
          <button key={page} type="button" disabled className={pageButtonClasses(page === 1)}>
            {page}
          </button>
        ))}
        {showEllipsisAndLast ? (
          <>
            <span className="px-1 text-sm text-text-muted">...</span>
            <button type="button" disabled className={pageButtonClasses(false)}>
              {totalPages}
            </button>
          </>
        ) : null}
        <button
          type="button"
          disabled
          className="flex h-9 items-center justify-center rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-muted disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}
