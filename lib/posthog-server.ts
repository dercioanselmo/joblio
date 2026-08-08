import { PostHog } from 'posthog-node';

// A fresh client per call, not a cached singleton — flushAt: 1/flushInterval: 0
// send each event immediately since a serverless function can exit before a
// batched flush would otherwise fire; the caller must still await shutdown().
export function createPostHogServer(): PostHog {
  const key = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    throw new Error('PostHog server key or host not configured');
  }

  return new PostHog(key, { host, flushAt: 1, flushInterval: 0 });
}
