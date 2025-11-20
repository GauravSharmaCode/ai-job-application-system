# AI-Assisted Job Application System
## Requirements Specification (Modern Monolith Backend)

## 0. Overview

A single-user backend system that:

- Accepts job links from supported platforms
- Scrapes job details and interprets job descriptions
- Tailors resume variants using AI
- Automates job applications for supported portals
- Tracks all application activity and status
- Sends notifications for key events

System is monolithic, server-hosted, and minimally authenticated.

## 1. System Access & Authentication

### 1.1 Authentication

- Single API key, stored in environment variables
- Mandatory token validation middleware for all protected routes
- Optional: rate limiting (global or per-endpoint)

### 1.2 User Profile (Single Record)

Stores:
- Name, email, phone
- Experience summary
- Technical skills
- Salary preference (CTC)
- Base resume file reference
- Parsed resume JSON (structured sections)

## 2. Resume Engine

### 2.1 Resume Storage

Store:
- Base resume (PDF or DOCX)
- Parsed JSON representation
- All generated resume variants

Metadata includes:
- Origin job ID (if applicable)
- Timestamp
- Version / LLM model used

### 2.2 Resume Tailoring Engine

**Inputs:**
- Job description text or interpreted JD structure

**Outputs:**
- Tailored summary
- Tailored skill list
- Tailored bullet points
- Optional cover letter
- JSON representation for rendering
- File stored (PDF preferred)

**Requirements:**
- Use LLM for generation
- Must be deterministic with version tracking

## 3. Job Scraper Module

### 3.1 Supported Inputs

- LinkedIn job URL
- Naukri job URL
- Indeed job URL

### 3.2 Scraping Flow

Load page via Playwright headless browser:
1. Scroll/render dynamic content until stable
2. Extract:
   - Job title
   - Company name
   - Location
   - Experience range
   - Full job description HTML
   - Skill keywords heuristic

### 3.3 AI Interpretation

- Normalize, clean HTML
- Convert into JD schema:
  - Role
  - Required skills
  - Responsibilities
  - Keywords (technical + soft)
  - Seniority level

### 3.4 Error Handling

- Retry mechanism
- Anti-bot wall detection
- Missing DOM detection
- Login-required detection
- Fallback to manual JD upload

## 4. Auto-Apply Module

### 4.1 Credential Management

Encrypted storage of:
- LinkedIn credentials
- Naukri credentials
- Indeed credentials

Credentials may be updated manually through API.

### 4.2 Automated Form Submission

Using a headless browser:
- Navigate platform-specific flows
- Auto-fill:
  - Contact info
  - Experience
  - Screening questions
- Upload selected resume variant
- Handle multi-step workflows

### 4.3 Submission Validation

Detect successful apply and capture:
- Final DOM HTML
- Screenshot

Log:
- Timestamp
- Platform result
- Any error messages from DOM

## 5. Application Tracking

### 5.1 Application Record

Tracks:
- Job ID
- Original job URL
- Platform
- Resume variant ID
- Notes (AI- or user-added)
- Timestamps (created + updated)
- Application status

### 5.2 Status States

- SAVED
- APPLIED
- IN_PROGRESS
- IN_REVIEW
- REJECTED
- GHOSTED
- SHORTLISTED

### 5.3 Status Update Sources

- Manual UI updates
- Automated updates in future (email parsing, scrapers)

## 6. Notification System

### 6.1 Trigger Events

- Resume variant generated
- Scraper results (success/failure)
- Application submitted
- Auto-apply error

### 6.2 Channel Types

- Internal notifications table
- Optional email notifications

## 7. Admin Panel & Logs

### 7.1 Logs

Store:
- Scraper logs
- Auto-apply logs
- Error logs
- API-level logs

### 7.2 Metrics Dashboard

Reports:
- Total applications
- Resume variants generated
- Scraper success/failure rate
- Auto-apply success/failure rate

### 7.3 Admin Actions

- Retry failed scraping jobs
- Retry failed auto-apply jobs
- Delete corrupted/invalid entries

## 8. Infrastructure Requirements (Monolith)

### 8.1 Backend

- Single backend service (Next.js API routes or Node/Python monolith)
- Long-running tasks must run server-side only

### 8.2 Database

PostgreSQL with tables:
- user_profile
- jobs
- resumes
- applications
- logs
- notifications

### 8.3 Storage

Support:
- Local filesystem or S3-compatible bucket
- Resume file storage
- Auto-apply screenshots
- Cached HTML (optional)

### 8.4 Automation Layer

- Playwright primary
- Puppeteer fallback

### 8.5 AI Layer

LLM functions:
- JD interpretation
- Resume tailoring
- Screening question answers

## 9. Next.js Implementation Notes

### 9.1 API Structure

- All logic exposed as API routes under `/app/api/*`
- Use serverful runtime (not serverless)
- Long-running tasks run on dedicated endpoints/services

### 9.2 Storage Integration

- S3-compatible storage using AWS SDK or MinIO

### 9.3 Database

- Prisma ORM
- Schemas align 1:1 with requirements

### 9.4 Authentication

- Static token via middleware
- No multi-user support

### 9.5 UI Integration

- Admin pages built using Next.js pages/app router
- No separate frontend service required
