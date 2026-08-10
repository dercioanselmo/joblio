"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ExternalLink, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CompanyResearch as CompanyResearchData, Job } from "@/types";

type Props = {
  job: Job;
};

function TextBlock({ text }: { text: string }) {
  return <p className="mt-2 text-sm leading-relaxed text-text-secondary">{text}</p>;
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-col gap-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-text-secondary">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-text-muted" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-surface-secondary px-3 py-1 text-xs font-medium text-text-secondary"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{heading}</h3>
      {children}
    </div>
  );
}

function Dossier({ research }: { research: CompanyResearchData }) {
  return (
    <div className="mt-6 flex flex-col gap-5 border-t border-border pt-6">
      <Section heading="Company Overview">
        <TextBlock text={research.companyOverview} />
      </Section>
      <Section heading="Tech Stack">
        <TagList items={research.techStack} />
      </Section>
      <Section heading="Culture">
        <BulletList items={research.culture} />
      </Section>
      <Section heading="Why This Role">
        <TextBlock text={research.whyThisRole} />
      </Section>
      <Section heading="Your Edge">
        <BulletList items={research.yourEdge} />
      </Section>
      <Section heading="Gaps to Address">
        <BulletList items={research.gapsToAddress} />
      </Section>
      <Section heading="Smart Questions">
        <BulletList items={research.smartQuestions} />
      </Section>
      <Section heading="Interview Prep">
        <BulletList items={research.interviewPrep} />
      </Section>
      {research.sources.length > 0 ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-4 text-xs text-text-muted">
          <span className="font-medium uppercase tracking-wide">Sources</span>
          {research.sources.map((source) => (
            <a
              key={source}
              href={source}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-text-secondary hover:underline"
            >
              {source}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CompanyResearch({ job }: Props) {
  const router = useRouter();
  const [research, setResearch] = useState<CompanyResearchData | null>(job.company_research);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const companyName = job.company ?? "this company";

  async function handleResearch() {
    setStatus("loading");
    try {
      const response = await fetch("/api/agent/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setStatus("error");
        return;
      }
      setResearch(result.data);
      setStatus("idle");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light">
            <Building2 className="h-4 w-4 text-accent" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-text-primary">Company Research</h2>
        </div>
        <Button type="button" variant="primary" onClick={handleResearch} disabled={status === "loading"}>
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4" aria-hidden="true" />
          )}
          {research ? "Research Again" : "Research Company"}
        </Button>
      </div>

      {status === "error" ? (
        <div className="mt-4 rounded-md border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          Couldn&apos;t research this company. Please try again.
        </div>
      ) : null}

      {research ? (
        <Dossier research={research} />
      ) : status !== "loading" ? (
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-10 pb-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary">
            <Building2 className="h-5 w-5 text-text-muted" aria-hidden="true" />
          </div>
          <p className="text-base font-semibold text-text-primary">No research yet</p>
          <p className="max-w-md text-sm text-text-muted">
            Click &ldquo;Research Company&rdquo; to let the AI browse {companyName}&apos;s public pages and
            build a dossier.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-3 border-t border-border pt-10 pb-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-muted">
            Researching {companyName}&apos;s public pages and building a dossier&hellip;
          </p>
        </div>
      )}
    </div>
  );
}
