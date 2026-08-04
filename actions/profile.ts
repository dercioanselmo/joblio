"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createInsforgeServer } from "@/lib/insforge-server";
import { formValuesToProfileRow } from "@/lib/profile";
import type { ProfileFormValues } from "@/types";

const workExperienceRoleSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  current: z.boolean(),
  responsibilities: z.string(),
});

const profileFormSchema = z.object({
  fullName: z.string().max(200),
  phone: z.string().max(50),
  location: z.string().max(200),
  linkedinUrl: z.string().max(300),
  portfolioUrl: z.string().max(300),
  workAuthorization: z.enum(["citizen", "permanent_resident", "visa_required"]),
  currentTitle: z.string().max(200),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead"]),
  yearsExperience: z.string().max(10),
  skills: z.array(z.string().max(60)).max(50),
  industries: z.array(z.string().max(60)).max(50),
  roles: z.array(workExperienceRoleSchema).max(3),
  education: z.object({
    degree: z.string().max(100),
    fieldOfStudy: z.string().max(200),
    institution: z.string().max(200),
    graduationYear: z.string().max(10),
  }),
  jobTitlesSeeking: z.string().max(500),
  remotePreference: z.enum(["remote", "onsite", "hybrid", "any"]),
  salaryExpectation: z.string().max(100),
  preferredLocations: z.string().max(500),
  coverLetterTone: z.enum(["formal", "casual", "enthusiastic"]),
});

export async function saveProfile(
  values: ProfileFormValues,
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = profileFormSchema.safeParse(values);
    if (!parsed.success) {
      console.error("[actions/profile]", parsed.error.flatten());
      return { success: false, error: "Some fields are invalid. Please check the form and try again." };
    }

    const insforge = await createInsforgeServer();
    const { data } = await insforge.auth.getCurrentUser();
    const user = data?.user;
    if (!user) {
      return { success: false, error: "You must be signed in to save your profile." };
    }

    const row = formValuesToProfileRow(parsed.data, user.id, user.email);

    const { error } = await insforge.database
      .from("profiles")
      .upsert([row], { onConflict: "id" })
      .select();

    if (error) {
      console.error("[actions/profile]", error);
      return { success: false, error: "Failed to save profile. Please try again." };
    }

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, error: "Failed to save profile." };
  }
}

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const RESUME_SIGNED_URL_EXPIRES_IN = 3600;

export async function uploadResume(
  formData: FormData,
): Promise<{ success: boolean; error?: string; url?: string }> {
  try {
    const file = formData.get("resume");
    if (!(file instanceof File)) {
      return { success: false, error: "No file provided." };
    }
    if (file.type !== "application/pdf") {
      return { success: false, error: "Only PDF files are supported." };
    }
    if (file.size > MAX_RESUME_SIZE_BYTES) {
      return { success: false, error: "Resume must be 5MB or smaller." };
    }

    const insforge = await createInsforgeServer();
    const { data } = await insforge.auth.getCurrentUser();
    const user = data?.user;
    if (!user) {
      return { success: false, error: "You must be signed in to upload a resume." };
    }

    const path = `${user.id}/resume.pdf`;
    const { data: uploaded, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(path, file);

    if (uploadError || !uploaded) {
      console.error("[actions/profile]", uploadError);
      return { success: false, error: "Failed to upload resume. Please try again." };
    }

    // The "resumes" bucket is private (own files only, per architecture.md) — the
    // bare `uploaded.url` is an authenticated API endpoint, not a directly linkable
    // URL, so opening it in a new tab 401s. Sign it so "View resume" actually works.
    const { data: signed, error: signError } = await insforge.storage
      .from("resumes")
      .createSignedUrl(path, RESUME_SIGNED_URL_EXPIRES_IN);

    if (signError || !signed) {
      console.error("[actions/profile]", signError);
      return { success: false, error: "Resume uploaded but failed to generate a link. Please try again." };
    }

    // Upsert (not update) — a brand-new user may not have a profiles row yet
    // if they upload a resume before saving the rest of the form. Only the
    // columns present here are written; every other existing field is left
    // untouched by PostgREST's ON CONFLICT DO UPDATE. The stored value is only
    // ever read back as an existence flag (see profileToFormValues / page.tsx,
    // which re-sign the deterministic path) since a signed URL expires.
    const { error: saveError } = await insforge.database
      .from("profiles")
      .upsert([{ id: user.id, email: user.email, resume_pdf_url: signed.signedUrl }], {
        onConflict: "id",
      })
      .select();

    if (saveError) {
      console.error("[actions/profile]", saveError);
      return { success: false, error: "Resume uploaded but failed to save. Please try again." };
    }

    revalidatePath("/profile");
    return { success: true, url: signed.signedUrl };
  } catch (error) {
    console.error("[actions/profile]", error);
    return { success: false, error: "Failed to upload resume." };
  }
}
