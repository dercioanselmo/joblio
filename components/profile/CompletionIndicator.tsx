import { AlertCircle } from "lucide-react";

type Props = {
  percentage: number;
  missingFields: string[];
};

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CompletionIndicator({ percentage, missingFields }: Props) {
  if (missingFields.length === 0) return null;

  const offset = CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl border border-border bg-surface p-6 shadow">
      <div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-error" aria-hidden="true" />
          <h2 className="text-base font-semibold text-text-primary">Profile needs attention</h2>
        </div>
        <p className="mt-2 max-w-md text-sm text-text-secondary">
          Complete the missing fields to improve your chance of getting tailored matches and
          generating quality resumes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {missingFields.map((field) => (
            <span
              key={field}
              className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-error"
            >
              {field}
            </span>
          ))}
        </div>
      </div>

      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="10" className="stroke-error/15" />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-error"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          className="rotate-90 fill-text-primary text-[22px] font-bold"
          style={{ transformOrigin: "50px 50px" }}
        >
          {percentage}%
        </text>
      </svg>
    </div>
  );
}
