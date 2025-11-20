# AI-Assisted Job Application System
## Modern Monolith Backend Requirement Specification

---

## F 0.0 System Overview

A single backend service that:
- Accepts job links (LinkedIn, Naukri, Indeed)
- Scrapes job details
- Uses AI to parse and interpret job descriptions
- Generates tailored resume variants
- Automates job applications for supported platforms
- Tracks application history and status

The system is designed for a single user.  
Minimal authentication and a unified monolith architecture.

---

## F 1.0 Core System Access

### F 1.1 Authentication
- Single API key or static JWT stored in environment variables
- Middleware for token validation
- Optional rate limiting

### F 1.2 User Profile (Single Row)
Stores:
- Name
- Email
- Phone
- Experience summary
- Skills
- Salary preference
- Base resume (file + parsed JSON structure)

---

## F 2.0 Resume Engine

### F 2.1 Resume Storage
- Store base resume (PDF/DOCX)
- Parsed JSON structure of base resume
- Store all generated resume variants
- Metadata: origin job, timestamp, LLM model version

### F 2.2 Resume Tailoring Engine
- Input: job description text
- Output:
    - Tailored summary
    - Tailored skills
    - Tailored bullet points
    - Optional cover letter
- Uses LLM for generation
- Version-controlled resume variants

---

## F 3.0 Job Scraper Module

### F 3.1 Supported Inputs
- LinkedIn job URL
- Naukri job URL
- Indeed job URL

### F 3.2 Extraction Flow
- Use Playwright/Puppeteer to load page
- Scroll until dynamic content is fully rendered
- Extract:
    - Job title
    - Company
    - Location
    - Experience requirements
    - Full job description
    - Skill keywords

### F 3.3 AI Interpretation
- Clean and normalize extracted HTML
- Convert into a structured Job Description (JD) schema:
    - Role
    - Required skills
    - Responsibilities
    - Keywords
    - Seniority level

### F 3.4 Error Handling
- Automatic retries
- Fallback to manual JD input
- Detect login walls, anti-scraping blocks, or missing DOM sections

---

## F 4.0 Auto-Apply Module

### F 4.1 Platform Login
Encrypted credential storage for:
- LinkedIn
- Naukri
- Indeed

### F 4.2 Form Automation
- Headless browser fills application forms
- AI maps DOM labels to fields
- Uploads selected resume file
- Auto-generates answers to screening questions
- Supports multi-step forms with navigation

### F 4.3 Submission Validation
- Detect successful submission
- Capture final screen HTML or screenshot
- Log application result and timestamp

---

## F 5.0 Job Application Tracking

### F 5.1 Application Record
Stores:
- Job link
- Platform
- Resume variant used
- Application date
- AI-generated notes
- Application status

### F 5.2 Status Management
Statuses include:
- Saved
- Applied
- In Progress
- In Review
- Rejected
- Ghosted
- Shortlisted

### F 5.3 Update Sources
- Manual status updates
- Optional future extensions:
    - Email parsing
    - Portal status scraping

---

## F 6.0 Notification System

### F 6.1 Alerts
Triggered on:
- Resume generation
- Application submission
- Scraping errors
- Auto-apply errors

### F 6.2 Delivery Channels
- In-app notifications table
- Optional email notifications

---

## F 7.0 Admin & Logs

### F 7.1 Admin Panel
- View system logs
- View job scraping logs
- View application logs
- Retry or delete failed operations

### F 7.2 Metrics
- Total number of applications
- Total resume variants generated
- Scraper success/failure rate

---

## F 8.0 Infrastructure (Monolith Architecture)

### F 8.1 Backend
- Node.js or Python backend
- Modular MVC or layered architecture
- Single API server

### F 8.2 Database
- PostgreSQL database with tables:
    - `user_profile`
    - `resumes`
    - `jobs`
    - `applications`
    - `logs`
    - `notifications`

### F 8.3 Storage Layer
- Local or S3-compatible storage for:
    - Resume files
    - Screenshots
    - Cached pages (optional)

### F 8.4 Automation Layer
- Playwright (preferred)
- Puppeteer (fallback)

### F 8.5 AI Layer
- LLM integration for:
    - JD extraction
    - Resume tailoring
    - Screening question answers

---

## F 9.0 Next.js Implementation Notes
### F 9.1 API Architecture

All backend logic implemented as API routes

Long-running tasks (scraping, auto-apply) run on server-hosted Next.js environment (not serverless)

Use route handlers under /app/api/*

### F 9.2 File Storage

Integrate with S3-compatible storage for resume variants and screenshots

### F 9.3 Database Layer

Use Prisma ORM with PostgreSQL

Schemas map directly to requirements

### F 9.4 Authentication

Single static token validated via middleware.ts

No JWT needed unless required later

### F 9.5 UI Integration

Admin panel and job tracking implemented as React routes

No separate frontend-backend split needed