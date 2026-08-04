import { createInsforgeServer } from "@/lib/insforge-server";
import { profileToFormValues, computeProfileCompletion } from "@/lib/profile";
import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
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

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <CompletionIndicator percentage={percentage} missingFields={missingFields} />
        <ResumeUpload initialResumeUrl={profile?.resume_pdf_url ?? null} />
        <ProfileForm initialValues={initialValues} email={email} />
      </div>
    </div>
  );
}
