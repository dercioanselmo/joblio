import type { Profile, ProfileFormValues, ProfileCompletion, WorkExperienceRoleData } from "@/types";

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function profileToFormValues(
  profile: Profile | null,
  sessionEmail: string,
  sessionName?: string,
): ProfileFormValues {
  const roles: WorkExperienceRoleData[] = (profile?.work_experience ?? []).map((role, index) => ({
    id: `role-${index}`,
    ...role,
  }));

  return {
    fullName: profile?.full_name ?? sessionName ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    linkedinUrl: profile?.linkedin_url ?? "",
    portfolioUrl: profile?.portfolio_url ?? "",
    workAuthorization: profile?.work_authorization ?? "citizen",
    currentTitle: profile?.current_title ?? "",
    experienceLevel: profile?.experience_level ?? "junior",
    yearsExperience: profile?.years_experience != null ? String(profile.years_experience) : "",
    skills: profile?.skills ?? [],
    industries: profile?.industries ?? [],
    roles,
    education: profile?.education ?? {
      degree: "high_school",
      fieldOfStudy: "",
      institution: "",
      graduationYear: "",
    },
    jobTitlesSeeking: (profile?.job_titles_seeking ?? []).join(", "),
    remotePreference: profile?.remote_preference ?? "any",
    salaryExpectation: profile?.salary_expectation ?? "",
    preferredLocations: (profile?.preferred_locations ?? []).join(", "),
    coverLetterTone: profile?.cover_letter_tone ?? "formal",
  };
}

export type ProfileUpsertRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string;
  current_title: string | null;
  experience_level: string;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: Array<Omit<WorkExperienceRoleData, "id">>;
  education: ProfileFormValues["education"];
  job_titles_seeking: string[];
  remote_preference: string;
  salary_expectation: string | null;
  preferred_locations: string[];
  cover_letter_tone: string;
  is_complete: boolean;
};

export function formValuesToProfileRow(
  values: ProfileFormValues,
  userId: string,
  email: string,
): ProfileUpsertRow {
  const { isComplete } = computeProfileCompletion(values);

  return {
    id: userId,
    email,
    full_name: values.fullName.trim(),
    phone: values.phone.trim() || null,
    location: values.location.trim() || null,
    linkedin_url: values.linkedinUrl.trim() || null,
    portfolio_url: values.portfolioUrl.trim() || null,
    work_authorization: values.workAuthorization,
    current_title: values.currentTitle.trim() || null,
    experience_level: values.experienceLevel,
    years_experience: values.yearsExperience.trim() ? parseInt(values.yearsExperience, 10) : null,
    skills: values.skills,
    industries: values.industries,
    work_experience: values.roles.map((role) => ({
      company: role.company,
      title: role.title,
      startDate: role.startDate,
      endDate: role.endDate,
      current: role.current,
      responsibilities: role.responsibilities,
    })),
    education: values.education,
    job_titles_seeking: splitList(values.jobTitlesSeeking),
    remote_preference: values.remotePreference,
    salary_expectation: values.salaryExpectation.trim() || null,
    preferred_locations: splitList(values.preferredLocations),
    cover_letter_tone: values.coverLetterTone,
    is_complete: isComplete,
  };
}

// Verified against context/designs/profile.png's mock state: exactly these 10
// checks, with LinkedIn/Portfolio counted as required, reproduce the design's
// "70%, missing Phone/Location/Education" numbers exactly (7 of 10 checks
// pass). Fields the UI already labels "(optional)" (industries, salary
// expectation, preferred locations) are deliberately excluded.
function getMissingChecks(values: ProfileFormValues): string[] {
  const missing: string[] = [];

  if (!values.fullName.trim()) missing.push("Full Name");
  if (!values.phone.trim()) missing.push("Phone");
  if (!values.location.trim()) missing.push("Location");
  if (!values.linkedinUrl.trim()) missing.push("LinkedIn");
  if (!values.portfolioUrl.trim()) missing.push("Portfolio");
  if (!values.currentTitle.trim()) missing.push("Job Title");
  if (values.skills.length === 0) missing.push("Skills");
  if (!values.roles.some((role) => role.company.trim() && role.title.trim())) {
    missing.push("Work Experience");
  }
  const { degree, fieldOfStudy, institution, graduationYear } = values.education;
  if (!degree.trim() || !fieldOfStudy.trim() || !institution.trim() || !graduationYear.trim()) {
    missing.push("Education");
  }
  if (!values.jobTitlesSeeking.trim()) missing.push("Job Titles Seeking");

  return missing;
}

const TOTAL_COMPLETION_CHECKS = 10;

export function computeProfileCompletion(values: ProfileFormValues): ProfileCompletion {
  const missingFields = getMissingChecks(values);
  const percentage = Math.round(
    ((TOTAL_COMPLETION_CHECKS - missingFields.length) / TOTAL_COMPLETION_CHECKS) * 100,
  );

  return {
    percentage,
    missingFields,
    isComplete: missingFields.length === 0,
  };
}
