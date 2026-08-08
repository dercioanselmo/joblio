export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const MATCH_THRESHOLD = 70;

// Strips characters that have special meaning in PostgREST's .or() filter
// string syntax (comma separates filters, parens group them) so free-text
// search input can never be parsed as extra filter clauses, then escapes
// ilike's own wildcard characters so a literal % or _ in the search text
// matches literally instead of acting as a SQL wildcard.
export function sanitizeSearchTerm(term: string): string {
  const stripped = term.replace(/[,()]/g, "");
  return stripped.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function formatRelativeDate(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const diffMs = Date.now() - then;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}
