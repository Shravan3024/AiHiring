# Quick Test Setup - 5 Minutes

Get started testing the HR Panel immediately.

## Step 1: Start Backend (1 minute)

```bash
cd backend
npm start
```

**Expected Output:**
```
Server running on port 5000
Database connected
✓ Ready for testing
```

## Step 2: Get JWT Token (1 minute)

**Option A - Quick (if you have DevTools):**
```bash
# Open http://localhost:3000/login
# Login as HR user
# DevTools → Application → Cookies → Copy token
```

**Option B - Direct API:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hr@company.com",
    "password": "your_password"
  }'

# Copy the token from response
# Set environment variable:
export TOKEN="eyJhbGc..."  # macOS/Linux
set TOKEN=eyJhbGc...      # Windows PowerShell
```

## Step 3: Find Test Application ID (1 minute)

```bash
# If using PostgreSQL directly:
psql postgresql://user:password@localhost/your_db

# Run:
SELECT id FROM applications LIMIT 1;

# Get the ID, then:
export APP_ID=1  # Use your actual ID
```

## Step 4: Run Tests (2 minutes)

**Choose ONE method:**

### Method A: Node.js (Recommended)
```bash
cd backend
node test-e2e-endpoints.js
```

### Method B: Bash/cURL
```bash
cd backend
bash test-endpoints.sh $TOKEN $APP_ID
```

### Method C: Postman
1. Import `backend/postman-collection.json`
2. Set variables:
   - `token`: Your JWT
   - `applicationId`: Your app ID
3. Click "Send" on each endpoint

---

## Quick Test Commands

Copy-paste ready:

```bash
# 1. Set your token (replace with actual token)
export TOKEN="your_jwt_token_here"
export APP_ID=1
export JOB_ID=1

# 2. Test Analytics
curl http://localhost:5000/api/ai/analytics \
  -H "Authorization: Bearer $TOKEN"

# 3. Test Applications
curl http://localhost:5000/api/hr/applications \
  -H "Authorization: Bearer $TOKEN"

# 4. Test Send Offer
curl -X POST http://localhost:5000/api/hr/send-offer/$APP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 1000000,
    "joining_date": "2026-05-01"
  }'

# 5. Test Add Note
curl -X POST http://localhost:5000/api/hr/add-note/$APP_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Strong candidate"
  }'
```

---

## Expected Success Indicators ✓

After running tests, you should see:

- [ ] All 12 tests show ✓ PASS
- [ ] Response status codes are 200
- [ ] No 401/403 errors
- [ ] No database errors
- [ ] Data is returned in correct format

---

## If Something Fails 🔧

**No connection to backend?**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# If fails, restart backend:
cd backend && npm start
```

**401 Unauthorized?**
```bash
# Token is wrong or expired
# Get new token:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hr@company.com","password":"password"}'
```

**No applications in database?**
```bash
# Check if test data exists:
psql postgresql://user:pass@localhost/db -c \
  "SELECT COUNT(*) FROM applications;"

# If 0, insert test data or use seed script:
cd backend && node seed_demo.js
```

---

## Full Documentation

For detailed testing guide, see: [TESTING_GUIDE.md](./TESTING_GUIDE.md)

---

## Summary of What Was Implemented

✅ **Backend Endpoints:**
- GET `/api/ai/analytics` - Dashboard stats
- POST `/api/ai/analytics/export` - CSV export
- GET `/api/hr/applications` - List all apps
- POST `/api/hr/send-offer/:id` - Send offer
- POST `/api/hr/send-rejection/:id` - Reject candidate
- POST `/api/hr/schedule-interview/:id` - Schedule interview
- POST `/api/hr/add-note/:id` - Internal notes

✅ **Frontend Updates:**
- Fixed HR applications API call
- Added analytics export functionality
- Fixed MDAnalyticsPanel fetch calls
- Created centralized aiApi helper

✅ **Test Infrastructure:**
- Node.js test suite (500+ lines)
- Bash/cURL test suite (200+ lines)
- Postman collection (import-ready)
- Comprehensive testing guide

---

**Ready?** Start with: `npm start` in backend folder, then run a test method above!
