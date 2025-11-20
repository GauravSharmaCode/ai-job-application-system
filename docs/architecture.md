# Architecture

## System Overview

Monolithic Next.js application with serverful API routes, PostgreSQL database, and optional S3-compatible storage.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5
- **Automation**: Playwright
- **AI**: Google Gemini (optional)
- **Storage**: S3-compatible (AWS S3, MinIO, Cloudflare R2)
- **Containerization**: Docker + Docker Compose

## Architecture Layers

### 1. API Layer (`/app/api/*`)

All business logic exposed as REST API endpoints:
- `/api/health` - Health check (public)
- `/api/scrape` - Job scraping
- `/api/resume/tailor` - Resume tailoring
- `/api/applications` - Application CRUD
- `/api/notifications` - Notification list
- `/api/admin/logs` - System logs

### 2. Business Logic Layer (`/lib/*`)

Core modules:
- `prisma.ts` - Database client singleton
- `logger.ts` - Logging utility (console + DB)
- `api-logger.ts` - API request/response wrapper
- `scraper.ts` - Playwright-based job scraper
- `ai.ts` - AI interpretation and tailoring
- `autoApply.ts` - Automated application submission
- `storage.ts` - S3 file operations

### 3. Data Layer

**Prisma Schema** (`/prisma/schema.prisma`):
- `UserProfile` - Single user configuration
- `Resume` - Base and tailored resume variants
- `Job` - Scraped job postings
- `Application` - Application tracking records
- `Log` - System and API logs
- `Notification` - Event notifications

**Relationships**:
```
UserProfile 1--* Resume
UserProfile 1--* Application
Job 1--* Resume (origin)
Job 1--* Application
Resume 1--* Application
```

### 4. Authentication Layer

**Middleware** (`middleware.ts`):
- Static token validation
- Supports `Authorization: Bearer <token>` or `x-api-key: <token>`
- Public routes: `/api/health`, `/_next/*`, static assets
- Protected routes: All other `/api/*` endpoints

### 5. Logging System

**Two-tier logging**:
1. **Console logs** - Development visibility
2. **Database logs** - Persistent audit trail

**Log context includes**:
- HTTP method, URL, status code
- Request duration (ms)
- User agent, IP address
- Error stack traces
- Custom metadata

## Data Flow

### Job Scraping Flow
```
User → POST /api/scrape
  → Playwright scraper
  → AI interpretation
  → Upsert Job in DB
  → Log event
  → Return job data
```

### Resume Tailoring Flow
```
User → POST /api/resume/tailor
  → AI tailoring (JD + base resume)
  → Generate tailored content
  → Store resume variant
  → Log event
  → Return tailored resume
```

### Application Tracking Flow
```
User → POST /api/applications
  → Validate job exists
  → Create application record
  → Link job + resume
  → Log event
  → Return application
```

## Deployment Architecture

### Docker Compose Stack

```
┌─────────────────┐
│   app:3000      │  Next.js application
│  (jobapp_app)   │  - API routes
└────────┬────────┘  - Prisma client
         │           - Playwright
         │
         ↓
┌─────────────────┐
│   db:5432       │  PostgreSQL 15
│  (jobapp_db)    │  - Persistent volume
└─────────────────┘  - Health checks
```

### Container Details

**App Container**:
- Multi-stage build (deps → build → runner)
- Runs as non-root user (appuser)
- Auto-runs `prisma generate` and `prisma db push` on startup
- Exposes port 3000

**DB Container**:
- PostgreSQL 15 Alpine
- Named volume `db-data` for persistence
- Health check via `pg_isready`

## Security Considerations

- Static token authentication (environment variable)
- No credentials in code or version control
- Docker runs as non-root user
- Database credentials isolated in Docker network
- Optional S3 credentials for file storage

## Scalability Notes

Current implementation is single-instance monolith. For scaling:
- Add Redis for session/cache layer
- Extract long-running tasks to queue workers
- Use managed PostgreSQL (RDS, Cloud SQL)
- Use CDN for static assets
- Add load balancer for horizontal scaling

## Development vs Production

**Development**:
- `npm run dev` with Turbopack
- Hot reload enabled
- Console logs visible
- Local PostgreSQL or Docker Compose

**Production**:
- `npm run build` + `npm run start`
- Optimized Next.js build
- Docker Compose recommended
- Environment variables via `.env`
