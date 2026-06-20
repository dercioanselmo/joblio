export function AgentLogMock() {
  const lines = [
    '[SYSTEM] Initializing Joblio Agent...',
    '[SCAN] Found 14 matching roles',
    '1. Filtered out 3 roles (below salary cap)',
    "[ACTION] Tailoring resume for Stripe (Frontend)",
    '... Generating cover letter',
  ];

  return (
    <div className="w-full rounded-xl bg-surface p-6 shadow-sm border border-border">
      <div className="mb-4 text-[12px] font-medium text-text-secondary">agent_log.ts</div>
      <pre className="whitespace-pre-wrap text-[14px] leading-6 text-text-darker">{lines.map((l, i) => `${i + 1}  ${l}\n`).join('')}</pre>
    </div>
  );
}

export default AgentLogMock;
