export type WorkExperienceEntry = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string;
};

export type WorkExperienceRoleData = WorkExperienceEntry & {
  id: string;
};

export type EducationDetails = {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  current_title: string | null;
  experience_level: string | null;
  years_experience: number | null;
  skills: string[] | null;
  industries: string[] | null;
  work_experience: WorkExperienceEntry[] | null;
  education: EducationDetails | null;
  job_titles_seeking: string[] | null;
  remote_preference: string | null;
  preferred_locations: string[] | null;
  salary_expectation: string | null;
  cover_letter_tone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  work_authorization: string | null;
  resume_pdf_url: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
};

// Form-facing shape used by ProfileForm and the saveProfile Server Action.
// Deliberately excludes `email` — the server always derives it from the
// authenticated session, never from client input.
export type ProfileFormValues = {
  fullName: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  workAuthorization: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  industries: string[];
  roles: WorkExperienceRoleData[];
  education: EducationDetails;
  jobTitlesSeeking: string;
  remotePreference: string;
  salaryExpectation: string;
  preferredLocations: string;
  coverLetterTone: string;
};

export type ProfileCompletion = {
  percentage: number;
  missingFields: string[];
  isComplete: boolean;
};

// Best-effort fields GPT-4o can realistically pull from resume text. Excludes
// preference-only fields a resume would never contain (work authorization,
// remote preference, salary expectation, preferred locations, job titles
// seeking, cover letter tone, industries) so extraction can never blank those
// out — see mergeExtractedIntoValues in lib/profile.ts.
export type ExtractedProfileData = {
  fullName: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  currentTitle: string;
  experienceLevel: string;
  yearsExperience: string;
  skills: string[];
  roles: WorkExperienceEntry[];
  education: EducationDetails;
};

export type AgentRun = {
  id: string;
  user_id: string;
  status: "running" | "completed" | "failed";
  job_title_searched: string | null;
  location_searched: string | null;
  jobs_found: number;
  started_at: string;
  completed_at: string | null;
};

export type CompanyResearch = {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
};

export type Job = {
  id: string;
  run_id: string | null;
  user_id: string;
  source: "search" | "url";
  source_url: string | null;
  external_apply_url: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  job_type: string | null;
  about_role: string | null;
  responsibilities: string[] | null;
  requirements: string[] | null;
  nice_to_have: string[] | null;
  benefits: string[] | null;
  about_company: string | null;
  match_score: number | null;
  match_reason: string | null;
  matched_skills: string[] | null;
  missing_skills: string[] | null;
  company_research: CompanyResearch | null;
  found_at: string;
};
