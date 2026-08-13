# 0003. Bilingual support, rationale

## Context

Joblio's job data now comes from emprego.co.mz (feature 18), a Mozambique job board, so the app's actual users are overwhelmingly Portuguese speaking. Until now the entire UI, every button, label, message, and page, is hardcoded English text scattered across roughly 79 source files with no existing translation layer, no locale routing, and no message file convention. There is also no i18n library installed yet.

Three things must be decided before any code changes: how translated strings are looked up and rendered (a library and a routing shape), where a user's chosen language is remembered, and how far translation reaches, specifically whether it should touch AI generated content (match reasons, research dossiers, resumes) or the Portuguese job data feature 18 already stores as is. Getting the last one wrong would mean reopening `agent/matcher.ts` and `agent/research.ts`'s prompts, or building a translation pipeline for scraped job postings, neither of which this feature needs to do to meet its actual goal (the app's own interface, not its data, being bilingual).

## Options considered

### Option 1: Custom lightweight dictionary, no library, no URL prefix

A plain JSON/TS message map, a React context reading a cookie, and a `t("key")` helper. No new dependency, no route restructuring.

**Pros**:
- Zero new dependency, full control over the format.
- No change to the `app/` route tree; a locale toggle just re-renders.

**Cons**:
- Reinvents plural rules, number/date formatting, and locale negotiation that `next-intl` already solves.
- No URL prefix means a shared link always opens in whatever language the visitor's browser or cookie currently holds, not the language the sender saw; search engines only ever index one language per page.
- No App Router specific guidance exists for this shape; every Server Component vs Client Component boundary (locale needs to reach both) has to be solved from scratch.

### Option 2: Adopt `next-intl` with locale prefixed routing

The standard, actively maintained i18n library purpose built for the Next.js App Router: Server Component aware message loading, built in middleware for locale resolution and prefixed routing (`/en/...`, `/pt/...`), and a `useTranslations()` / `getTranslations()` API that works in both Server and Client Components.

**Pros**:
- Purpose built for this exact stack (Next.js 16 App Router, React 19 Server Components); the project's own `AGENTS.md` warns this Next.js version has breaking changes from training data, so a library maintained specifically against the current App Router is safer than hand rolling routing logic against an unfamiliar API surface.
- Locale prefixed URLs (AC-2) give each language a real, shareable, indexable page, not a stateful toggle.
- Middleware based locale resolution and cookie handling (`NEXT_LOCALE`) is built in, not something this project has to design and maintain itself.
- Large community, well documented, boring in the good sense: proven, not exciting.

**Cons**:
- A new dependency, and the biggest structural change to the route tree since the project's original scaffold (every route moves under `[locale]/`).
- `next-intl`'s middleware must be chained with the project's existing custom `proxy.ts` (which already does token refresh and protected path auth), adding one more moving part to a file that already carries a documented, hard won fix for a cookie propagation bug earlier in this project's history.

### Option 3: `react-intl` (FormatJS)

A mature, framework agnostic i18n library, widely used outside Next.js.

**Pros**:
- Very mature, large ecosystem, not tied to any one framework.

**Cons**:
- No first class App Router routing or middleware story; locale prefixed URLs and Server Component message loading would need to be hand assembled on top of it, redoing work `next-intl` already ships.
- Less current documentation for React Server Components specifically, more risk given this project's already stated caution about this Next.js version's unfamiliar API surface.

## Rationale

Option 2 (`next-intl`, locale prefixed routing) is the right choice because it is the only option purpose built for exactly this stack, and this project's own `AGENTS.md` already flags this Next.js version as unfamiliar territory where guessing at App Router internals is risky; a library maintained specifically against the current App Router removes that guesswork for routing and Server Component message loading. Locale prefixed URLs were chosen over a cookie only toggle because a job search app's pages (job listings, job details) are exactly the kind of content worth being shareable and indexable per language, and the engineer confirmed this directly when asked (locale prefixed routes, recommended and chosen).

Cookie only storage (over a new profile column) was chosen because this project has no cross device requirement stated anywhere, a cookie already solves "remember my choice on return visits" (AC-5) with zero schema change, and the project's own precedent (feature 18's post launch fixes) shows a preference for the smallest change that satisfies the actual acceptance criteria rather than the more elaborate option.

Keeping AI generated content and emprego.co.mz job data untranslated (AC-8, AC-9) was the engineer's explicit, recommended choice, and it is also the technically sound one: translating job postings risks misrepresenting a real employer's posting (feature 18's own spec already flagged this as a data integrity concern when it decided to store job data as is), and translating AI content doubles the prompt and QA surface of `agent/matcher.ts` and `agent/research.ts` for a first version of this feature. Both stay explicit Follow-up items rather than silent gaps.

## References

None (references level: none, chosen by the engineer).
