export type NormalizedAdzunaJob = {
  title: string;
  company: string;
  location: string;
  description: string;
  redirectUrl: string;
  salary: string | null;
  jobType: string;
};

export type ScoredJob = NormalizedAdzunaJob & {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};
