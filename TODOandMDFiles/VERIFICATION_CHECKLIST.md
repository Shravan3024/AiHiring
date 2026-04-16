# 🧪 Verification Checklist - Backend-Frontend Integration

## Backend Verification

### Endpoints Exist
- [ ] GET `/api/ai/analytics` returns 200 with proper data structure
- [ ] POST `/api/ai/analytics/export` returns CSV file
- [ ] POST `/hr/send-offer/:id` returns 200 with offer details
- [ ] POST `/hr/send-rejection/:id` returns 200 
- [ ] POST `/hr/schedule-interview/:id` returns 200
- [ ] POST `/hr/add-note/:id` returns 200

### Test Commands
```bash
# Test analytics endpoint
curl -X GET "http://localhost:5000/api/ai/analytics?jobId=1" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq

# Test with valid HR user should return success
# Test with candidate user should return 403 Forbidden

# Test analytics export
curl -X POST "http://localhost:5000/api/ai/analytics/export" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jobId": 1}' > export.csv

# Test send offer
curl -X POST "http://localhost:5000/hr/send-offer/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"salary": 1000000, "joining_date": "2026-05-01", "designation": "Software Engineer"}'
```

---

## Frontend Verification

### API Methods Exist
- [ ] `aiApi.getAnalytics()` is callable
- [ ] `aiApi.exportAnalytics()` is callable
- [ ] `aiApi.getAnalysis()` is callable
- [ ] `aiApi.makeDecision()` is callable

### Page Tests
- [ ] Navigate to `/hr/applications` as HR user
  - [ ] Page loads without errors
  - [ ] Applications table displays
  - [ ] Search works
  - [ ] Status filter works
- [ ] Click "Review" on any application
  - [ ] Detail page loads
  - [ ] Candidate info displays
  - [ ] Score breakdown shows
  - [ ] 4 tabs display (Decision, Resume, Assessment, Interview)
  - [ ] HR action buttons visible
- [ ] Navigate to `/hr/ai-analytics` as MD user
  - [ ] Page loads without errors
  - [ ] Analytics panel renders
  - [ ] Stats cards show numbers
  - [ ] Charts render correctly
  - [ ] Export button works

### Component Tests
- [ ] MDAnalyticsPanel loads
  - [ ] Uses `aiApi.getAnalytics()` ✓
  - [ ] Displays stats ✓
  - [ ] Renders charts ✓
  - [ ] Export works ✓

---

## Integration Tests

### Test Scenario 1: Complete HR Workflow
1. [ ] Login as HR
2. [ ] Go to `/hr/applications`
3. [ ] See at least one application
4. [ ] Click "Review" 
5. [ ] See full application details
6. [ ] Click "Send Offer Letter"
7. [ ] Fill in offer details
8. [ ] Submit successfully
9. [ ] See success message
10. [ ] Go back to list
11. [ ] See application status updated

### Test Scenario 2: Analytics Dashboard
1. [ ] Login as MD
2. [ ] Go to `/hr/ai-analytics`
3. [ ] See stats cards with numbers
4. [ ] See all 7 visualizations rendering
5. [ ] Filter by job - stats update
6. [ ] Click export - CSV downloads
7. [ ] Open CSV in Excel - data is readable

### Test Scenario 3: Score Calculation
1. [ ] Find candidate with known scores:
   - Resume: 80
   - Technical: 90  
   - Interview: 60
2. [ ] Calculate expected: (80×0.3) + (90×0.4) + (60×0.3) = 79
3. [ ] Verify in HR applications table
4. [ ] Verify in application detail page
5. [ ] Verify in analytics dashboard
6. [ ] Verify color is correct (Green for 79)

---

## Database Verification

### Tables Have Data
- [ ] `ai_decisions` table has records
- [ ] `resume_analysis` table has records
- [ ] `assessment_analysis` table has records
- [ ] `interview_analysis` table has records
- [ ] `applications` table has overall_score values

### Queries Work
```sql
-- Check AI decisions exist
SELECT COUNT(*) FROM ai_decisions;

-- Check score distribution
SELECT 
  CASE 
    WHEN final_score < 40 THEN 'AUTO_REJECTED'
    WHEN final_score < 60 THEN 'PROCEED_TO_HR'
    ELSE 'RECOMMENDED'
  END as decision,
  COUNT(*) as count
FROM ai_decisions
GROUP BY decision;

-- Check average scores
SELECT
  AVG(resume_score) as avg_resume,
  AVG(technical_assessment_score) as avg_technical,
  AVG(interview_score) as avg_interview,
  AVG(final_score) as avg_final
FROM ai_decisions;
```

---

## Performance Tests

- [ ] `/api/ai/analytics` returns in < 1 second
- [ ] `/hr/applications` loads < 2 seconds
- [ ] `/hr/ai-analytics` charts render < 3 seconds
- [ ] CSV export completes < 5 seconds
- [ ] No console errors in browser

---

## RBAC Tests

### HR User Can
- [ ] View all applications
- [ ] View application details
- [ ] Send offers
- [ ] Send rejections
- [ ] Schedule interviews
- [ ] Add notes
- [ ] Access basic dashboard

### MD User Can
- [ ] View analytics dashboard
- [ ] Export analytics
- [ ] Should NOT see individual application details

### Candidate User Should
- [ ] See their own application status: ✓
- [ ] See their own AI analysis: ✓
- [ ] NOT access HR applications list: ✓
- [ ] NOT access analytics: ✓

---

## Error Handling

- [ ] Missing applicationId returns 400
- [ ] Invalid applicationId returns 404
- [ ] Unauthorized user returns 403
- [ ] Database errors return 500 with message
- [ ] Frontend shows user-friendly error messages
- [ ] Frontend doesn't show stack traces in production mode

---

## Browser Compatibility

- [ ] Chrome/Edge - works fine
- [ ] Firefox - works fine
- [ ] Safari - works fine
- [ ] Mobile Safari (iPad) - responsive
- [ ] Mobile Chrome (Android) - responsive

---

## Regression Tests

- [ ] Existing `/hr/applications` endpoint still works
- [ ] Existing AI analysis retrieval still works
- [ ] Existing candidate dashboard still works
- [ ] Existing notifications still work
- [ ] Existing auth/RBAC still work

---

## Documentation Verification

- [ ] IMPLEMENTATION_COMPLETE.md is complete
- [ ] CHANGES_SUMMARY.md lists all changes
- [ ] BACKEND_FRONTEND_INTEGRATION_PLAN.md is accurate
- [ ] FRONTEND_AI_INTEGRATION.md includes new endpoints
- [ ] Code comments explain new functions

---

## Pre-Production Checklist

- [ ] All tests above pass
- [ ] No console errors or warnings
- [ ] No TypeScript errors in build
- [ ] No ESLint warnings
- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] Backend starts without errors
- [ ] Frontend builds without errors
- [ ] All unit tests pass (if any)
- [ ] All integration tests pass
- [ ] Load testing completed
- [ ] Security audit completed
- [ ] Performance optimization done

---

## Sign-Off

| Component | Status | Tester | Date |
|-----------|--------|--------|------|
| Backend APIs | ⏳ | | |
| Frontend Pages | ⏳ | | |
| Integration | ⏳ | | |
| Database | ⏳ | | |
| RBAC | ⏳ | | |
| Performance | ⏳ | | |
| Security | ⏳ | | |

**Overall Status**: Ready for Testing ✅
**Target Date for Production**: [TO BE SET]
