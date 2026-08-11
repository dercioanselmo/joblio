type StatCardData = {
  label: string;
  value: string;
  trend?: string;
  subtitle: string;
};

const STATS: StatCardData[] = [
  { label: "Total Jobs Found", value: "284", trend: "+12%", subtitle: "vs last week" },
  { label: "Avg. Match Rate", value: "82%", trend: "+3%", subtitle: "vs last week" },
  { label: "Companies Researched", value: "35", subtitle: "Total researched" },
  { label: "Jobs This Week", value: "28", subtitle: "New this week" },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-border bg-surface p-6 shadow">
          <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
          <p className="mt-3 text-[30px] font-semibold leading-9 text-text-primary">{stat.value}</p>
          <div className="mt-3 flex items-center gap-2">
            {stat.trend && (
              <span className="rounded-sm bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-darker">
                {stat.trend}
              </span>
            )}
            <span className="text-xs text-text-muted">{stat.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
