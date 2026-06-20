import posthog from 'posthog-js';

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  try {
    posthog.capture(event, properties);
  } catch (error) {
    console.warn('[analytics] capture failed', error);
  }
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  try {
    posthog.identify(userId, properties);
  } catch (error) {
    console.warn('[analytics] identify failed', error);
  }
}
