import path from "node:path";
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { z } from "zod";
import { createInsforgeServer } from "@/lib/insforge-server";
import { azureOpenai, AZURE_OPENAI_DEPLOYMENT } from "@/lib/azure-openai";

// pdf-parse's Node build resolves its pdf.js worker via a bundler-relative path,
// which Turbopack relocates into .next/dev/server/chunks and breaks ("Setting up
// fake worker failed: Cannot find module ..."). Pointing setWorker at an absolute
// path bypasses Turbopack's static analysis so Node loads the real file directly.
// Built from process.cwd() (the project root, stable regardless of bundling) rather
// than import.meta.url/createRequire — under Turbopack those resolve against a
// virtual module path, not the real filesystem, and throw at module-load time
// (outside any try/catch), which took the whole route down as a 404.
let pdfWorkerConfigured = false;
function ensurePdfWorkerConfigured() {
  if (pdfWorkerConfigured) return;
  PDFParse.setWorker(path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"));
  pdfWorkerConfigured = true;
}

const extractedProfileSchema = z.object({
  fullName: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  linkedinUrl: z.string().optional().default(""),
  portfolioUrl: z.string().optional().default(""),
  currentTitle: z.string().optional().default(""),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead", ""]).optional().default(""),
  yearsExperience: z.string().optional().default(""),
  skills: z.array(z.string()).optional().default([]),
  roles: z
    .array(
      z.object({
        company: z.string().default(""),
        title: z.string().default(""),
        startDate: z.string().default(""),
        endDate: z.string().default(""),
        current: z.boolean().default(false),
        responsibilities: z.string().default(""),
      }),
    )
    .optional()
    .default([]),
  education: z
    .object({
      degree: z.enum(["high_school", "associate", "bachelor", "master", "doctorate", "other", ""]).default(
        "",
      ),
      fieldOfStudy: z.string().default(""),
      institution: z.string().default(""),
      graduationYear: z.string().default(""),
    })
    .optional()
    .default({ degree: "", fieldOfStudy: "", institution: "", graduationYear: "" }),
});

const EXTRACTION_SYSTEM_PROMPT = `You extract structured profile data from resume text for a job-search app.
Call the record_profile tool with the extracted data. Leave any field "" or [] if the resume does not
contain that information. Never invent data.

- experienceLevel must be exactly one of "junior", "mid", "senior", "lead", or "" if you can't tell.
- yearsExperience is a string containing just a number (e.g. "5"), or "" if unknown.
- roles is an array of up to 3 most recent positions. Dates must be in "YYYY-MM" format, or "" if
  unknown. If a role is the person's current job, set current true and endDate "".
- education.degree must be exactly one of "high_school", "associate", "bachelor", "master", "doctorate",
  "other", or "" if unknown.`;

const RECORD_PROFILE_TOOL = {
  type: "function" as const,
  function: {
    name: "record_profile",
    description: "Record structured profile data extracted from a resume.",
    parameters: {
      type: "object",
      properties: {
        fullName: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        linkedinUrl: { type: "string" },
        portfolioUrl: { type: "string" },
        currentTitle: { type: "string" },
        experienceLevel: { type: "string", enum: ["junior", "mid", "senior", "lead", ""] },
        yearsExperience: { type: "string" },
        skills: { type: "array", items: { type: "string" } },
        roles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              title: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              current: { type: "boolean" },
              responsibilities: { type: "string" },
            },
            required: ["company", "title", "startDate", "endDate", "current", "responsibilities"],
          },
        },
        education: {
          type: "object",
          properties: {
            degree: {
              type: "string",
              enum: ["high_school", "associate", "bachelor", "master", "doctorate", "other", ""],
            },
            fieldOfStudy: { type: "string" },
            institution: { type: "string" },
            graduationYear: { type: "string" },
          },
          required: ["degree", "fieldOfStudy", "institution", "graduationYear"],
        },
      },
      required: [
        "fullName",
        "phone",
        "location",
        "linkedinUrl",
        "portfolioUrl",
        "currentTitle",
        "experienceLevel",
        "yearsExperience",
        "skills",
        "roles",
        "education",
      ],
    },
  },
};

export async function POST() {
  try {
    ensurePdfWorkerConfigured();

    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ success: false, error: "You must be signed in." }, { status: 401 });
    }

    const path = `${user.id}/resume.pdf`;
    const { data: blob, error: downloadError } = await insforge.storage.from("resumes").download(path);
    if (downloadError || !blob) {
      return NextResponse.json(
        { success: false, error: "No resume found. Please upload one first." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    await parser.destroy();
    const extractedText = textResult.text;

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Could not extract text from this PDF. Please try a different file." },
        { status: 400 },
      );
    }

    const completion = await azureOpenai.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      max_tokens: 2000,
      tools: [RECORD_PROFILE_TOOL],
      tool_choice: { type: "function", function: { name: "record_profile" } },
      messages: [
        { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
        { role: "user", content: extractedText.slice(0, 12000) },
      ],
    });

    const toolCall = completion.choices[0]?.message.tool_calls?.[0];
    if (!toolCall || toolCall.type !== "function") {
      return NextResponse.json(
        { success: false, error: "Failed to extract profile data." },
        { status: 500 },
      );
    }

    const parsed = extractedProfileSchema.safeParse(JSON.parse(toolCall.function.arguments));
    if (!parsed.success) {
      console.error("[resume/extract]", parsed.error.flatten());
      return NextResponse.json(
        { success: false, error: "Failed to extract profile data." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: parsed.data });
  } catch (error) {
    console.error("[resume/extract]", error);
    return NextResponse.json({ success: false, error: "Failed to extract profile data." }, { status: 500 });
  }
}
