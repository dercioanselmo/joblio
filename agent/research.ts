import { z } from "zod";
import { Stagehand } from "@browserbasehq/stagehand";
import { browserbase, BROWSERBASE_PROJECT_ID } from "@/lib/browserbase";
import { azureOpenai, AZURE_OPENAI_DEPLOYMENT } from "@/lib/azure-openai";
import type { CompanyResearch, Job, Profile } from "@/types";

const homepageSchema = z.object({
  oneLiner: z.string().describe("What the company does in one sentence"),
  productSummary: z.string().describe("What they build/sell and who it's for"),
  signals: z.array(z.string()).describe("Funding, notable customers, scale, mission, recent news"),
  pageLinks: z
    .array(
      z.object({
        // Must be `.url()`, not a bare `z.string()` — Stagehand only resolves
        // extracted links back to real hrefs (from its internal a11y-snapshot
        // element refs) for fields it recognizes as URLs via this validator.
        url: z.string().url(),
        kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"]),
      }),
    )
    .describe("Internal links worth visiting"),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z.array(z.string()).describe("Specific languages, frameworks, tools, platforms"),
  valuesOrCulture: z.array(z.string()).describe("Stated values, working style, team norms"),
  notable: z.array(z.string()).describe("Customers, funding, scale, projects, awards"),
});

type RawCompanyResearch = {
  oneLiner: string;
  productSummary: string;
  signals: string[];
  pages: Array<{ url: string; keyPoints: string[]; technologies: string[]; valuesOrCulture: string[]; notable: string[] }>;
};

const SUB_PAGE_KIND_PRIORITY = ["about", "blog", "engineering", "product", "team", "other", "careers"] as const;

function pickSubPages(pageLinks: z.infer<typeof homepageSchema>["pageLinks"]): string[] {
  const sorted = [...pageLinks].sort(
    (a, b) => SUB_PAGE_KIND_PRIORITY.indexOf(a.kind) - SUB_PAGE_KIND_PRIORITY.indexOf(b.kind),
  );
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const link of sorted) {
    if (seen.has(link.url)) continue;
    seen.add(link.url);
    urls.push(link.url);
    if (urls.length === 3) break;
  }
  return urls;
}

// Follows the Adzuna redirect server-side (no browser needed) to find the real
// employer job page, then derives the company's root homepage from its hostname.
async function deriveHomepageUrl(redirectUrl: string, companyName: string): Promise<string> {
  try {
    const response = await fetch(redirectUrl, { redirect: "follow" });
    const finalUrl = new URL(response.url);
    if (!finalUrl.hostname.includes("adzuna.com")) {
      const parts = finalUrl.hostname.split(".");
      const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : finalUrl.hostname;
      return `https://${rootDomain}`;
    }
  } catch {
    // fall through to the company-name fallback below
  }
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://www.${slug}.com`;
}

async function researchCompanyWebsite(
  homepageUrl: string,
): Promise<{ research: RawCompanyResearch | null; sources: string[] }> {
  // Single Browserbase session, created up front and handed to Stagehand —
  // never let Stagehand open its own second session (free plan only allows one).
  const session = await browserbase.sessions.create({
    projectId: BROWSERBASE_PROJECT_ID,
    timeout: 120,
  });

  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY!,
    projectId: BROWSERBASE_PROJECT_ID,
    browserbaseSessionID: session.id,
    model: {
      modelName: AZURE_OPENAI_DEPLOYMENT,
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      baseURL: process.env.AZURE_OPENAI_API_BASE_URL!,
      openaiEndpointFormat: "chat",
    },
    // Stagehand's hosted "Stagehand API" orchestrator (the default) doesn't
    // recognize a custom OpenAI-compatible baseURL like our Azure deployment
    // and rejects every action server-side ("Validation failed"). Disabling
    // it runs act()/extract() locally in this process against our own model
    // client instead, which does support a custom baseURL.
    disableAPI: true,
    disablePino: true,
  });

  try {
    await stagehand.init();
    const page = stagehand.context.activePage();
    if (!page) {
      return { research: null, sources: [] };
    }

    await page.goto(homepageUrl);
    const homepage = await stagehand.extract(
      "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
      homepageSchema,
    );

    if (!homepage.oneLiner && !homepage.productSummary) {
      return { research: null, sources: [homepageUrl] };
    }

    const sources = [homepageUrl];
    const subPages: RawCompanyResearch["pages"] = [];
    for (const url of pickSubPages(homepage.pageLinks)) {
      try {
        await page.goto(url);
        const subPage = await stagehand.extract(
          "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
          subPageSchema,
        );
        subPages.push({ url, ...subPage });
        sources.push(url);
      } catch {
        // one sub-page failing to load/extract shouldn't abort the rest
      }
    }

    return {
      research: {
        oneLiner: homepage.oneLiner,
        productSummary: homepage.productSummary,
        signals: homepage.signals,
        pages: subPages,
      },
      sources,
    };
  } catch (error) {
    console.error("[agent/research]", error);
    return { research: null, sources: [] };
  } finally {
    await stagehand.close().catch(() => {});
  }
}

const SYNTHESIS_SYSTEM_PROMPT = `You are a sharp career strategist preparing a candidate to apply for a specific role.
You are given (a) research collected from the company's own website, (b) the job posting,
and (c) the candidate's profile. Produce a concise, concrete briefing that gives this
specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent
  funding, customers, headcount, or facts. If research was thin, infer carefully from
  the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this
  company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly
  and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind
  of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid JSON matching this shape:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

function buildSynthesisUserPrompt(
  companyResearch: RawCompanyResearch | null,
  job: Job,
  profile: Profile,
  sources: string[],
): string {
  return `COMPANY RESEARCH (from their website):
${companyResearch ? JSON.stringify(companyResearch) : "No usable research was collected from the company website."}

JOB POSTING:
Title: ${job.title ?? "Not provided"}
Company: ${job.company ?? "Not provided"}
Description: ${job.about_role ?? "Not provided"}
Matched skills (already computed): ${(job.matched_skills ?? []).join(", ") || "None"}
Missing skills (already computed): ${(job.missing_skills ?? []).join(", ") || "None"}

CANDIDATE PROFILE:
Current title: ${profile.current_title ?? "Not provided"}
Experience: ${profile.years_experience ?? "Not provided"} years, level ${profile.experience_level ?? "Not provided"}
Skills: ${(profile.skills ?? []).join(", ") || "Not provided"}
Work history: ${JSON.stringify(profile.work_experience ?? [])}

SOURCES RESEARCHED: ${sources.join(", ") || "None"}`;
}

async function synthesizeDossier(
  companyResearch: RawCompanyResearch | null,
  job: Job,
  profile: Profile,
  sources: string[],
): Promise<CompanyResearch> {
  const completion = await azureOpenai.chat.completions.create({
    model: AZURE_OPENAI_DEPLOYMENT,
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 800,
    messages: [
      { role: "system", content: SYNTHESIS_SYSTEM_PROMPT },
      { role: "user", content: buildSynthesisUserPrompt(companyResearch, job, profile, sources) },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new Error("No synthesis response returned.");
  }

  const parsed = JSON.parse(raw) as Partial<CompanyResearch>;
  return {
    companyOverview: parsed.companyOverview ?? "",
    techStack: parsed.techStack ?? [],
    culture: parsed.culture ?? [],
    whyThisRole: parsed.whyThisRole ?? "",
    yourEdge: parsed.yourEdge ?? [],
    gapsToAddress: parsed.gapsToAddress ?? [],
    smartQuestions: parsed.smartQuestions ?? [],
    interviewPrep: parsed.interviewPrep ?? [],
    sources: parsed.sources ?? sources,
  };
}

// Always returns a dossier — never fails silently. If the company website
// yields nothing usable, synthesis falls back to the job posting and profile.
export async function researchCompany(job: Job, profile: Profile): Promise<CompanyResearch> {
  const redirectUrl = job.source_url ?? job.external_apply_url;
  const companyName = job.company ?? "";

  let companyResearch: RawCompanyResearch | null = null;
  let sources: string[] = [];

  if (redirectUrl && companyName) {
    const homepageUrl = await deriveHomepageUrl(redirectUrl, companyName);
    const result = await researchCompanyWebsite(homepageUrl);
    companyResearch = result.research;
    sources = result.sources;
  }

  return synthesizeDossier(companyResearch, job, profile, sources);
}
