import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createInsforgeServer } from "@/lib/insforge-server";
import { createPostHogServer } from "@/lib/posthog-server";
import { researchCompany } from "@/agent/research";
import type { Job, Profile } from "@/types";

const researchSchema = z.object({
  jobId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const insforge = await createInsforgeServer();
  let runId: string | null = null;
  let userId: string | null = null;

  try {
    const body = await req.json();
    const parsed = researchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Missing or invalid jobId." }, { status: 400 });
    }
    const { jobId } = parsed.data;

    const { data: authData } = await insforge.auth.getCurrentUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ success: false, error: "You must be signed in." }, { status: 401 });
    }
    userId = user.id;

    const { data: job } = await insforge.database
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .maybeSingle<Job>();

    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found." }, { status: 404 });
    }

    const { data: profile } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Please complete your profile before researching a company." },
        { status: 400 },
      );
    }

    const { data: run, error: runError } = await insforge.database
      .from("agent_runs")
      .insert([{ user_id: user.id, status: "running", started_at: new Date().toISOString() }])
      .select()
      .single();

    if (runError || !run) {
      console.error("[agent/research]", runError);
      return NextResponse.json(
        { success: false, error: "Failed to start company research. Please try again." },
        { status: 500 },
      );
    }
    runId = run.id;

    const dossier = await researchCompany(job, profile);

    const { error: updateError } = await insforge.database
      .from("jobs")
      .update({ company_research: dossier })
      .eq("id", jobId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[agent/research]", updateError);
      await insforge.database
        .from("agent_runs")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", runId);
      return NextResponse.json(
        { success: false, error: "Failed to save the company research." },
        { status: 500 },
      );
    }

    await insforge.database
      .from("agent_runs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", runId);

    const posthog = createPostHogServer();
    posthog.capture({
      distinctId: user.id,
      event: "company_researched",
      properties: { userId: user.id, jobId, company: job.company },
    });
    await posthog.shutdown();

    revalidatePath(`/find-jobs/${jobId}`);

    return NextResponse.json({ success: true, data: dossier });
  } catch (error) {
    console.error("[agent/research]", error);
    if (runId && userId) {
      await insforge.database
        .from("agent_runs")
        .update({ status: "failed", completed_at: new Date().toISOString() })
        .eq("id", runId);
      await insforge.database.from("agent_logs").insert([
        { run_id: runId, user_id: userId, level: "error", message: String(error) },
      ]);
    }
    return NextResponse.json(
      { success: false, error: "Failed to research company. Please try again." },
      { status: 500 },
    );
  }
}
