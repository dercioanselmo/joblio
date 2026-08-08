import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Profile } from "@/types";
import type { NormalizedAdzunaJob, ScoredJob } from "@/agent/types";

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY! });

const matchResultSchema = z.object({
  matchScore: z.number().int().min(0).max(100),
  matchReason: z.string(),
  matchedSkills: z.array(z.string()).max(8),
  missingSkills: z.array(z.string()).max(8),
});

const MATCHING_SYSTEM_PROMPT = `You score how well a job posting fits a candidate's profile for a job
search app. Call the record_match tool with the result.

- matchScore is an integer 0 to 100 reflecting overall fit between the candidate's skills/experience
  and what the job posting asks for.
- matchReason is one paragraph (1 to 3 sentences) explaining the score in plain language.
- matchedSkills lists skills the candidate has that the job also wants (max 8, most relevant first).
- missingSkills lists skills the job wants that the candidate's profile doesn't show (max 8, most
  relevant first). Leave both arrays empty if truly nothing matches or is missing.`;

const RECORD_MATCH_TOOL: Anthropic.Tool = {
  name: "record_match",
  description: "Record the match score between a candidate and a job posting.",
  input_schema: {
    type: "object",
    properties: {
      matchScore: { type: "integer", minimum: 0, maximum: 100 },
      matchReason: { type: "string" },
      matchedSkills: { type: "array", items: { type: "string" } },
      missingSkills: { type: "array", items: { type: "string" } },
    },
    required: ["matchScore", "matchReason", "matchedSkills", "missingSkills"],
  },
};

function buildUserPrompt(job: NormalizedAdzunaJob, profile: Profile): string {
  return `JOB POSTING
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description: ${job.description}

CANDIDATE PROFILE
Current title: ${profile.current_title ?? "Not provided"}
Experience level: ${profile.experience_level ?? "Not provided"}
Years of experience: ${profile.years_experience ?? "Not provided"}
Skills: ${(profile.skills ?? []).join(", ") || "Not provided"}
Industries: ${(profile.industries ?? []).join(", ") || "Not provided"}
Job titles seeking: ${(profile.job_titles_seeking ?? []).join(", ") || "Not provided"}`;
}

export async function scoreJob(
  job: NormalizedAdzunaJob,
  profile: Profile,
): Promise<{ success: true; job: ScoredJob } | { success: false; error: string }> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 400,
      temperature: 0.3,
      system: MATCHING_SYSTEM_PROMPT,
      tools: [RECORD_MATCH_TOOL],
      tool_choice: { type: "tool", name: "record_match" },
      messages: [{ role: "user", content: buildUserPrompt(job, profile) }],
    });

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolUse) {
      return { success: false, error: "No match result returned." };
    }

    const parsed = matchResultSchema.safeParse(toolUse.input);
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
