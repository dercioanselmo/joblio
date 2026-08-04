import { createInsforgeServer } from "@/lib/insforge-server";
import { profileToFormValues, computeProfileCompletion } from "@/lib/profile";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ProfilePageClient } from "@/components/profile/ProfilePageClient";
import type { Profile } from "@/types";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data: authData } = await insforge.auth.getCurrentUser();
  const user = authData?.user;

  const { data: profile } = user
    ? await insforge.database.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>()
    : { data: null };

  const email = user?.email ?? "";
  const initialValues = profileToFormValues(profile, email, user?.profile?.name);
  const { percentage, missingFields } = computeProfileCompletion(initialValues);

  // The "resumes" bucket is private — `profile.resume_pdf_url` (whatever was signed
  // at upload time) may have already expired, so it's only used here as an
  // existence flag. Re-sign the deterministic upload path fresh on every render.
  let initialResumeUrl: string | null = null;
  if (user && profile?.resume_pdf_url) {
    const { data: signed, error: signError } = await insforge.storage
      .from("resumes")
      .createSignedUrl(`${user.id}/resume.pdf`, 3600);
    if (signError) {
      console.error("[app/(app)/profile]", signError);
    }
    initialResumeUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <CompletionIndicator percentage={percentage} missingFields={missingFields} />
        <ProfilePageClient initialValues={initialValues} initialResumeUrl={initialResumeUrl} email={email} />
      </div>
    </div>
  );
}
