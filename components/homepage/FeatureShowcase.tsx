import Image from "next/image";
import { JobListCard } from "./JobListCard";
import { AgentLogMock } from "./AgentLogMock";

const searchFeatures = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
    active: true,
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. Joblio browses their site and gives you everything you need to apply with confidence.",
    active: false,
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you have found, tailored. Your activity and progress all stay in one simple place.",
    active: false,
  },
];

const confidenceFeatures = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what is missing.",
    active: false,
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. Joblio scores every role against your actual skills so you focus on the ones that matter.",
    active: true,
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
    active: false,
  },
];

export function FeatureShowcase() {
  return (
    <section className="border-x border-border bg-surface">
      <div className="grid border-b border-border lg:grid-cols-2">
        <div className="border-r border-border px-6 py-16 sm:px-12 lg:px-24 lg:py-28">
          <h2 className="max-w-155 text-[44px] font-bold leading-[1.1] tracking-normal text-text-slate sm:text-[56px] lg:text-[64px]">
            Manage Your Job Search With Ease
          </h2>
          <div className="mt-20 border-t border-border">
            {searchFeatures.map((feature) => (
              <FeatureText key={feature.title} {...feature} />
            ))}
          </div>
        </div>
        <div className="flex items-center bg-surface-muted px-6 py-14 sm:px-12 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <JobListCard
              jobs={[
                { company: "Vercel", title: "Frontend Engineer", score: 94, salary: "$160k - $200k", source: "LinkedIn" },
                { company: "Stripe", title: "Full Stack", score: 86, salary: "$130k - $240k", source: "URL" },
                { company: "Linear", title: "Product Engineer", score: 96, salary: "$150k - $190k", source: "LinkedIn" },
                { company: "Notion", title: "Frontend", score: 72, salary: "$120k - $170k", source: "LinkedIn" },
                { company: "OpenAI", title: "ML Engineer", score: 91, salary: "$220k - $290k", source: "LinkedIn" },
              ]}
            />
          </div>
        </div>
      </div>
      <PatternDivider />
      <div className="grid border-b border-border lg:grid-cols-2">
        <div className="flex items-center bg-surface-muted px-6 py-16 sm:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-md">
            <AgentLogMock />
          </div>
        </div>
        <div className="border-l border-border px-6 py-16 sm:px-12 lg:px-24 lg:py-28">
          <h2 className="max-w-190 text-[44px] font-bold leading-[1.1] tracking-normal text-text-slate sm:text-[56px] lg:text-[64px]">
            Apply With More Confidence, Every Time
          </h2>
          <div className="mt-20 border-t border-border">
            {confidenceFeatures.map((feature) => (
              <FeatureText key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </div>
      <PatternDivider />
    </section>
  );
}

type FeatureTextProps = {
  title: string;
  description: string;
  active: boolean;
};

function FeatureText({ title, description, active }: FeatureTextProps) {
  return (
    <div
      className={`border-b border-border py-9 pl-8 ${
        active ? "border-l-2 border-l-accent" : "border-l-2 border-l-transparent"
      }`}
    >
      <h3 className="text-[26px] font-bold leading-8 text-text-darker">{title}</h3>
      <p className="mt-5 max-w-190 text-[24px] font-normal leading-10 text-text-slate-medium">
        {description}
      </p>
    </div>
  );
}

function PatternDivider() {
  return <div className="section-hatch h-28 border-b border-border" />;
}
