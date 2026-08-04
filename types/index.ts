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
