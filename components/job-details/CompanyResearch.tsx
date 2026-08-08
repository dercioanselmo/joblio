import { Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Job } from "@/types";

type Props = {
  job: Job;
};

// Company research agent isn't built yet (feature 13) — this section always
// renders its empty state, per build-plan.md: "Company research section
// shows empty state only." The button is present but inert (no onClick),
// same pattern as feature 05's "Generate Resume from Profile" button before
// feature 08 wired it — visible, not disabled, just not yet functional.
export function CompanyResearch({ job }: Props) {
  const companyName = job.company ?? "this company";

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light">
            <Building2 className="h-4 w-4 text-accent" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">Company Research</h2>
        </div>
        <Button type="button" variant="primary">
          <Search className="h-4 w-4" aria-hidden="true" />
          Research Company
        </Button>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-10 pb-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary">
          <Building2 className="h-5 w-5 text-text-muted" aria-hidden="true" />
        </div>
        <p className="text-base font-semibold text-text-primary">No research yet</p>
        <p className="max-w-md text-sm text-text-muted">
          Click &ldquo;Research Company&rdquo; to let the AI browse {companyName}&apos;s public pages and
          build a dossier.
        </p>
      </div>
    </div>
  );
}
