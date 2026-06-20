# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Joblio Next.js 16 (App Router) application. The integration uses `instrumentation-client.ts` for client-side initialization (the recommended pattern for Next.js 15.3+), a reverse proxy through Next.js rewrites to reduce tracking-blocker interception, and targeted `posthog.capture()` and `posthog.identify()` calls across the key user acquisition and login flows.

**Files created or modified:**

- `instrumentation-client.ts` — PostHog client initialization (replaces the old `useEffect`-based approach)
- `next.config.ts` — Added reverse proxy rewrites (`/ingest → us.i.posthog.com`) and `skipTrailingSlashRedirect`
- `components/layout/PostHogProvider.tsx` — Stripped init logic; now a pass-through wrapper
- `lib/posthog-client.ts` — Simplified to a direct re-export of `posthog-js`
- `components/auth/LoginForm.tsx` — Captures `login_initiated` with provider name
- `app/(auth)/callback/page.tsx` — Identifies the user and captures `login_completed` after OAuth
- `components/homepage/Hero.tsx` — Converted to client component; captures `cta_clicked` on both CTAs
- `components/homepage/BottomCta.tsx` — Converted to client component; captures `cta_clicked` on both CTAs
- `components/layout/Navbar.tsx` — Captures `login_modal_opened` when the Start for free button is clicked
- `.env.local` — `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` written with correct values

---

## Events instrumented

| Event | Description | File |
|---|---|---|
| `login_initiated` | User clicks a social OAuth provider button (Google or GitHub) to begin sign-in | `components/auth/LoginForm.tsx` |
| `login_completed` | User successfully completes OAuth sign-in and lands on the callback page | `app/(auth)/callback/page.tsx` |
| `cta_clicked` | User clicks a primary call-to-action button in the homepage hero section | `components/homepage/Hero.tsx` |
| `cta_clicked` | User clicks a call-to-action button in the homepage bottom section | `components/homepage/BottomCta.tsx` |
| `login_modal_opened` | User opens the sign-in modal from the navbar Start for free button | `components/layout/Navbar.tsx` |

---

## Next steps

We've built a dashboard and five insights to monitor user acquisition and conversion behavior:

- **Dashboard:** [Analytics basics (wizard)](https://us.posthog.com/project/476350/dashboard/1740050)
- [Login funnel (wizard)](https://us.posthog.com/project/476350/insights/CsPCzfYj) — Conversion from `login_initiated` → `login_completed`
- [Daily logins (wizard)](https://us.posthog.com/project/476350/insights/EJtFCS5Z) — Daily active users based on `login_completed`
- [CTA clicks by button (wizard)](https://us.posthog.com/project/476350/insights/VCmi4DMg) — Homepage CTA clicks broken down by `get_started` vs `find_first_match`
- [Login provider breakdown (wizard)](https://us.posthog.com/project/476350/insights/0rmztVSk) — Login attempts by provider (Google vs GitHub)
- [Total signed-in users (wizard)](https://us.posthog.com/project/476350/insights/0d8LHUjr) — Unique users who completed sign-in (BoldNumber)

---

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any CI/deployment environment configs so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or your bundler's upload step) into CI so production stack traces de-minify.
- [ ] Confirm the returning-visitor path also calls `identify` — the current `identify` call only fires in the OAuth callback. A user who is already signed in and navigates directly to `/dashboard` should also be identified. Consider calling `posthog.identify()` in a shared auth context or server component once the session is available.

---

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
