import { formatRelativeDate } from "@/lib/utils";
import type { ActivityDot, ActivityItem } from "@/lib/activity";

const DOT_CLASSES: Record<ActivityDot, { ring: string; inner: string }> = {
  info: { ring: "bg-info-light", inner: "bg-info" },
  success: { ring: "bg-success-light", inner: "bg-success-alt" },
};

type Props = {
  entries: ActivityItem[];
};

export function RecentActivity({ entries }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
      {entries.length > 0 ? (
        <ul className="mt-4 divide-y divide-border">
          {entries.map((entry) => {
            const colors = DOT_CLASSES[entry.dot];
            return (
              <li key={entry.id} className="flex items-center gap-3 py-4 first:pt-4 last:pb-0">
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-surface ${colors.ring}`}>
                  <span className={`h-2 w-2 rounded-full ${colors.inner}`} />
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{entry.text}</p>
                  <p className="text-xs text-text-muted">{formatRelativeDate(entry.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-text-muted">No activity yet. Search for jobs or research a company to get started.</p>
      )}
    </div>
  );
}
