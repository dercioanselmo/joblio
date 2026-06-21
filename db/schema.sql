-- db/schema.sql
-- InsForge database schema for Joblio feature 4.

-- Enable pgcrypto for UUID generation if available.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table stores the authenticated user's profile details.
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text,
  email text NOT NULL,
  phone text,
  location text,
  current_title text,
  experience_level text CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead')),
  years_experience integer CHECK (years_experience >= 0),
  skills text[],
  industries text[],
  work_experience jsonb,
  education jsonb,
  job_titles_seeking text[],
  remote_preference text CHECK (remote_preference IN ('remote', 'onsite', 'hybrid', 'any')),
  preferred_locations text[],
  salary_expectation text,
  cover_letter_tone text CHECK (cover_letter_tone IN ('formal', 'casual', 'enthusiastic')),
  linkedin_url text,
  portfolio_url text,
  work_authorization text CHECK (work_authorization IN ('citizen', 'permanent_resident', 'visa_required')),
  resume_pdf_url text,
  is_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profiles_experience_level_idx ON profiles (experience_level);
CREATE INDEX IF NOT EXISTS profiles_remote_preference_idx ON profiles (remote_preference);
CREATE INDEX IF NOT EXISTS profiles_work_authorization_idx ON profiles (work_authorization);

-- Agent runs track background discovery jobs for each user.
CREATE TABLE IF NOT EXISTS agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  status text NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  job_title_searched text,
  location_searched text,
  jobs_found integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_runs_user_id_idx ON agent_runs (user_id);
CREATE INDEX IF NOT EXISTS agent_runs_status_idx ON agent_runs (status);

-- Jobs table stores discovered or user-submitted job listings.
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid REFERENCES agent_runs(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  source text NOT NULL CHECK (source IN ('search', 'url')),
  source_url text,
  external_apply_url text,
  title text,
  company text,
  location text,
  salary text,
  job_type text CHECK (job_type IN ('fulltime', 'parttime', 'contract')),
  about_role text,
  responsibilities text[],
  requirements text[],
  nice_to_have text[],
  benefits text[],
  about_company text,
  match_score integer CHECK (match_score >= 0 AND match_score <= 100),
  match_reason text,
  matched_skills text[],
  missing_skills text[],
  company_research jsonb,
  found_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS jobs_user_id_idx ON jobs (user_id);
CREATE INDEX IF NOT EXISTS jobs_run_id_idx ON jobs (run_id);
CREATE INDEX IF NOT EXISTS jobs_source_idx ON jobs (source);
CREATE INDEX IF NOT EXISTS jobs_match_score_idx ON jobs (match_score);

-- Agent logs capture the work log entries for agent runs and jobs.
CREATE TABLE IF NOT EXISTS agent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES agent_runs(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  level text NOT NULL CHECK (level IN ('info', 'success', 'warning', 'error')),
  job_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_logs_user_id_idx ON agent_logs (user_id);
CREATE INDEX IF NOT EXISTS agent_logs_run_id_idx ON agent_logs (run_id);
CREATE INDEX IF NOT EXISTS agent_logs_job_id_idx ON agent_logs (job_id);

-- Updated timestamp trigger helper.
CREATE OR REPLACE FUNCTION joblio_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION joblio_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON agent_runs;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON agent_runs
FOR EACH ROW
EXECUTE FUNCTION joblio_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON jobs;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION joblio_set_updated_at();

-- Enable row-level security and restrict users to their own rows.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_user_policy ON profiles;
CREATE POLICY profiles_user_policy ON profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS agent_runs_user_policy ON agent_runs;
CREATE POLICY agent_runs_user_policy ON agent_runs
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS jobs_user_policy ON jobs;
CREATE POLICY jobs_user_policy ON jobs
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS agent_logs_user_policy ON agent_logs;
CREATE POLICY agent_logs_user_policy ON agent_logs
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
