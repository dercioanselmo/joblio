import { CompletionIndicator } from "@/components/profile/CompletionIndicator";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <CompletionIndicator percentage={70} missingFields={["Phone", "Location", "Education"]} />
        <ResumeUpload />
        <ProfileForm />
      </div>
    </div>
  );
}
