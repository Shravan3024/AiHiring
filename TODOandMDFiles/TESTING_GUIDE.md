# HR Panel E2E Testing Guide

Complete guide for testing all newly implemented HR Panel endpoints and features.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Test Methods](#test-methods)
3. [Test Scenarios](#test-scenarios)
4. [Expected Results](#expected-results)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Backend Setup
```bash
cd backend
npm install  # If not already done
npm start
# Expected Output: Server running on port 5000
```

### 2. Database Setup
Ensure database has:
- At least 1 application record with complete AI analysis
- At least 1 candidate record
- Valid user records for HR/MD roles

Query to check:
```sql
-- Check test data exists
SELECT COUNT(*) FROM applications;
SELECT COUNT(*) FROM ai_decisions;
SELECT COUNT(*) FROM candidates;
```

### 3. JWT Token
Get a valid token by:

**Option A: Login via Frontend**
```
1. Open http://localhost:3000/login
2. Login with HR user credentials
3. Open DevTools → Application → Cookies
4. Copy the JWT token
```

**Option B: Login via Postman**
```
POST http://localhost:5000/api/auth/login
Body:
{
  "email": "hr@company.com",
  "password": "your_password"
}
Response: { token: "eyJhbGc..." }
```

**Option C: Generate Direct SQL**
```sql
-- Get HR user's session token (if available)
SELECT token FROM sessions WHERE user_id IN 
  (SELECT id FROM users WHERE role = 'HR') 
LIMIT 1;
```

### 4. Test Application ID
Find an application to test with:
```sql
SELECT id FROM applications 
WHERE id IN (SELECT application_id FROM ai_decisions)
LIMIT 1;
-- Store this as TEST_APP_ID
```

---

## Test Methods

### Method 1: Node.js Test Suite (Recommended)

**Setup:**
```bash
cd backend
nano test-e2e-endpoints.js
# Edit lines:
# - const TEST_TOKEN = 'YOUR_JWT_TOKEN'
# - const TEST_APP_ID = your_app_id
# - const TEST_JOB_ID = your_job_id (optional)
```

**Run:**
```bash
node test-e2e-endpoints.js
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║    E2E API ENDPOINT TEST SUITE         ║
╚════════════════════════════════════════╝

Testing endpoint: GET /api/ai/analytics
✓ PASS - Status: 200

Testing endpoint: POST /api/ai/analytics/export
✓ PASS - Status: 200

... (12 total tests)

╔════════════════════════════════════════╗
║    TEST RESULTS: 12/12 PASSED          ║
╚════════════════════════════════════════╝
```

### Method 2: Bash/Curl Test Suite

**Setup:**
```bash
cd backend
# No setup needed - uses command-line args
```

**Run:**
```bash
bash test-endpoints.sh YOUR_JWT_TOKEN APPLICATION_ID JOB_ID
# Example:
bash test-endpoints.sh eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... 1 1
```

**Expected Output:**
```
═════════════════════════════════════════════════════════════════════
                    E2E API ENDPOINT TESTS (cURL)
═════════════════════════════════════════════════════════════════════

[1] Testing GET /api/ai/analytics
  Status: 200 ✓ PASS
  
[2] Testing GET /api/hr/applications
  Status: 200 ✓ PASS

... (12 total tests)

═════════════════════════════════════════════════════════════════════
                    SUMMARY: 12 PASSED # FAILED
═════════════════════════════════════════════════════════════════════
```

### Method 3: Postman Collection

**Import:**
1. Open Postman
2. Click **Import** → **File**
3. Select `backend/postman-collection.json`
4. Click **Import**

**Configure Variables:**
1. Click **Environment** dropdown → **Edit**
2. Add variables:
   - `base_url`: `http://localhost:5000/api`
   - `token`: Your JWT token
   - `applicationId`: Test application ID
   - `jobId`: Test job ID

**Run Tests:**
1. Select each endpoint folder
2. Click **Send**
3. Verify response status and body

### Method 4: Manual Testing with cURL

**Single Endpoint Test:**
```bash
# Get Analytics
curl -X GET http://localhost:5000/api/ai/analytics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Send Offer
curl -X POST http://localhost:5000/api/hr/send-offer/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{'salary': 1000000, 'joining_date': '2026-05-01'}'
```

---

## Test Scenarios

### Scenario 1: Analytics Dashboard Flow

**Steps:**
1. Load analytics endpoint
2. Verify aggregated stats
3. Check filters work
4. Export to CSV
5. Verify file format

**Commands:**
```bash
# Start backend
npm start

# In another terminal:
node test-e2e-endpoints.js

# Verify output includes:
# ✓ Analytics loaded
# ✓ Stats calculated
# ✓ Export successful
```

### Scenario 2: HR Application Review

**Steps:**
1. Get all applications
2. Select one application
3. View AI analysis
4. Review candidate details

**Test Flow:**
```bash
# Get all applications
curl http://localhost:5000/api/hr/applications \
  -H "Authorization: Bearer $TOKEN"

# Response should include:
# [
#   {
#     "id": 1,
#     "candidate": { "name": "...", "email": "..." },
#     "ai_decision": "RECOMMENDED",
#     "final_score": 75,
#     ...
#   }
# ]
```

### Scenario 3: Send Offer Letter

**Steps:**
1. Select recommended candidate
2. Fill offer details
3. Click "Send Offer"
4. Verify notification sent
5. Check database update

**Expected Results:**
```sql
-- After sending offer

-- Application status updated
SELECT id, status FROM applications WHERE id = 1;
-- Result: status = 'OFFER_SENT'

-- Notification created
SELECT id, message, recipientId FROM notifications 
WHERE application_id = 1 ORDER BY createdAt DESC LIMIT 1;
-- Result: Message about offer received

-- HR internal note created
SELECT id, note FROM hr_internal_notes 
WHERE application_id = 1 ORDER BY createdAt DESC LIMIT 1;
```

### Scenario 4: RBAC Enforcement

**Steps:**
1. Test without token → 401
2. Test with expired token → 401
3. Test with candidate token → 403
4. Test with HR token → 200

**Commands:**
```bash
# Test 1: No Authorization header
curl http://localhost:5000/api/ai/analytics
# Expected: 401 Unauthorized

# Test 2: Invalid token
curl http://localhost:5000/api/ai/analytics \
  -H "Authorization: Bearer INVALID"
# Expected: 401 Unauthorized

# Test 3: Candidate trying to access HR endpoint
curl http://localhost:5000/api/hr/applications \
  -H "Authorization: Bearer CANDIDATE_TOKEN"
# Expected: 403 Forbidden (or 401 if no valid role)

# Test 4: HR accessing their endpoint
curl http://localhost:5000/api/hr/applications \
  -H "Authorization: Bearer HR_TOKEN"
# Expected: 200 OK
```

### Scenario 5: Filter and Pagination

**Steps:**
1. Test analytics with jobId filter
2. Test analytics with departmentId filter
3. Test combined filters
4. Verify aggregation recalculates

**Commands:**
```bash
# Filter by job
curl "http://localhost:5000/api/ai/analytics?jobId=1" \
  -H "Authorization: Bearer $TOKEN"

# Filter by department
curl "http://localhost:5000/api/ai/analytics?departmentId=2" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters
curl "http://localhost:5000/api/ai/analytics?jobId=1&skillLevel=SENIOR" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Expected Results

### 1. Analytics Endpoint - GET `/api/ai/analytics`

**Status Code:** 200

**Response Format:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_applications": 15,
      "recommended_count": 8,
      "rejected_count": 4,
      "proceeding_count": 3,
      "avg_final_score": 62.5,
      "avg_resume_score": 65,
      "avg_technical_score": 60,
      "avg_interview_score": 63
    },
    "candidatesList": [
      {
        "applicationId": 1,
        "candidateName": "John Doe",
        "finalScore": 75,
        "decision": "RECOMMENDED",
        "resumeScore": 78,
        "technicalScore": 72,
        "interviewScore": 75,
        "jobTitle": "Software Engineer",
        "department": "Engineering"
      },
      ...
    ],
    "scoreDistribution": {
      "0-20": 0,
      "20-40": 2,
      "40-60": 5,
      "60-80": 6,
      "80-100": 2
    },
    "decisionBreakdown": {
      "RECOMMENDED": 8,
      "REJECTED": 4,
      "PROCEED_TO_HR": 3
    },
    "skillLevelDistribution": {
      "JUNIOR": 2,
      "SENIOR": 8,
      "LEAD": 3,
      "EXPERT": 2
    }
  }
}
```

### 2. HR Applications - GET `/api/hr/applications`

**Status Code:** 200

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "candidateName": "Jane Smith",
      "candidateEmail": "jane@example.com",
      "jobTitle": "Senior Developer",
      "department": "Engineering",
      "status": "RECOMMENDED_BY_AI",
      "aiScore": 78,
      "aiDecision": "RECOMMENDED",
      "appliedDate": "2026-03-20T10:30:00Z"
    },
    ...
  ]
}
```

### 3. Send Offer - POST `/api/hr/send-offer/:id`

**Status Code:** 200

**Response Format:**
```json
{
  "success": true,
  "message": "Offer letter sent successfully",
  "data": {
    "applicationId": 1,
    "offerStatus": "OFFER_SENT",
    "notificationSent": true,
    "timestamp": "2026-03-25T14:45:00Z"
  }
}
```

**Database Changes:**
- `applications.status` → `'OFFER_SENT'`
- New notification created → Candidate receives email
- Application updated timestamp

### 4. Send Rejection - POST `/api/hr/send-rejection/:id`

**Status Code:** 200

**Response Format:**
```json
{
  "success": true,
  "message": "Rejection notification sent",
  "data": {
    "applicationId": 1,
    "rejectionStatus": "REJECTED",
    "reason": "Did not meet requirements",
    "notificationSent": true,
    "timestamp": "2026-03-25T15:00:00Z"
  }
}
```

### 5. Schedule Interview - POST `/api/hr/schedule-interview/:id`

**Status Code:** 200

**Response Format:**
```json
{
  "success": true,
  "message": "Interview scheduled successfully",
  "data": {
    "applicationId": 1,
    "interviewDate": "2026-04-15",
    "interviewTime": "10:00 AM",
    "interviewer": "John Manager",
    "interviewType": "technical",
    "sessionId": 1,
    "notificationSent": true
  }
}
```

### 6. Add Internal Note - POST `/api/hr/add-note/:id`

**Status Code:** 200

**Response Format:**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "applicationId": 1,
    "note": "Strong technical background",
    "addedBy": "HR User Name",
    "timestamp": "2026-03-25T16:30:00Z"
  }
}
```

### 7. Export Analytics - POST `/api/ai/analytics/export`

**Status Code:** 200

**Response Format:**
```
CSV File Stream

Headers:
- ApplicationID
- CandidateName
- Email
- JobTitle
- Department
- ResumeScore
- TechnicalScore
- InterviewScore
- FinalScore
- Decision
- Status
- SkillLevel
- AppliedDate

Rows:
1,John Doe,john@example.com,Software Engineer,Engineering,78,72,75,75,RECOMMENDED,RECOMMENDED_BY_AI,SENIOR,2026-03-20
...
```

---

## Verification Checklist

Run through this checklist after executing tests:

### Backend Endpoints
- [ ] ✓ GET `/api/ai/analytics` returns 200 ✓
- [ ] ✓ GET `/api/ai/analytics?jobId=X` filters correctly
- [ ] ✓ POST `/api/ai/analytics/export` returns CSV
- [ ] ✓ GET `/api/hr/applications` returns 200
- [ ] ✓ GET `/api/hr/applications/:id` returns single app
- [ ] ✓ POST `/api/hr/send-offer/:id` updates status
- [ ] ✓ POST `/api/hr/send-rejection/:id` updates status
- [ ] ✓ POST `/api/hr/schedule-interview/:id` creates session
- [ ] ✓ POST `/api/hr/add-note/:id` creates note
- [ ] ✓ GET `/api/ai/analysis/:id` returns analysis data

### Response Formats
- [ ] All responses have `success: true/false`
- [ ] All success responses have `data` object
- [ ] Errors have proper `message` field
- [ ] HTTP status codes are correct
- [ ] Response times < 2 seconds avg

### Database Updates
- [ ] Offer letter triggers status change
- [ ] Rejection updates application status
- [ ] Interview scheduling creates session record
- [ ] Notes are persisted correctly
- [ ] All timestamps are accurate

### RBAC
- [ ] Unauthenticated requests return 401
- [ ] Invalid tokens return 401
- [ ] Candidates can't access HR endpoints (403)
- [ ] HR can access HR endpoints (200)
- [ ] MD can access analytics (200)

### Notifications
- [ ] Candidate receives notification on offer
- [ ] Candidate receives notification on rejection
- [ ] Candidate receives notification on interview
- [ ] Notifications are persisted in DB

### Frontend Integration
- [ ] HR applications page loads
- [ ] Analytics dashboard displays data
- [ ] Filters update analytics
- [ ] Export button downloads CSV
- [ ] Action buttons are functional

---

## Troubleshooting

### Issue: "Cannot connect to localhost:5000"
**Solution:**
```bash
# Check backend is running
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# If not running:
cd backend && npm start

# Check for errors:
tail -100 backend/server_log.txt
```

### Issue: "401 Unauthorized"
**Solution:**
```bash
# Verify token is valid
echo $TOKEN  # Check token is set

# Login again to get fresh token
curl -X POST http://localhost:5000/api/auth/login \
  -d '{"email":"hr@company.com","password":"password"}' \
  -H "Content-Type: application/json"

# Use new token in requests
```

### Issue: "403 Forbidden"
**Solution:**
```bash
# Check user role
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Should show role: "HR" or "MD" or "ADMIN"
# If role is "CANDIDATE", use HR account instead
```

### Issue: "Cannot find application ID X"
**Solution:**
```bash
# List all applications
curl http://localhost:5000/api/hr/applications \
  -H "Authorization: Bearer $TOKEN"

# Use one of the returned IDs
# Or insert test data:
psql postgresql://user:pass@localhost/dbname -c \
  "INSERT INTO applications (candidateId, jobId) VALUES (1, 1);"
```

### Issue: "Module not found" or "Cannot find module"
**Solution:**
```bash
cd backend
npm install  # Reinstall dependencies
npm prune    # Clean up unused dependencies
npm start
```

### Issue: Tests timeout or hang
**Solution:**
```bash
# Check database connection
curl http://localhost:5000/api/health
# Should return 200 OK

# If database down:
# 1. Check PostgreSQL is running
# 2. Verify DATABASE_URL env var
# 3. Check database credentials
```

### Issue: CORS errors in frontend
**Solution:**
```javascript
// Already configured in backend/src/app.js
// If still having issues:

// 1. Check frontend URL matches CORS config
// 2. Verify credentials in fetch:
fetch(url, {
  credentials: 'include',  // Include cookies
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

// 3. Check backend hasn't been restarted without CORS
```

---

## Performance Benchmarks

Expected response times (baseline):

| Endpoint | Expected Time |
|----------|---------------|
| GET /ai/analytics | 500ms - 1s |
| GET /ai/analytics (filtered) | 300ms - 700ms |
| GET /hr/applications | 200ms - 400ms |
| POST /hr/send-offer | 300ms - 600ms |
| POST /hr/send-rejection | 300ms - 600ms |
| POST /hr/schedule-interview | 400ms - 800ms |
| GET /ai/analysis/:id | 200ms - 500ms |

**Optimization if slow:**
```bash
# 1. Check database indexes
SELECT * FROM pg_indexes WHERE tablename = 'ai_decisions';

# 2. Monitor backend logs
tail -50 backend/server_log.txt

# 3. Profile slow queries
# Enable query logging in .env:
DB_QUERY_LOG=true
npm start

# 4. Check server resources
top  # Linux/Mac
tasklist | findstr node  # Windows
```

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - ✅ System is ready for deployment
   - ✅ Document test results
   - ✅ Create release notes
   - ✅ Update user documentation

2. **If Some Tests Fail:**
   - 📋 Document failures
   - 📋 Check logs for error details
   - 📋 Fix identified issues
   - 📋 Re-run tests

3. **Post-Deployment:**
   - Monitor logs for issues
   - Collect performance metrics
   - Gather user feedback
   - Plan v2.0 improvements

---

**Last Updated:** 2026-03-25  
**Test Suite Version:** 1.0.0  
**Compatible With:** Node 16+, PostgreSQL 12+  
