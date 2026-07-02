import PostHogProviderContent from './PostHogProviderContent';

// PostHog is initialized via instrumentation-client.ts (Next.js 15.3+).
// This component is kept as a pass-through wrapper for layout compatibility.
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProviderContent>{children}</PostHogProviderContent>;
}
