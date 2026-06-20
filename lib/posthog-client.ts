import posthog from 'posthog-js';

export function initPostHog() {
  if (typeof window === 'undefined') return;
  // Avoid double-init
  if ((window as any).__posthogInitialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

  if (!key || !host) {
    // No-op when env not provided
    console.warn('[posthog] NEXT_PUBLIC_POSTHOG_KEY or HOST not set');
    return;
  }

  posthog.init(key, { api_host: host });
  (window as any).__posthogInitialized = true;
}

export default posthog;
