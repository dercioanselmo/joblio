export type NormalizedJob = {
  title: string;
  company: string;
  location: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  sourceUrl: string;
  salary: string | null;
  jobType: string | null;
};

export type ScoredJob = NormalizedJob & {
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};
