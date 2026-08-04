"use client";

import { useState } from "react";
import { ResumeUpload } from "@/components/profile/ResumeUpload";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { mergeExtractedIntoValues } from "@/lib/profile";
import type { ProfileFormValues } from "@/types";

type Props = {
  initialValues: ProfileFormValues;
  initialResumeUrl: string | null;
  email: string;
};

export function ProfilePageClient({ initialValues, initialResumeUrl, email }: Props) {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);

  return (
    <>
      <ResumeUpload
        initialResumeUrl={initialResumeUrl}
        onExtracted={(extracted) => setValues((current) => mergeExtractedIntoValues(current, extracted))}
      />
      <ProfileForm values={values} onChange={setValues} email={email} />
    </>
  );
}
