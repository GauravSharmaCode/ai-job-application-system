# AI-Assisted Job Application System (Monolith)

This repository implements a minimal but complete backend scaffolding for a single-user job application system using Next.js App Router. It follows the specification in REQUIREMENTS.md and includes modules for scraping, AI-based JD interpretation, resume tailoring, auto-apply stubs, notifications, logs, and a PostgreSQL database via Prisma.

All new modules and endpoints created are tracked in this README under Tracking / Changelog.

## Overview

- Monolithic Next.js backend (serverful) with API routes under `app/api/*`.
- Static token authentication via middleware for protected API routes.
- Prisma ORM with PostgreSQL schema matching the spec.
- Playwright-based scraper stub for LinkedIn/Naukri/Indeed job pages.
- AI stubs to interpret job descriptions and tailor resumes.
- S3-compatible storage helper for resumes/screenshots.
- Basic application tracking, logs, and notifications endpoints.

## Quick Start

1) Copy environment template and configure values

```bash
cp .env.example .env
# On Windows PowerShell
Copy-Item .env.example .env
```

Required values:
- STATIC_TOKEN (any strong string)
- DATABASE_URL (PostgreSQL connection string)
- Optional: GEMINI_API_KEY, S3_* for storage

2) Install dependencies

```bash
npm install
```

3) Set up database (Prisma)

```bash
npm run prisma:push
# generates client automatically via postinstall; if needed:
npm run prisma:generate
```

4) (Optional, for scraping/auto-apply) Install Playwright browsers

```bash
npx playwright install
```

5) Run the dev server

```bash
npm run dev
```

Open http://localhost:3000. APIs are under http://localhost:3000/api/*

### Run with Docker (recommended)

This repo includes a Dockerfile and docker-compose.yml to run the app and a PostgreSQL database:

1) Prepare environment file

```bash
Copy-Item .env.example .env  # PowerShell
# or
cp .env.example .env         # bash
```

At minimum set STATIC_TOKEN in .env. The compose stack overrides DATABASE_URL to the bundled Postgres service.

2) Start the stack

```bash
docker compose up --build
```

The app will become available at http://localhost:3000 after the database is healthy. On first start, the container runs `prisma db push` to apply the schema automatically.

Notes:
- Scraping and auto-apply rely on Playwright browsers. The provided image does not install browsers by default to keep it lean. If you need scraping inside the container, exec into the app container and install:
  - `docker exec -it jobapp_app npx playwright install --with-deps`
  - Alternatively, build your own image with browsers preinstalled by extending the Dockerfile and adding that command during build.
- Data for Postgres is persisted in a `db-data` named volume.

## Authentication

Protected API routes require a static token. Provide via either:
- Authorization: Bearer <STATIC_TOKEN>
- x-api-key: <STATIC_TOKEN>

Public routes: `/api/health` (and Next.js assets). All other `/api/*` routes are protected.

## Environment Variables (.env)

See `.env.example` for the full list. Key variables:
- STATIC_TOKEN
- DATABASE_URL
- GEMINI_API_KEY (optional)
- S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET (optional for S3-compatible storage)

## Database Schema (Prisma / PostgreSQL)

Models: UserProfile, Resume, Job, Application, Log, Notification

Enum: ApplicationStatus = SAVED | APPLIED | IN_PROGRESS | IN_REVIEW | REJECTED | GHOSTED | SHORTLISTED

Prisma commands:
- Generate client: `npm run prisma:generate`
- Push schema: `npm run prisma:push`

## Key Modules

- lib/prisma.ts — PrismaClient singleton.
- lib/ai.ts — AI stubs: `interpretJD(htmlOrText)` and `tailorResume(jd, base)`; optional Gemini client scaffold via `getGemini()`.
- lib/scraper.ts — Playwright scraper: `scrapeJob(url)` with platform detection and simple extraction.
- lib/autoApply.ts — Auto-apply stub: `autoApply(url, platform, creds)`; demonstrates navigation only.
- lib/storage.ts — S3 helper: `putObject`, `getObject`.
- middleware.ts — Static token validation for `/api/*`.

## API Routes

All responses are JSON. Unless noted, include auth header (Bearer or x-api-key).

- GET `/api/health` (public)
  - Returns `{ ok: true, ts }`.

- POST `/api/scrape`
  - Body: `{ url: string }`
  - Scrapes the job page, interprets JD, upserts Job in DB.
  - Returns `{ job, scraped, jd }`.

- POST `/api/resume/tailor`
  - Body: `{ jd: object, base: { summary?: string, skills?: string[] } }`
  - Returns `{ tailored }` with summary, skills, bullets, optional coverLetter.

- GET `/api/applications`
  - Returns `{ applications }` including related job and resume.

- POST `/api/applications`
  - Body: `{ jobUrl: string, platform: string, resumeId?: number, notes?: string, status?: ApplicationStatus }`
  - Creates an application linked to an existing Job by URL.

- GET `/api/notifications`
  - Returns `{ notifications }` (latest 100).

- GET `/api/admin/logs`
  - Returns `{ logs }` (latest 200).

## Scripts (package.json)

- dev — `next dev --turbopack`
- build — `next build`
- start — `next start`
- lint — `next lint`
- prisma:generate — `prisma generate`
- prisma:push — `prisma db push`

## Notes and Limitations

- AI and automation modules are minimal stubs to enable local development without external calls.
- For scraping/automation, ensure Playwright browsers are installed (`npx playwright install`).
- Storage helper assumes S3-compatible bucket if configured; otherwise avoid calling storage functions.
- Long-running tasks should run in a serverful Next.js environment (not serverless), per spec.

## Tracking / Changelog

Last updated: 2025-11-20 18:47 (local)

Added/Updated in this iteration:
- Dockerfile: Multi-stage build for production; runs prisma db push on container start.
- .dockerignore: Reduces build context (node_modules, .next, etc.).
- docker-compose.yml: App + Postgres with healthcheck; exposes port 3000.
- package.json: dependencies (@prisma/client, prisma, playwright, @google/generative-ai, @aws-sdk/client-s3, zod) and scripts (prisma:generate, prisma:push, postinstall).
- .env.example: STATIC_TOKEN, DATABASE_URL, GEMINI_API_KEY, and S3_* variables.
- prisma/schema.prisma: UserProfile, Resume, Job, Application, Log, Notification models; ApplicationStatus enum.
- middleware.ts: STATIC_TOKEN-based auth for `/api/*`, excludes `/api/health`.
- lib/prisma.ts: Prisma client singleton.
- lib/ai.ts: JD interpretation and resume tailoring stubs.
- lib/scraper.ts: Playwright-based scraper with simple extraction and skill detection.
- lib/autoApply.ts: Navigation-only auto-apply stub.
- lib/storage.ts: S3 client helper with `putObject` and `getObject`.
- app/api/health/route.ts: Public health check.
- app/api/scrape/route.ts: Scrape and upsert Job.
- app/api/resume/tailor/route.ts: Tailor resume endpoint.
- app/api/applications/route.ts: List/create application records.
- app/api/notifications/route.ts: List notifications.
- app/api/admin/logs/route.ts: List logs.

Fixes:
- prisma/schema.prisma: Added missing opposite relation on Application -> UserProfile (userId, user) to resolve Prisma P1012 validation error for UserProfile.applications.
 - Type safety and lint: Replaced `any` casts with proper Prisma types to fix Next.js build lint errors.
   - app/api/scrape/route.ts: `jdSchema` now uses `Prisma.InputJsonValue` instead of `any`.
   - app/api/applications/route.ts: `status` cast to `Prisma.ApplicationStatus` instead of `any`.
   - lib/autoApply.ts: Resolved `no-unused-vars` by prefixing unused stub param with `_`.

Refer to REQUIREMENTS.md for the full specification this scaffolding aligns with.
