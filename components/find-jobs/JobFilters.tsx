"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const SEARCH_DEBOUNCE_MS = 400;

type Props = {
  initialQuery: string;
  initialFilter: "all" | "high" | "low";
  initialSort: "matchScore" | "newest" | "oldest";
};

export function JobFilters({ initialQuery, initialFilter, initialSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    }
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  };

  useEffect(() => {
    if (query === initialQuery) return;
    const timeout = setTimeout(() => updateParams({ q: query }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <Input
          className="pl-9"
          placeholder="Filter by company or role..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <Select
          className="w-auto min-w-37.5"
          value={initialFilter}
          onChange={(e) => updateParams({ filter: e.target.value })}
        >
          <option value="all">All Matches</option>
          <option value="high">High Match</option>
          <option value="low">Low Match</option>
        </Select>
        <Select
          className="w-auto min-w-37.5"
          value={initialSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="matchScore">Match Score</option>
        </Select>
      </div>
    </div>
  );
}
