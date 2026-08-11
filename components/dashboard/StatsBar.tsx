import { formatTrend, type DashboardStats } from "@/lib/dashboard";

type StatCardData = {
  label: string;
  value: string;
  trend?: string;
  subtitle: string;
};

type Props = {
  stats: DashboardStats;
};

export function StatsBar({ stats }: Props) {
  const cards: StatCardData[] = [
    {
      label: "Total Jobs Found",
      value: String(stats.totalJobsFound),
      trend: stats.totalJobsTrend !== null ? formatTrend(stats.totalJobsTrend) : undefined,
      subtitle: "vs last week",
    },
    {
      label: "Avg. Match Rate",
      value: `${stats.avgMatchRate}%`,
      trend: stats.avgMatchRateTrend !== null ? formatTrend(stats.avgMatchRateTrend) : undefined,
      subtitle: "vs last week",
    },
    {
      label: "Companies Researched",
      value: String(stats.companiesResearched),
      subtitle: "Total researched",
    },
    {
      label: "Jobs This Week",
      value: String(stats.jobsThisWeek),
      subtitle: "New this week",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
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
