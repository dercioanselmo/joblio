# syntax=docker/dockerfile:1

# Joblio — Next.js 16 (App Router) production image.
# Multi-stage build using `output: "standalone"` (next.config.ts) so the
# final image ships only the traced files + a minimal server.js, not the
# full node_modules tree. Built and verified against Next.js 16.2.9.
#
# Build-time vs runtime env vars — this matters, don't collapse the two:
#   - NEXT_PUBLIC_* vars are inlined into the client bundle during `next
#     build`. They MUST be passed as --build-arg at `docker build` time;
#     setting them only at `docker run` has no effect on already-built pages.
#   - Every other var (ADZUNA_*, BROWSERBASE_*, AZURE_OPENAI_*, INSFORGE_API_KEY,
#     POSTHOG_KEY/HOST server overrides) is read server-side at request time
#     and should be injected at container runtime (ECS task definition /
#     Secrets Manager), never baked into the image.

ARG NODE_VERSION=22-alpine

# ---- deps: install dependencies only, cached separately from source changes
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
# Alpine's musl libc needs this for some native/prebuilt node_modules binaries.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: full source + production build
FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* — see note above, required at build time.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_INSFORGE_URL
ARG NEXT_PUBLIC_INSFORGE_ANON_KEY
ARG NEXT_PUBLIC_POSTHOG_KEY
ARG NEXT_PUBLIC_POSTHOG_HOST
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_INSFORGE_URL=$NEXT_PUBLIC_INSFORGE_URL \
    NEXT_PUBLIC_INSFORGE_ANON_KEY=$NEXT_PUBLIC_INSFORGE_ANON_KEY \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST \
    NEXT_TELEMETRY_DISABLED=1

# next build's page-data-collection step imports every route module,
# including ones that construct a third-party client at module scope
# (lib/azure-openai.ts's `new OpenAI(...)`, lib/browserbase.ts's
# `new Browserbase(...)`) instead of lazily inside a function. Both SDKs
# throw immediately if apiKey is undefined at construction time, which
# crashes the build — confirmed by building without these set. These only
# need to be non-empty strings to satisfy that eager construction; they are
# never used for a real request and are NOT secrets (hence plain ARG
# defaults, not --build-arg/--secret input). The actual credentials belong
# at container runtime (`docker run -e` / ECS task definition), where each
# module re-evaluates from scratch on process start and picks up the real
# value — these build-time placeholders have no effect on that.
ARG AZURE_OPENAI_API_BASE_URL=https://build-placeholder.invalid
ARG AZURE_OPENAI_API_KEY=build-placeholder
ARG BROWSERBASE_API_KEY=build-placeholder
ARG BROWSERBASE_PROJECT_ID=build-placeholder
ENV AZURE_OPENAI_API_BASE_URL=$AZURE_OPENAI_API_BASE_URL \
    AZURE_OPENAI_API_KEY=$AZURE_OPENAI_API_KEY \
    BROWSERBASE_API_KEY=$BROWSERBASE_API_KEY \
    BROWSERBASE_PROJECT_ID=$BROWSERBASE_PROJECT_ID

RUN npm run build

# ---- runner: minimal production image
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server + traced node_modules subset.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Static assets and public/ are excluded from standalone by design — see
# next.config.ts's `output` docs — and must be copied in manually.
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
