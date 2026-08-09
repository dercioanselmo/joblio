import { NextResponse } from "next/server";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { createInsforgeServer } from "@/lib/insforge-server";
import { azureOpenai, AZURE_OPENAI_DEPLOYMENT } from "@/lib/azure-openai";
import type { Profile } from "@/types";

const RESUME_SIGNED_URL_EXPIRES_IN = 3600;

const DEGREE_LABELS: Record<string, string> = {
  high_school: "High School",
  associate: "Associate Degree",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  doctorate: "Doctorate",
  other: "Other",
};

const generatedResumeSchema = z.object({
  summary: z.string(),
  roles: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      bullets: z.array(z.string()),
    }),
  ),
});

const GENERATION_SYSTEM_PROMPT = `You are a professional resume writer. Call the record_resume_content
tool with polished resume content for the candidate described in the user message.

- summary is a 2-3 sentence professional summary paragraph, written in third person absent
  (no "I"), highlighting the candidate's title, years of experience, and strongest skills.
- roles must contain exactly one entry per work experience entry given, in the same order,
  with the same company and title. bullets rewrites that role's responsibilities into 2-4
  concise, achievement-oriented bullet points in clean professional language. Never invent
  employers, titles, dates, or accomplishments not implied by the candidate's own input.`;

const RECORD_RESUME_TOOL = {
  type: "function" as const,
  function: {
    name: "record_resume_content",
    description: "Record polished resume content generated for the candidate.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        roles: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              title: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
            },
            required: ["company", "title", "bullets"],
          },
        },
      },
      required: ["summary", "roles"],
    },
  },
};

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: "Helvetica", fontSize: 10, color: "#101828" },
  name: { fontSize: 20, fontWeight: "bold" },
  contactLine: { marginTop: 4, fontSize: 9, color: "#6A7282" },
  section: { marginTop: 16 },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#101828",
    marginBottom: 6,
  },
  summaryText: { fontSize: 10, lineHeight: 1.5 },
  skillsText: { fontSize: 10, lineHeight: 1.5 },
  role: { marginBottom: 10 },
  roleHeaderRow: { flexDirection: "row", justifyContent: "space-between" },
  roleTitle: { fontSize: 10.5, fontWeight: "bold" },
  roleDates: { fontSize: 9, color: "#6A7282" },
  roleCompany: { fontSize: 10, color: "#364153", marginTop: 1 },
  bullet: { fontSize: 10, lineHeight: 1.5, marginTop: 3, paddingLeft: 10 },
  educationRow: { flexDirection: "row", justifyContent: "space-between" },
  educationDegree: { fontSize: 10, fontWeight: "bold" },
  educationDetail: { fontSize: 9, color: "#6A7282", marginTop: 1 },
});

function formatDateRange(startDate: string, endDate: string, current: boolean): string {
  const end = current ? "Present" : endDate;
  if (!startDate && !end) return "";
  return `${startDate || "—"} – ${end || "—"}`;
}

type GeneratedResume = z.infer<typeof generatedResumeSchema>;

function ResumeDocument({ profile, generated }: { profile: Profile; generated: GeneratedResume }) {
  const contactParts = [profile.email, profile.phone, profile.location, profile.linkedin_url, profile.portfolio_url]
    .filter((part): part is string => Boolean(part && part.trim()));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.full_name || "Untitled Candidate"}</Text>
        {contactParts.length > 0 ? <Text style={styles.contactLine}>{contactParts.join(" · ")}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Professional Summary</Text>
          <Text style={styles.summaryText}>{generated.summary}</Text>
        </View>

        {profile.skills && profile.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Skills</Text>
            <Text style={styles.skillsText}>{profile.skills.join(", ")}</Text>
          </View>
        ) : null}

        {generated.roles.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Work Experience</Text>
            {generated.roles.map((role, index) => {
              const sourceRole = profile.work_experience?.[index];
              return (
                <View key={`${role.company}-${index}`} style={styles.role}>
                  <View style={styles.roleHeaderRow}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    {sourceRole ? (
                      <Text style={styles.roleDates}>
                        {formatDateRange(sourceRole.startDate, sourceRole.endDate, sourceRole.current)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.roleCompany}>{role.company}</Text>
                  {role.bullets.map((bullet, bulletIndex) => (
                    <Text key={bulletIndex} style={styles.bullet}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}

        {profile.education && profile.education.institution ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Education</Text>
            <View style={styles.educationRow}>
              <Text style={styles.educationDegree}>
                {DEGREE_LABELS[profile.education.degree] ?? profile.education.degree}
                {profile.education.fieldOfStudy ? ` in ${profile.education.fieldOfStudy}` : ""}
              </Text>
              <Text style={styles.roleDates}>{profile.education.graduationYear}</Text>
            </View>
            <Text style={styles.educationDetail}>{profile.education.institution}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

async function generateResumeBuffer(profile: Profile, generated: GeneratedResume): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument profile={profile} generated={generated} />);
}

export async function POST() {
  try {
    const insforge = await createInsforgeServer();
    const { data: authData } = await insforge.auth.getCurrentUser();
    const user = authData?.user;
    if (!user) {
      return NextResponse.json({ success: false, error: "You must be signed in." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await insforge.database
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<Profile>();

    if (profileError || !profile || !profile.full_name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Please fill out and save your profile before generating a resume." },
        { status: 400 },
      );
    }

    const rolesForPrompt = (profile.work_experience ?? []).slice(0, 3);
    const userPrompt = `CANDIDATE
Name: ${profile.full_name}
Current title: ${profile.current_title ?? "Not provided"}
Experience level: ${profile.experience_level ?? "Not provided"}
Years of experience: ${profile.years_experience ?? "Not provided"}
Skills: ${(profile.skills ?? []).join(", ") || "Not provided"}

WORK EXPERIENCE (rewrite bullets for each, same order, same company/title)
${
  rolesForPrompt.length > 0
    ? rolesForPrompt
        .map(
          (role, index) =>
            `${index + 1}. ${role.title} at ${role.company} (${role.startDate || "?"} - ${
              role.current ? "Present" : role.endDate || "?"
            })\nResponsibilities: ${role.responsibilities || "Not provided"}`,
        )
        .join("\n\n")
    : "No work experience provided."
}`;

    const completion = await azureOpenai.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT,
      max_tokens: 1500,
      tools: [RECORD_RESUME_TOOL],
      tool_choice: { type: "function", function: { name: "record_resume_content" } },
      messages: [
        { role: "system", content: GENERATION_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const toolCall = completion.choices[0]?.message.tool_calls?.[0];
    if (!toolCall || toolCall.type !== "function") {
      return NextResponse.json({ success: false, error: "Failed to generate resume." }, { status: 500 });
    }

    const parsed = generatedResumeSchema.safeParse(JSON.parse(toolCall.function.arguments));
    if (!parsed.success) {
      console.error("[resume/generate]", parsed.error.flatten());
      return NextResponse.json({ success: false, error: "Failed to generate resume." }, { status: 500 });
    }

    const buffer = await generateResumeBuffer(profile, parsed.data);

    const path = `${user.id}/resume.pdf`;
    const { error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(path, new Blob([new Uint8Array(buffer)], { type: "application/pdf" }));

    if (uploadError) {
      console.error("[resume/generate]", uploadError);
      return NextResponse.json({ success: false, error: "Failed to save generated resume." }, { status: 500 });
    }

    const { data: signed, error: signError } = await insforge.storage
      .from("resumes")
      .createSignedUrl(path, RESUME_SIGNED_URL_EXPIRES_IN);

    if (signError || !signed) {
      console.error("[resume/generate]", signError);
      return NextResponse.json({ success: false, error: "Failed to save generated resume." }, { status: 500 });
    }

    const { error: saveError } = await insforge.database
      .from("profiles")
      .update({ resume_pdf_url: signed.signedUrl })
      .eq("id", user.id);

    if (saveError) {
      console.error("[resume/generate]", saveError);
      return NextResponse.json({ success: false, error: "Failed to save generated resume." }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: signed.signedUrl });
  } catch (error) {
    console.error("[resume/generate]", error);
    return NextResponse.json({ success: false, error: "Failed to generate resume." }, { status: 500 });
  }
}
