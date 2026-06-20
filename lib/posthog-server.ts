import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

export function getPosthogServer() {
  if (client) return client;

  const key = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    throw new Error('PostHog server key or host not configured');
  }

  client = new PostHog(key, { host });
  return client;
}
