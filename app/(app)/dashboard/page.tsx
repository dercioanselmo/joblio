import { redirect } from "next/navigation";
import { CompanyResearchChart } from "@/components/dashboard/CompanyResearchChart";
import { JobsFoundChart } from "@/components/dashboard/JobsFoundChart";
import { MatchScoreChart } from "@/components/dashboard/MatchScoreChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { createInsforgeServer } from "@/lib/insforge-server";
import { computeDashboardStats, type DashboardJobRow } from "@/lib/dashboard";

const COMPANY_RESEARCH_DATA = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 5 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 8 },
  { day: "Fri", count: 12 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 1 },
];

const JOBS_FOUND_DATA = [
  { day: "Mon", count: 10 },
  { day: "Tue", count: 45 },
  { day: "Wed", count: 32 },
  { day: "Thu", count: 65 },
  { day: "Fri", count: 88 },
  { day: "Sat", count: 55 },
  { day: "Sun", count: 12 },
];

const MATCH_SCORE_DATA = [
  { range: "50-60%", count: 5 },
  { range: "60-70%", count: 15 },
  { range: "70-80%", count: 45 },
  { range: "80-90%", count: 85 },
  { range: "90-100%", count: 35 },
];

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data: authData } = await insforge.auth.getCurrentUser();
  const user = authData?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: jobRows } = await insforge.database
    .from("jobs")
    .select("match_score, company_research, found_at")
    .eq("user_id", user.id)
    .overrideTypes<DashboardJobRow[], { merge: false }>();

  const stats = computeDashboardStats(jobRows ?? []);

  return (
    <div className="min-h-screen px-8 py-10">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        <StatsBar stats={stats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentActivity />
          <div className="rounded-2xl border border-border bg-surface p-6 shadow">
            <h2 className="text-base font-semibold text-text-primary">Company Research Activity</h2>
            <div className="mt-4">
              <CompanyResearchChart data={COMPANY_RESEARCH_DATA} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow">
            <h2 className="text-base font-semibold text-text-primary">Jobs Found Over Time</h2>
            <div className="mt-4">
              <JobsFoundChart data={JOBS_FOUND_DATA} />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow">
            <h2 className="text-base font-semibold text-text-primary">Match Score Distribution</h2>
            <div className="mt-4">
              <MatchScoreChart data={MATCH_SCORE_DATA} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
