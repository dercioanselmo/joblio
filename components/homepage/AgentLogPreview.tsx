import type { ReactNode } from "react";

type LogLine = {
  n: number;
  content: ReactNode;
};

const LINES: LogLine[] = [
  {
    n: 1,
    content: (
      <>
        <span className="text-info">[SYSTEM]</span>{" "}
        <span className="text-text-primary">Initializing Joblio Agent...</span>
      </>
    ),
  },
  {
    n: 2,
    content: (
      <>
        <span className="text-accent">[SCAN]</span>{" "}
        <span className="text-text-primary">Found 14 matching roles</span>
      </>
    ),
  },
  {
    n: 3,
    content: (
      <span className="text-text-primary">↳ Filtered out 3 roles (below salary cap)</span>
    ),
  },
  {
    n: 4,
    content: (
      <>
        <span className="text-success">[ACTION]</span>{" "}
        <span className="text-text-primary">Tailoring resume for Stripe (Frontend)</span>
      </>
    ),
  },
  {
    n: 5,
    content: (
      <>
        <span className="text-warning">...</span>{" "}
        <span className="text-text-primary">Generating cover letter</span>
      </>
    ),
  },
];

// A decorative, static terminal-style panel — mock log lines only, no real
// agent_logs data. Dot colors reuse the error/warning/success tokens as a
// stand-in for macOS traffic-light window controls (purely decorative, not
// status indicators here).
export function AgentLogPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center gap-2 bg-overlay px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-error" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-success" aria-hidden="true" />
        <span className="ml-2 font-mono text-xs text-text-muted">agent_log.ts</span>
      </div>
      <div className="space-y-4 px-5 py-6 font-mono text-sm leading-6">
        {LINES.map((line) => (
          <p key={line.n} className="flex gap-3">
            <span className="w-3 shrink-0 text-text-muted">{line.n}</span>
            <span>{line.content}</span>
          </p>
        ))}
      </div>
    </div>
  );
}
