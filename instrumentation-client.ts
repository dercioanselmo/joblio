import posthog from "posthog-js";

// The /ingest rewrite in next.config.ts exists to dodge ad-blockers in
// production by routing PostHog traffic through our own domain. In dev,
// that means every PostHog call is proxied through the Next.js dev server
// itself — if that hop can't hold a connection to PostHog (seen as
// "socket hang up"/ECONNRESET errors on a flaky network/VPN), it was
// destabilizing Turbopack's dev server into repeated full-page reloads.
// Ad-blocker avoidance isn't worth that risk locally, so dev talks to
// PostHog directly instead of through our own proxy.
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NODE_ENV === "development" ? "https://us.i.posthog.com" : "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
});
