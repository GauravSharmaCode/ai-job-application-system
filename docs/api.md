# API Documentation

Base URL: `http://localhost:3000`

## Authentication

All endpoints except `/api/health` require authentication via:
- **Header**: `Authorization: Bearer <STATIC_TOKEN>`
- **OR Header**: `x-api-key: <STATIC_TOKEN>`

Set `STATIC_TOKEN` in your `.env` file.

## Endpoints

### Health Check

**GET** `/api/health`

Public endpoint to verify service status.

**Response** `200 OK`:
```json
{
  "ok": true,
  "ts": 1732123456789
}
```

---

### Scrape Job

**POST** `/api/scrape`

Scrapes a job posting, interprets the JD, and stores it in the database.

**Request Body**:
```json
{
  "url": "https://www.linkedin.com/jobs/view/123456789"
}
```

**Response** `200 OK`:
```json
{
  "job": {
    "id": 1,
    "platform": "linkedin",
    "url": "https://www.linkedin.com/jobs/view/123456789",
    "title": "Senior Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "experience": "5-8 years",
    "description": "...",
    "skills": ["JavaScript", "React", "Node.js"],
    "jdSchema": { ... },
    "createdAt": "2025-11-20T13:30:00.000Z"
  },
  "scraped": { ... },
  "jd": { ... }
}
```

**Error** `400 Bad Request`:
```json
{
  "error": "Invalid URL or scraping failed"
}
```

---

### Tailor Resume

**POST** `/api/resume/tailor`

Generates a tailored resume based on job description.

**Request Body**:
```json
{
  "jd": {
    "role": "Senior Software Engineer",
    "skills": ["JavaScript", "React", "Node.js"],
    "responsibilities": ["Build scalable systems", "Lead team"]
  },
  "base": {
    "summary": "Experienced software engineer...",
    "skills": ["JavaScript", "Python", "AWS"]
  }
}
```

**Response** `200 OK`:
```json
{
  "tailored": {
    "summary": "Senior software engineer with expertise in...",
    "skills": ["JavaScript", "React", "Node.js", "AWS"],
    "bullets": [
      "Led development of scalable microservices...",
      "Architected React-based frontend..."
    ],
    "coverLetter": "Dear Hiring Manager..."
  }
}
```

---

### List Applications

**GET** `/api/applications`

Returns all application records with related job and resume data.

**Response** `200 OK`:
```json
{
  "applications": [
    {
      "id": 1,
      "jobId": 1,
      "resumeId": 2,
      "userId": null,
      "platform": "linkedin",
      "date": "2025-11-20T13:30:00.000Z",
      "notes": "Applied via auto-apply",
      "status": "APPLIED",
      "createdAt": "2025-11-20T13:30:00.000Z",
      "job": { ... },
      "resume": { ... }
    }
  ]
}
```

---

### Create Application

**POST** `/api/applications`

Creates a new application record linked to an existing job.

**Request Body**:
```json
{
  "jobUrl": "https://www.linkedin.com/jobs/view/123456789",
  "platform": "linkedin",
  "resumeId": 2,
  "notes": "Applied manually",
  "status": "APPLIED"
}
```

**Response** `201 Created`:
```json
{
  "application": {
    "id": 1,
    "jobId": 1,
    "resumeId": 2,
    "platform": "linkedin",
    "date": "2025-11-20T13:30:00.000Z",
    "notes": "Applied manually",
    "status": "APPLIED",
    "createdAt": "2025-11-20T13:30:00.000Z",
    "job": { ... },
    "resume": { ... }
  }
}
```

**Error** `400 Bad Request`:
```json
{
  "error": "Job not found. Scrape it first."
}
```

---

### List Notifications

**GET** `/api/notifications`

Returns the latest 100 notifications.

**Response** `200 OK`:
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "resume_generated",
      "message": "Resume variant created for Job #1",
      "meta": { "jobId": 1, "resumeId": 2 },
      "read": false,
      "createdAt": "2025-11-20T13:30:00.000Z"
    }
  ]
}
```

---

### List Logs

**GET** `/api/admin/logs`

Returns the latest 200 system logs.

**Response** `200 OK`:
```json
{
  "logs": [
    {
      "id": 1,
      "level": "info",
      "message": "GET /api/health",
      "context": {
        "method": "GET",
        "url": "/api/health",
        "statusCode": 200,
        "duration": 5,
        "userAgent": "curl/7.68.0",
        "ip": "172.20.0.1"
      },
      "createdAt": "2025-11-20T13:30:00.000Z"
    }
  ]
}
```

---

## Application Status Values

- `SAVED` - Job saved for later
- `APPLIED` - Application submitted
- `IN_PROGRESS` - Application in progress
- `IN_REVIEW` - Under review by employer
- `REJECTED` - Application rejected
- `GHOSTED` - No response from employer
- `SHORTLISTED` - Shortlisted for interview

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing token)
- `403` - Forbidden (invalid token)
- `500` - Internal Server Error

---

## OpenAPI Specification

Full OpenAPI 3.0 specification available at: [`docs/api.yaml`](./api.yaml)

Use with Swagger UI or other OpenAPI tools for interactive documentation.
