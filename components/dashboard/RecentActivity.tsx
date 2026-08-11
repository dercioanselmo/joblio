type DotColor = "accent" | "info" | "success";

type ActivityEntry = {
  text: string;
  timestamp: string;
  dot: DotColor;
};

const DOT_CLASSES: Record<DotColor, { ring: string; inner: string }> = {
  accent: { ring: "bg-accent-light", inner: "bg-accent" },
  info: { ring: "bg-info-light", inner: "bg-info" },
  success: { ring: "bg-success-light", inner: "bg-success-alt" },
};

const ACTIVITY: ActivityEntry[] = [
  { text: "Found 8 jobs for Frontend Engineer", timestamp: "10 mins ago", dot: "accent" },
  { text: "Researched Stripe", timestamp: "1 hour ago", dot: "info" },
  { text: "Found 12 jobs for React Developer", timestamp: "2 hours ago", dot: "success" },
  { text: "Researched Vercel", timestamp: "Yesterday", dot: "accent" },
  { text: "Found 10 jobs for Full Stack Engineer", timestamp: "Yesterday", dot: "success" },
];

export function RecentActivity() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <h2 className="text-base font-semibold text-text-primary">Recent Activity</h2>
      <ul className="mt-4 divide-y divide-border">
        {ACTIVITY.map((entry) => {
          const colors = DOT_CLASSES[entry.dot];
          return (
            <li key={`${entry.text}-${entry.timestamp}`} className="flex items-center gap-3 py-4 first:pt-4 last:pb-0">
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-surface ${colors.ring}`}>
                <span className={`h-2 w-2 rounded-full ${colors.inner}`} />
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">{entry.text}</p>
                <p className="text-xs text-text-muted">{entry.timestamp}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
