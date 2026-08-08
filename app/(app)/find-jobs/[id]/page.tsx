import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { JobInfo } from "@/components/job-details/JobInfo";
import { MatchScore } from "@/components/job-details/MatchScore";
import { JobDescription } from "@/components/job-details/JobDescription";
import { CompanyResearch } from "@/components/job-details/CompanyResearch";
import { JobActions } from "@/components/job-details/JobActions";
import type { Job } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function JobDetailsPage({ params }: Props) {
  const { id } = await params;

  const insforge = await createInsforgeServer();
  const { data: authData } = await insforge.auth.getCurrentUser();
  const user = authData?.user;
  if (!user) {
    redirect("/login");
  }

  const { data: job } = await insforge.database
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<Job>();

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen px-8 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <Link
          href="/find-jobs"
          className="inline-flex items-center gap-1 text-sm text-text-secondary transition hover:text-text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Back to Jobs
        </Link>

        <JobInfo job={job} />
        <MatchScore job={job} />
        <JobDescription job={job} />
        <CompanyResearch job={job} />
        <JobActions job={job} />
      </div>
    </div>
  );
}
