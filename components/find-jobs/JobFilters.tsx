import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export function JobFilters() {
  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
        <Input className="pl-9" placeholder="Filter by company or role..." />
      </div>
      <div className="flex gap-3">
        <Select className="w-auto min-w-[150px]" defaultValue="all">
          <option value="all">All Matches</option>
          <option value="high">High Match</option>
          <option value="low">Low Match</option>
        </Select>
        <Select className="w-auto min-w-[150px]" defaultValue="matchScore">
          <option value="matchScore">Match Score</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </Select>
      </div>
    </div>
  );
}
