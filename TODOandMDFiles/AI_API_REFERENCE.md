# AI API Reference & Documentation

Complete reference guide for all AI platform endpoints, request/response formats, and integration patterns.

---

## Table of Contents

1. [Base Configuration](#base-configuration)
2. [Authentication & RBAC](#authentication--rbac)
3. [Resume Analysis Endpoints](#resume-analysis-endpoints)
4. [Assessment Analysis Endpoints](#assessment-analysis-endpoints)
5. [Interview Analysis Endpoints](#interview-analysis-endpoints)
6. [AI Decision Endpoints](#ai-decision-endpoints)
7. [Ranking & Comparison Endpoints](#ranking--comparison-endpoints)
8. [Analytics Endpoints](#analytics-endpoints)
9. [Admin Endpoints](#admin-endpoints)
10. [Error Handling](#error-handling)
11. [Response Formats](#response-formats)

---

## Base Configuration

### Server URLs

```
Development:  http://localhost:3000/api
Production:   https://api.yourdomain.com/api

AI Service:   http://localhost:5000/api (internal only)
```

### Common Headers

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-Request-ID: {unique_request_id}  (optional, for tracing)
```

### Rate Limiting

```
Standard: 100 requests per minute per user
Burst: 20 requests per 10 seconds
Quota: Based on role
  - Candidate: 50 req/min
  - HR: 200 req/min
  - MD: 150 req/min
  - Admin: Unlimited
```

---

## Authentication & RBAC

### Login & Token

```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "HR"
  },
  "expiresIn": 86400
}
```

### Role-Based Access

| Endpoint | Candidate | HR | MD | Admin |
|----------|-----------|----|----|-------|
| Resume Analysis | ❌ Own only | ✅ | ✅ | ✅ |
| Assessment | ❌ Own only | ✅ | ✅ | ✅ |
| Interview | ❌ Own only | ✅ | ✅ | ✅ |
| AI Decision | ❌ | ✅ | ✅ | ✅ |
| Rankings | ❌ | ✅ | ✅ | ✅ |
| Analytics | ❌ | Limited | ✅ | ✅ |
| Admin Settings | ❌ | ❌ | ❌ | ✅ |

---

## Resume Analysis Endpoints

### Parse Resume & Match Job

```http
POST /ai/resume/parse

Authorization: Bearer {token}
Content-Type: multipart/form-data

Request:
{
  "file": <binary_pdf>,
  "application_id": 1,
  "job_id": 1
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": 1,
    "parsed_data": {
      "contact": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "location": "New York, NY",
        "linkedin": "linkedin.com/in/john"
      },
      "summary": "Experienced software engineer...",
      "skills": {
        "programming_languages": ["Python", "JavaScript", "Java"],
        "web_frameworks": ["React", "Django", "Express"],
        "databases": ["PostgreSQL", "MongoDB"],
        "cloud_platforms": ["AWS", "GCP"],
        "devops_tools": ["Docker", "Kubernetes"],
        "ai_ml": ["TensorFlow", "PyTorch"],
        "data_tools": ["Pandas", "Spark"],
        "soft_skills": ["Leadership", "Communication"]
      },
      "experience": [
        {
          "title": "Senior Software Engineer",
          "company": "Tech Corp",
          "duration": "2020-Present",
          "description": "...",
          "achievements": ["Built microservices", "Led team"]
        }
      ],
      "education": [
        {
          "degree": "B.S. Computer Science",
          "university": "MIT",
          "graduation_year": 2015
        }
      ],
      "achievements": ["Open source contributor", "Published papers"]
    },
    "skill_match_percentage": 85.5,
    "experience_match_percentage": 78.2,
    "overall_fit_percentage": 82.1,
    "strengths": [
      "Strong Python background",
      "Cloud platform experience",
      "Leadership track record"
    ],
    "weaknesses": [
      "Limited Kubernetes experience",
      "No DevOps certification"
    ],
    "recommendations": [
      "Consider upskilling in Terraform",
      "Has strong foundation for the role"
    ],
    "created_at": "2025-02-12T10:30:00Z"
  }
}
```

### Error Responses

```
400 Bad Request
{
  "success": false,
  "error": "INVALID_FILE_FORMAT",
  "message": "File must be PDF or DOCX"
}

413 Payload Too Large
{
  "success": false,
  "error": "FILE_TOO_LARGE",
  "message": "File must be under 10MB"
}

408 Request Timeout
{
  "success": false,
  "error": "AI_SERVICE_TIMEOUT",
  "message": "Resume parsing took too long",
  "retryable": true
}
```

### Store Resume Analysis

```http
POST /ai/resume/analyze

Request:
{
  "application_id": 1,
  "parsed_data": { ... },
  "skill_match_percentage": 85.5,
  "experience_match_percentage": 78.2,
  "overall_fit_percentage": 82.1,
  "strengths": [...],
  "weaknesses": [...],
  "recommendations": [...]
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": 123,
    "application_id": 1,
    "created_at": "2025-02-12T10:30:00Z"
  }
}
```

### Get Resume Analysis

```http
GET /ai/resume/:applicationId

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 123,
    "application_id": 1,
    "parsed_data": { ... },
    "skill_match_percentage": 85.5,
    "experience_match_percentage": 78.2,
    "overall_fit_percentage": 82.1,
    "strengths": [...],
    "weaknesses": [...],
    "recommendations": [...],
    "created_at": "2025-02-12T10:30:00Z",
    "updated_at": "2025-02-12T10:30:00Z"
  }
}
```

---

## Assessment Analysis Endpoints

### Analyze Coding Assessment

```http
POST /ai/assessment/coding

Request:
{
  "application_id": 1,
  "code": "function fibonacci(n) { ... }",
  "problem_description": "Implement fibonacci",
  "expected_output": [...],
  "test_cases": [...]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": 1,
    "assessment_type": "coding",
    "scores": {
      "correctness": 92,
      "code_quality": 85,
      "efficiency": 78,
      "readability": 88,
      "overall": 86,
      "time_complexity": "O(n)",
      "space_complexity": "O(1)"
    },
    "strengths": [
      "Correct algorithm implementation",
      "Good variable naming"
    ],
    "weaknesses": [
      "Could optimize further",
      "Missing edge case handling"
    ],
    "skill_level": "senior",
    "estimated_experience": "5-7 years",
    "recommendations": [
      "Candidate demonstrates strong problem-solving",
      "Ready for senior role"
    ],
    "created_at": "2025-02-12T10:30:00Z"
  }
}
```

### Analyze MCQ Assessment

```http
POST /ai/assessment/mcq

Request:
{
  "application_id": 1,
  "questions": [
    {
      "id": 1,
      "question": "What is the time complexity of quicksort?",
      "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      "correct_answer": 1,
      "candidate_answer": 1,
      "topic": "Algorithms"
    }
  ],
  "time_taken": 1800
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 2,
    "application_id": 1,
    "assessment_type": "mcq",
    "scores": {
      "total_questions": 20,
      "correct_answers": 17,
      "percentage": 85,
      "overall": 85
    },
    "topic_breakdown": {
      "Algorithms": 88,
      "Data Structures": 82,
      "System Design": 80,
      "Databases": 85
    },
    "strengths": ["Strong algorithmic knowledge"],
    "weaknesses": ["Database concepts need work"],
    "skill_level": "senior",
    "estimated_experience": "4-6 years",
    "recommendations": ["Good foundation, ready for interview"],
    "created_at": "2025-02-12T10:30:00Z"
  }
}
```

### Analyze System Design Assessment

```http
POST /ai/assessment/system-design

Request:
{
  "application_id": 1,
  "design_description": "Design a URL shortener system...",
  "requirements": {
    "users_per_second": 1000,
    "storage": "1TB",
    "regions": 3
  }
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 3,
    "application_id": 1,
    "assessment_type": "system_design",
    "scores": {
      "architecture_quality": 88,
      "scalability": 85,
      "reliability": 82,
      "security": 80,
      "overall": 84
    },
    "strengths": [
      "Good understanding of distributed systems",
      "Considered trade-offs"
    ],
    "weaknesses": [
      "Could improve database design",
      "Missing caching strategy"
    ],
    "components_identified": [
      "Load Balancer",
      "API Gateway",
      "Cache Layer",
      "Database"
    ],
    "recommendations": [
      "Excellent for senior role",
      "Production-ready thinking"
    ],
    "created_at": "2025-02-12T10:30:00Z"
  }
}
```

### Analyze Case Study Assessment

```http
POST /ai/assessment/case-study

Request:
{
  "application_id": 1,
  "case_description": "Company X has declining user engagement...",
  "solution_provided": "Implement gamification and personalization..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 4,
    "application_id": 1,
    "assessment_type": "case_study",
    "scores": {
      "problem_understanding": 85,
      "business_acumen": 82,
      "analytical_thinking": 88,
      "creativity": 80,
      "overall": 84
    },
    "strengths": [
      "Good business insight",
      "Creative approach"
    ],
    "weaknesses": [
      "Missed some metrics",
      "Could quantify benefits more"
    ],
    "recommendations": [
      "Strong business sense",
      "Good for PM or Strategy role"
    ],
    "created_at": "2025-02-12T10:30:00Z"
  }
}
```

### Get Assessment Analysis

```http
GET /ai/assessment/:applicationId

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 1,
      "assessment_type": "coding",
      "scores": { ... },
      ...
    },
    {
      "id": 2,
      "assessment_type": "mcq",
      "scores": { ... },
      ...
    }
  ]
}
```

---

## Interview Analysis Endpoints

### Analyze Interview Transcript

```http
POST /ai/interview/analyze

Request:
{
  "application_id": 1,
  "transcript": "Interviewer: Tell me about yourself\nCandidate: I'm a software engineer with...\nInterviewer: What's your experience?",
  "interview_type": "technical",
  "duration_minutes": 45
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": 1,
    "transcript": "...",
    "qa_analyses": [
      {
        "question": "Tell me about yourself",
        "answer": "I'm a software engineer...",
        "relevance_score": 92,
        "clarity_score": 88,
        "confidence_level": "high",
        "assessment": "Clear and relevant response, good confidence"
      }
    ],
    "overall_score": 82,
    "evaluation_criteria": {
      "technical_knowledge": 85,
      "communication": 80,
      "problem_solving": 88,
      "soft_skills": 78,
      "cultural_fit": 81
    },
    "recommendation": "PROCEED_TO_NEXT_ROUND",
    "speaking_patterns": {
      "pace": "moderate",
      "clarity": "clear",
      "vocabulary_level": "advanced",
      "hesitation_level": "low",
      "confidence": "high"
    },
    "performance_prediction": {
      "predicted_performance": "6/10",
      "confidence": 0.85,
      "retention_probability": 0.75
    },
    "red_flags": [
      "Seemed unclear about database design"
    ],
    "green_flags": [
      "Strong communication skills",
      "Good problem-solving approach"
    ],
    "created_at": "2025-02-12T10:30:00Z"
  }
}
```

### Analyze Interview Answer Quality

```http
POST /ai/interview/:interviewId/answer/:answerIndex/analyze

Request:
{
  "question": "What's your approach to debug a production issue?",
  "answer": "I would first check the logs..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "relevance_score": 92,
    "clarity_score": 88,
    "confidence_level": "high",
    "detailed_feedback": "Strong response demonstrating methodical approach...",
    "areas_for_improvement": "Could mention monitoring tools"
  }
}
```

### Get Interview Analysis

```http
GET /ai/interview/:applicationId

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": 1,
    "overall_score": 82,
    "recommendation": "PROCEED_TO_NEXT_ROUND",
    ...
  }
}
```

---

## AI Decision Endpoints

### Generate AI Decision (Auto-Rejection Engine)

```http
POST /ai/decision/generate

Request:
{
  "application_id": 1,
  "force_recalculate": false
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": 1,
    "application_id": 1,
    "resume_score": 82.1,
    "technical_score": 85.4,
    "interview_score": 80.2,
    "final_score": 83.1,
    "score_breakdown": {
      "resume_weight": 0.3,
      "technical_weight": 0.4,
      "interview_weight": 0.3,
      "formula": "final = (resume × 0.3) + (technical × 0.4) + (interview × 0.3)"
    },
    "auto_rejection_flag": false,
    "recommendation": "STRONG_YES",
    "explanation": "Excellent resume match (82%), Strong technical assessment (85%), Good interview performance (80%). Recommended for offer.",
    "decision_criteria": [
      {
        "criterion": "Resume Match",
        "status": "PASS",
        "threshold": 70,
        "actual": 82.1,
        "comment": "Exceeds requirement"
      },
      {
        "criterion": "Technical Competency",
        "status": "PASS",
        "threshold": 70,
        "actual": 85.4,
        "comment": "Strong technical skills"
      },
      {
        "criterion": "Interview Performance",
        "status": "PASS",
        "threshold": 70,
        "actual": 80.2,
        "comment": "Good communication and fit"
      }
    ],
    "next_steps": [
      "Send offer letter",
      "Schedule background check",
      "Arrange onboarding"
    ],
    "created_at": "2025-02-12T10:30:00Z"
  }
}
```

### Decision Status - AUTO_REJECTED (Score < 40)

```json
{
  "final_score": 35.2,
  "auto_rejection_flag": true,
  "recommendation": "STRONG_NO",
  "explanation": "Resume shows limited relevant experience. Technical assessment indicates skill gaps. Not recommended for this role.",
  "next_steps": [
    "Send rejection email",
    "Optional: Offer alternative positions",
    "Archive application"
  ]
}
```

### Decision Status - PROCEED_TO_HR (Score 40-60)

```json
{
  "final_score": 52.3,
  "auto_rejection_flag": false,
  "recommendation": "MAYBE",
  "explanation": "Average fit for the role. Technical skills are adequate but interview performance was borderline. HR should review for final decision.",
  "next_steps": [
    "HR team review",
    "Schedule second round",
    "Request additional references"
  ]
}
```

### Decision Status - RECOMMENDED (Score >= 60)

```json
{
  "final_score": 76.5,
  "auto_rejection_flag": false,
  "recommendation": "YES",
  "explanation": "Good fit for the role with strong technical skills. Interview went well. Recommended to proceed with offer.",
  "next_steps": [
    "Send offer letter",
    "Schedule background check"
  ]
}
```

---

## Ranking & Comparison Endpoints

### Get Ranked Candidates for Job

```http
GET /ai/candidates/ranked?jobId=1&skillLevel=senior&limit=10

Response: 200 OK
{
  "success": true,
  "data": {
    "job_id": 1,
    "total_candidates": 25,
    "candidates": [
      {
        "id": 1,
        "application_id": 101,
        "candidate_name": "John Doe",
        "email": "john@example.com",
        "years_experience": 6,
        "skill_level": "senior",
        "location": "New York",
        "education": "B.S. Computer Science",
        "resume_score": 85.2,
        "technical_score": 88.5,
        "interview_score": 82.1,
        "final_score": 85.6,
        "ai_decision": "RECOMMENDED",
        "strengths": [
          "Strong Python developer",
          "DevOps experience"
        ],
        "concerns": [
          "Limited team leadership"
        ],
        "created_at": "2025-02-12T10:30:00Z"
      },
      {
        "id": 2,
        "candidate_name": "Jane Smith",
        "final_score": 78.3,
        "ai_decision": "PROCEED_TO_HR",
        ...
      },
      {
        "id": 3,
        "candidate_name": "Bob Johnson",
        "final_score": 65.1,
        "ai_decision": "MAYBE",
        ...
      }
    ],
    "summary": {
      "recommended_count": 8,
      "proceed_count": 12,
      "rejected_count": 5,
      "average_score": 72.3
    }
  }
}
```

### Compare Specific Candidates

```http
POST /ai/candidates/compare

Request:
{
  "job_id": 1,
  "candidate_ids": [1, 2, 3]
}

Response: 200 OK
{
  "success": true,
  "data": {
    "job_id": 1,
    "comparison_data": [
      {
        "rank": 1,
        "candidate_id": 1,
        "candidate_name": "John Doe",
        "final_score": 85.6,
        "scores": {
          "resume": 85.2,
          "technical": 88.5,
          "interview": 82.1
        },
        "recommendation": "STRONG_YES",
        "skills_match": 92,
        "experience_match": 88,
        "cultural_fit": 80
      }
    ],
    "best_fit": {
      "candidate_id": 1,
      "reason": "Highest overall score with balanced skills"
    },
    "recommendation": "Hire candidates 1 and 2, proceed with 3 to next round"
  }
}
```

---

## Analytics Endpoints

### Get Analytics Dashboard

```http
GET /ai/analytics?jobId=1&departmentId=2&skillLevel=senior

Response: 200 OK
{
  "success": true,
  "data": {
    "stats": {
      "total_applications": 150,
      "recommended_count": 25,
      "rejected_count": 105,
      "pending_count": 20,
      "average_final_score": 68.5,
      "recommendation_rate_percentage": 25
    },
    "candidates": [...],
    "scoreDistribution": [
      { "range": "0-20", "count": 5 },
      { "range": "20-40", "count": 25 },
      { "range": "40-60", "count": 45 },
      { "range": "60-80", "count": 55 },
      { "range": "80-100", "count": 20 }
    ],
    "decisionBreakdown": [
      { "name": "RECOMMENDED", "value": 25 },
      { "name": "PROCEED_TO_HR", "value": 55 },
      { "name": "AUTO_REJECTED", "value": 70 }
    ],
    "skillLevelDistribution": [
      { "name": "junior", "count": 45 },
      { "name": "mid_level", "count": 65 },
      { "name": "senior", "count": 30 },
      { "name": "expert", "count": 10 }
    ]
  }
}
```

### Export Analytics

```http
POST /ai/analytics/export

Request:
{
  "jobId": 1,
  "departmentId": 2,
  "format": "csv"
}

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="analytics.csv"

candidate_id,name,email,final_score,recommendation,...
```

---

## Admin Endpoints

### Get AI Configuration

```http
GET /admin/ai-config

Response: 200 OK
{
  "success": true,
  "data": {
    "current_model": "gemini-2.0-flash",
    "model_updated_at": "2025-02-12T10:00:00Z",
    "api_key_valid": true,
    "api_key_expires": "2025-06-30",
    "request_timeout": 30,
    "max_retries": 3,
    "temperature": 0.7,
    "cache_enabled": true,
    "cache_ttl_minutes": 60
  }
}
```

### Update AI Configuration

```http
PUT /admin/ai-config

Request:
{
  "request_timeout": 45,
  "max_retries": 5,
  "temperature": 0.5,
  "cache_enabled": false
}

Response: 200 OK
{
  "success": true,
  "data": {
    "updated_fields": 4,
    "timestamp": "2025-02-12T10:45:00Z"
  }
}
```

### Change AI Model

```http
PUT /admin/ai-model

Request:
{
  "model": "gemini-1.5-flash"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "previous_model": "gemini-2.0-flash",
    "new_model": "gemini-1.5-flash",
    "switched_at": "2025-02-12T10:50:00Z"
  }
}
```

### Get System Health

```http
GET /admin/ai-health

Response: 200 OK
{
  "success": true,
  "data": {
    "service_status": "healthy",
    "uptime_hours": 240,
    "avg_response_time_ms": 850,
    "last_response_ms": 920,
    "db_connected": true,
    "active_queries": 5,
    "error_rate": 0.02,
    "total_errors": 15,
    "total_requests": 750
  }
}
```

### Restart AI Service

```http
POST /admin/ai-service/restart

Response: 202 Accepted
{
  "success": true,
  "message": "Service restart initiated",
  "expected_completion_seconds": 10
}
```

### Get Audit Logs

```http
GET /admin/ai-audit-logs?limit=50&offset=0

Response: 200 OK
{
  "success": true,
  "data": {
    "total_logs": 523,
    "logs": [
      {
        "id": 1,
        "timestamp": "2025-02-12T10:30:00Z",
        "action": "RESUME_ANALYZED",
        "user_id": 1,
        "user_name": "Jane Smith",
        "application_id": 101,
        "details": "Parsed resume: John Doe",
        "status": "success"
      },
      {
        "id": 2,
        "timestamp": "2025-02-12T10:25:00Z",
        "action": "MODEL_CHANGED",
        "user_id": 2,
        "user_name": "Admin User",
        "details": "Changed model from gemini-2.0 to gemini-1.5",
        "status": "success"
      }
    ]
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    "field": "Specific field with error",
    "suggestion": "How to fix it"
  },
  "retryable": true,
  "timestamp": "2025-02-12T10:30:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Retry |
|------|---------|-------|
| 200 | Success | — |
| 201 | Created | — |
| 202 | Accepted (async) | — |
| 400 | Bad Request | ❌ |
| 401 | Unauthorized | ❌ |
| 403 | Forbidden (RBAC) | ❌ |
| 404 | Not Found | ❌ |
| 408 | Timeout | ✅ |
| 409 | Conflict | ❌ |
| 413 | Payload Too Large | ❌ |
| 429 | Rate Limited | ✅ |
| 500 | Server Error | ✅ |
| 503 | Service Unavailable | ✅ |

### Common Error Codes

```
// File Handling
INVALID_FILE_FORMAT       - File is not PDF/DOCX
FILE_TOO_LARGE            - File exceeds 10MB
FILE_UPLOAD_FAILED        - Upload process failed
CORRUPTED_FILE            - Cannot read file

// AI Service
AI_SERVICE_TIMEOUT        - Request exceeded timeout
AI_SERVICE_UNAVAILABLE    - Python service not responding
AI_API_ERROR              - Google API error (quota, auth, etc.)
INVALID_ASSESSMENT_TYPE   - Unknown assessment type
INVALID_ANALYSIS_TYPE     - Unknown analysis type

// Database
DATABASE_ERROR            - PostgreSQL error
DUPLICATE_ENTRY           - Record already exists
NOT_FOUND                 - Record not found
INVALID_RELATIONSHIP      - Foreign key constraint

// Authentication
INVALID_TOKEN             - JWT token invalid/expired
INSUFFICIENT_PERMISSIONS  - Role lacks permission
AUTHENTICATION_FAILED     - Login failed
SESSION_EXPIRED           - Session timed out

// Rate Limiting
RATE_LIMIT_EXCEEDED       - Too many requests
QUOTA_EXCEEDED            - Monthly quota exhausted
BURST_LIMIT_EXCEEDED      - Burst rate exceeded
```

### Retry Logic (Client-Side)

```typescript
async function retryWithBackoff(
  fn: () => Promise<any>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (!error.retryable || attempt === maxRetries - 1) {
        throw error;
      }
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await retryWithBackoff(() =>
  fetch('/api/ai/resume/parse').then(r => r.json())
);
```

---

## Response Formats

### Pagination

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasMore": true
  }
}
```

### Timestamps

All timestamps use ISO 8601 format with UTC timezone:
```
2025-02-12T10:30:00Z
```

### Numeric Scores

All scores are 0-100 unless otherwise specified:
```json
{
  "overall_score": 85.5,
  "technical_score": 88.2,
  "communication_score": 78.9
}
```

### Recommendation Enum

```
STRONG_YES    - Highly recommended, move to offer
YES           - Recommended, proceed
MAYBE         - Borderline, needs review
NO            - Not recommended
STRONG_NO     - Strongly not recommended
```

### Skill Level Enum

```
junior        - 0-40 points
mid_level     - 40-70 points
senior        - 70-85 points
expert        - 85+ points
```

### Assessment Type Enum

```
coding        - Programming problem
mcq           - Multiple choice questions
system_design - System design interview
case_study    - Business case study
technical     - Technical round
aptitude      - Aptitude test
```

---

## Integration Examples

### React Query Hook

```typescript
import { useQuery } from '@tanstack/react-query';

export const useResumeAnalysis = (applicationId: number) => {
  return useQuery({
    queryKey: ['resume-analysis', applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/ai/resume/${applicationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Axios Interceptor

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

// Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    throw error;
  }
);
```

---

**API Version**: 1.0.0
**Last Updated**: 2025-02-12
**Status**: Production Ready
