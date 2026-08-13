import { z } from "zod";
import type { Profile } from "@/types";
import type { NormalizedJob, ScoredJob } from "@/agent/types";
import { azureOpenai, AZURE_OPENAI_DEPLOYMENT } from "@/lib/azure-openai";

const matchResultSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  matchReason: z.string(),
  matchedSkills: z.array(z.string()).max(8),
  missingSkills: z.array(z.string()).max(8),
  jobType: z.enum(["fulltime", "parttime", "contract"]).nullable(),
});

const MATCHING_SYSTEM_PROMPT = `You score how well a job posting fits a candidate's profile for a job
search app. Call the record_match tool with the result.

- matchScore is an integer 0 to 100 reflecting overall fit between the candidate's skills/experience
  and what the job posting asks for.
- matchReason is one paragraph (1 to 3 sentences) explaining the score in plain language.
- matchedSkills lists skills the candidate has that the job also wants (max 8, most relevant first).
- missingSkills lists skills the job wants that the candidate's profile doesn't show (max 8, most
  relevant first). Leave both arrays empty if truly nothing matches or is missing.
- jobType is one of "fulltime", "parttime", "contract" if the posting's text clearly implies one of
  these (e.g. a stated contract duration implies "contract", explicit part time hours imply
  "parttime"). Return null if the posting gives no real signal either way — never guess.`;

const RECORD_MATCH_TOOL = {
  type: "function" as const,
  function: {
    name: "record_match",
    description: "Record the match score between a candidate and a job posting.",
    parameters: {
      type: "object",
      properties: {
        matchScore: { type: "integer", minimum: 0, maximum: 100 },
        matchReason: { type: "string" },
        matchedSkills: { type: "array", items: { type: "string" } },
        missingSkills: { type: "array", items: { type: "string" } },
        jobType: { type: ["string", "null"], enum: ["fulltime", "parttime", "contract", null] },
      },
      required: ["matchScore", "matchReason", "matchedSkills", "missingSkills", "jobType"],
    },
  },
};

function buildUserPrompt(job: NormalizedJob, profile: Profile): string {
  return `JOB POSTING
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}
Responsibilities: ${job.responsibilities.join("; ") || "Not provided"}
Requirements: ${job.requirements.join("; ") || "Not provided"}

CANDIDATE PROFILE
Current title: ${profile.current_title ?? "Not provided"}
Experience level: ${profile.experience_level ?? "Not provided"}
Years of experience: ${profile.years_experience ?? "Not provided"}
Skills: ${(profile.skills ?? []).join(", ") || "Not provided"}
Industries: ${(profile.industries ?? []).join(", ") || "Not provided"}
Job titles seeking: ${(profile.job_titles_seeking ?? []).join(", ") || "Not provided"}`;
}

export async function scoreJob(
  job: NormalizedJob,
  profile: Profile,
): Promise<{ success: true; job: ScoredJob } | { success: false; error: string }> {
  try {
    const completion = await azureOpenai.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      max_tokens: 400,
      temperature: 0.3,
      tools: [RECORD_MATCH_TOOL],
      tool_choice: { type: "function", function: { name: "record_match" } },
      messages: [
        { role: "system", content: MATCHING_SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(job, profile) },
      ],
    });

    const toolCall = completion.choices[0]?.message.tool_calls?.[0];
    if (!toolCall || toolCall.type !== "function") {
      return { success: false, error: "No match result returned." };
    }

    const parsed = matchResultSchema.safeParse(JSON.parse(toolCall.function.arguments));
    if (!parsed.success) {
      console.error("[agent/matcher]", parsed.error.flatten());
      return { success: false, error: "Match result failed validation." };
    }

    return { success: true, job: { ...job, ...parsed.data } };
  } catch (error) {
    console.error("[agent/matcher]", error);
    return { success: false, error: String(error) };
  }
}
