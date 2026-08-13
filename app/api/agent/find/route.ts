import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import { discoverJobs } from "@/agent/emprego";
import type { Profile } from "@/types";

// location dropped (AC-1 / AC-10): emprego.co.mz's keyword search and its
// location browsing don't combine (confirmed live), so there's no location
// input for this source. See docs/specs/0002-emprego-job-discovery.md.
const findJobsSchema = z.object({
  jobTitle: z.string().trim().min(1),
});

function buildResultMessage(jobsFound: number, strongMatches: number): string {
  if (jobsFound === 0) {
    return "No jobs found for that search. Try a different title.";
  }
  return `Found ${jobsFound} job${jobsFound === 1 ? "" : "s"} and saved ${strongMatches} strong match${strongMatches === 1 ? "" : "es"}.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = findJobsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Please enter a job title to search for." },
        { status: 400 },
      );
    }
    const { jobTitle } = parsed.data;

    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ success: false, error: "You must be signed in." }, { status: 401 });
    }

    const { data: profile } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Please complete your profile before searching for jobs." },
        { status: 400 },
      );
    }

    const { data: run, error: runError } = await insforge.database
      .from("agent_runs")
      .insert([
        {
          user_id: user.id,
          status: "running",
          job_title_searched: jobTitle,
          location_searched: null,
          started_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (runError || !run) {
      console.error("[agent/find]", runError);
      return NextResponse.json(
        { success: false, error: "Failed to start job search. Please try again." },
        { status: 500 },
      );
    }

    const posthog = createPostHogServer();
    posthog.capture({
      distinctId: user.id,
      event: "job_search_started",
      properties: { userId: user.id, jobTitle, location: "" },
    });

    const result = await discoverJobs(insforge, jobTitle, profile, user.id, run.id);

    if (!result.success) {
      await insforge.database
        .from("agent_runs")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", run.id);
      await insforge.database.from("agent_logs").insert([
        {
          run_id: run.id,
          user_id: user.id,
          level: "error",
          message: result.error ?? "Job search failed.",
        },
      ]);
      await posthog.shutdown();

      return NextResponse.json(
        { success: false, error: "Failed to search for jobs. Please try again." },
        { status: 500 },
      );
    }

    const jobsFound = result.jobsSaved ?? 0;
    const strongMatches = result.strongMatches ?? 0;

    await insforge.database
      .from("agent_runs")
      .update({ status: "completed", jobs_found: jobsFound, completed_at: new Date().toISOString() })
      .eq("id", run.id);

    for (const matchScore of result.matchScores ?? []) {
      posthog.capture({
        distinctId: user.id,
        event: "job_found",
        properties: { userId: user.id, source: "search", matchScore },
      });
    }

    await posthog.shutdown();

    revalidatePath("/find-jobs");

    return NextResponse.json({
      success: true,
      data: {
        jobsFound,
        strongMatches,
        message: buildResultMessage(jobsFound, strongMatches),
      },
    });
  } catch (error) {
    console.error("[agent/find]", error);
    return NextResponse.json(
      { success: false, error: "Failed to search for jobs. Please try again." },
      { status: 500 },
    );
  }
}
