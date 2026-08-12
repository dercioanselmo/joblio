import Image from "next/image";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCard = {
  label: string;
  value: string;
  trend?: string;
  subtitle: string;
};

const STATS: StatCard[] = [
  { label: "Total Jobs Found", value: "284", trend: "+12%", subtitle: "vs last week" },
  { label: "Avg. Match Rate", value: "82%", trend: "+3%", subtitle: "vs last week" },
  { label: "Companies Researched", value: "35", subtitle: "Total researched" },
  { label: "Jobs This Week", value: "28", subtitle: "New this week" },
];

type DotColor = "accent" | "info" | "success";

const ACTIVITY: Array<{ text: string; timestamp: string; dot: DotColor }> = [
  { text: "Found 8 jobs for Frontend Engineer", timestamp: "10 mins ago", dot: "accent" },
  { text: "Researched Stripe", timestamp: "1 hour ago", dot: "info" },
  { text: "Found 6 jobs for React Developer", timestamp: "2 hours ago", dot: "success" },
  { text: "Researched Vercel", timestamp: "Yesterday", dot: "accent" },
];

const DOT_CLASSES: Record<DotColor, string> = {
  accent: "bg-accent",
  info: "bg-info",
  success: "bg-success-alt",
};

// Same 7 day-of-week values as the real dashboard's mock Company Research
// Activity chart (app/(app)/dashboard/page.tsx) — plain divs here, not
// recharts, since this is a decorative marketing panel, not a real chart.
const RESEARCH_BARS = [2, 5, 3, 8, 12, 4, 1];

// A decorative, static replica of the real dashboard (app/(app)/dashboard) —
// mock data only, no live queries. Wrapped in a fake browser chrome to match
// context/designs/landing-page.png's hero preview treatment exactly.
export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
      <div className="flex items-center gap-4 border-b border-border bg-surface-secondary px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-border-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-muted" />
          <span className="h-2.5 w-2.5 rounded-full bg-border-muted" />
        </div>
        <div className="mx-auto flex w-full max-w-md items-center justify-center gap-1.5 rounded-md bg-surface px-3 py-1.5 text-xs text-text-muted">
          <Lock className="h-3 w-3" aria-hidden="true" />
          joblio.ai/dashboard
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <Image src="/logo.png" alt="Joblio" width={124} height={42} className="h-6 w-auto" />
        <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
          <span className="border-b-2 border-accent pb-1 text-accent">Dashboard</span>
          <span className="text-text-dark">Find Jobs</span>
          <span className="text-text-dark">Profile</span>
        </nav>
      </div>

      <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-text-secondary">{stat.label}</p>
            <p className="mt-1 text-xl font-semibold text-text-primary">{stat.value}</p>
            <div className="mt-1.5 flex items-center gap-1.5">
              {stat.trend && (
                <span className="rounded-sm bg-success-lightest px-1.5 py-0.5 text-[10px] font-medium text-success-darker">
                  {stat.trend}
                </span>
              )}
              <span className="text-[10px] text-text-muted">{stat.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 px-6 pb-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary">Recent Activity</p>
          <ul className="mt-3 divide-y divide-border">
            {ACTIVITY.map((item) => (
              <li key={item.text} className="flex items-center gap-2 py-2.5 first:pt-0 last:pb-0">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_CLASSES[item.dot])} />
                <div>
                  <p className="text-xs font-medium text-text-primary">{item.text}</p>
                  <p className="text-[10px] text-text-muted">{item.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold text-text-primary">Company Research Activity</p>
          <div className="mt-4 flex h-24 items-end gap-2">
            {RESEARCH_BARS.map((value, index) => (
              <div
                key={index}
                className="flex-1 rounded-t-sm bg-info"
                style={{ height: `${(value / 12) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
