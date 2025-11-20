# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Robust logging system with database persistence
- Request/response logging middleware
- API wrapper for error handling and logging
- OpenAPI 3.0 specification
- Comprehensive documentation structure

### Changed
- Refactored documentation into `/docs` folder
- Updated Dockerfile to fix permissions issue
- Improved .gitignore to exclude IDE folders

## [0.1.0] - 2025-11-20

### Added
- Initial project scaffolding
- Next.js 15 monolith with App Router
- Prisma ORM with PostgreSQL schema
- Static token authentication middleware
- Job scraping module (Playwright-based)
  - LinkedIn support
  - Naukri support
  - Indeed support
- AI interpretation and resume tailoring stubs
- Application tracking system
- Notification system
- Admin logs endpoint
- Docker setup with multi-stage build
- Docker Compose with PostgreSQL
- Environment configuration template
- Complete Prisma schema:
  - UserProfile model
  - Resume model
  - Job model
  - Application model
  - Log model
  - Notification model
  - ApplicationStatus enum

### API Endpoints
- `GET /api/health` - Health check (public)
- `POST /api/scrape` - Scrape and interpret job postings
- `POST /api/resume/tailor` - Tailor resume to job description
- `GET /api/applications` - List all applications
- `POST /api/applications` - Create new application
- `GET /api/notifications` - List notifications
- `GET /api/admin/logs` - List system logs

### Infrastructure
- Dockerfile with non-root user
- Docker Compose with health checks
- PostgreSQL 15 Alpine
- Persistent volume for database
- S3-compatible storage helper

### Documentation
- README.md with quick start guide
- REQUIREMENTS.md specification
- .env.example template

### Fixed
- Prisma P1012 validation error (missing Application → UserProfile relation)
- Type safety issues (replaced `any` with proper Prisma types)
- ESLint unused variable warnings
- Docker permissions issue for Prisma client generation

---

## Version Format

This project follows [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for new functionality (backwards compatible)
- PATCH version for bug fixes (backwards compatible)

## Categories

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements
