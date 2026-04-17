# ✅ PRE-PRESENTATION VERIFICATION CHECKLIST
## Run 15 minutes before demo

---

## 🔍 STEP 1: BACKEND HEALTH CHECK (2 mins)

Open terminal and run:
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "database": "Connected",
  "models": "Loaded",
  "timestamp": "2026-04-15T10:30:00Z"
}
```

**✅ If successful**: Database connected, all models loaded  
**❌ If failed**: Run backend with `cd backend && npm run dev`

---

## 🔍 STEP 2: AI SERVICE CHECK (2 mins)

Open terminal and run:
```bash
curl http://localhost:5000/api/ai/health
```

**Expected Response:**
```json
{
  "status": "AI Service Operational",
  "models": ["gemini-1.5-flash"],
  "npl_ready": true
}
```

**✅ If successful**: AI models loaded, ready to analyze  
**❌ If failed**: Start Python service `cd backend/ai_service && python app.py`

---

## 🔍 STEP 3: FRONTEND RESPONSE (2 mins)

Open browser and visit:
```
http://localhost:3000
```

**Expected**: Login page loads smoothly  
**✅ If successful**: Frontend responsive  
**❌ If failed**: Start frontend `cd frontend && npm run dev`

---

## 🔍 STEP 4: DATABASE VERIFICATION (3 mins)

Run this Node.js script to verify all tables exist:

Create file: `verify_system.js` in backend folder

```javascript
const { sequelize } = require("./src/config/db");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Check key tables
    const models = [
      "Resume",
      "ResumeAnalysis",
      "AssessmentAttempt",
      "AssessmentAnalysis",
      "InterviewAnalysis",
      "AIDecision",
      "TechnicalQuestionBank",
      "Application"
    ];

    for (const model of models) {
      const count = await sequelize.models[model].count();
      console.log(`✅ ${model}: ${count} records`);
    }

    console.log("\n✅ SYSTEM READY FOR DEMO");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
})();
```

Run it:
```bash
cd backend
node verify_system.js
```

**Expected Output:**
```
✅ Database connected
✅ Resume: X records
✅ ResumeAnalysis: X records
✅ AssessmentAttempt: X records
✅ AssessmentAnalysis: X records
✅ InterviewAnalysis: X records
✅ AIDecision: X records
✅ TechnicalQuestionBank: X+ records
✅ Application: X records

✅ SYSTEM READY FOR DEMO
```

---

## 🔍 STEP 5: API ENDPOINT TESTS (3 mins)

### Test 5a: Get All Questions
```bash
curl http://localhost:5000/api/questions
```
**Expected**: Returns list of theoretical questions ✅

### Test 5b: Get Job List
```bash
curl http://localhost:5000/api/jobs
```
**Expected**: Returns 4+ jobs ✅

### Test 5c: Get Candidates
```bash
curl http://localhost:5000/api/candidates
```
**Expected**: Returns candidate list ✅

---

## 🔍 STEP 6: SAMPLE DATA VERIFICATION (2 mins)

In browser console (F12), run:
```javascript
// Check if sample candidates exist
fetch('http://localhost:5000/api/candidates')
  .then(r => r.json())
  .then(data => console.log(`✅ ${data.length} candidates loaded`))
  .catch(e => console.error('❌ Error:', e));
```

**Expected**: "✅ X candidates loaded" appears in console  
**✅ If successful**: Sample data ready for demo  
**❌ If failed**: Check database seeding

---

## 🔍 STEP 7: UI RESPONSIVENESS (2 mins)

**Test these screens in browser** at `http://localhost:3000`:

| Screen | Check |
|--------|-------|
| Login Page | Loads quickly ✅ |
| Dashboard | Shows metrics ✅ |
| Candidates List | Shows candidates ✅ |
| Job Listings | Shows jobs ✅ |
| Resume Upload | File input works ✅ |
| Assessment View | Shows questions ✅ |
| Analytics | Shows charts ✅ |

---

## 📋 FINAL CHECKLIST

Before you start the demo:

- [ ] Backend running on port 5000 (`npm run dev`)
- [ ] AI service running on port 5000 (`python app.py` in ai_service folder)
- [ ] Frontend running on port 3000 (`npm run dev`)
- [ ] Database health check: ✅ Connected
- [ ] AI service health check: ✅ Operational
- [ ] Frontend loads: ✅ OK
- [ ] All 8 tables verified: ✅ OK
- [ ] API endpoints responding: ✅ OK
- [ ] Sample data available: ✅ OK
- [ ] UI responsive: ✅ OK
- [ ] Internet connection: ✅ Active (for Gemini API)
- [ ] Microphone/Audio ready: ✅ (if demo includes interview)

---

## 🎯 DEMO READINESS: 100%

All systems green! You're ready to demo to stakeholders.

---

## ⏱️ TIMING YOUR DEMO

| Time | Activity | System Load |
|------|----------|-------------|
| 0:00 | Start demo, login | Low |
| 0:30 | Show dashboard | Low |
| 1:00 | Upload resume | Low-Medium |
| 2:00 | Show analysis results | Medium |
| 2:30 | Start assessment | Medium |
| 3:30 | Submit assessment | High (AI analyzing) |
| 4:00 | Show scores | Medium |
| 4:30 | Show ranking | Low |
| 5:00 | Show funnel | Low |

**Tips**:
- Sample data is pre-loaded, demo is FAST
- AI analysis happens in real-time (a few seconds)
- No waiting needed - everything is cached
- Fallbacks active if any external API slow

---

## 🔧 TROUBLESHOOTING DURING DEMO

### Screen goes blank?
- **Check**: Browser console (F12) for errors
- **Fix**: Refresh page (Cmd/Ctrl + R)

### Slow response?
- **Check**: Is AI service running? (Port 5000)
- **Fix**: Restart both services

### Can't upload resume?
- **Check**: Is uploads folder writable?
- **Fix**: `mkdir backend/uploads` if missing

### Assessment not scoring?
- **Check**: Did Python service start correctly?
- **Fix**: Check Python logs for errors

### Decision score showing 0?
- **Check**: All component scores calculated?
- **Fix**: Verify resume_score, technical_score, interview_score are set

---

## 📞 EMERGENCY RESTART

If anything breaks during demo:

**Full System Restart** (stop everything):
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Then restart in order:
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd backend/ai_service && python app.py

# Terminal 3:
cd frontend && npm run dev

# Then run verification again
node verify_system.js
```

**Time needed**: 30 seconds  
**Data lost**: None (all safe in database)

---

## 📊 DEMO SUCCESS METRICS

**Your demo is successful when**:
- ✅ User can login
- ✅ Resume analysis shows extracted data
- ✅ Assessment questions display properly
- ✅ Scores calculate correctly
- ✅ Final ranking shows candidate decision
- ✅ Dashboard shows funnel
- ✅ No errors in console
- ✅ Stakeholders impressed! 🎉

---

## 🎬 PRACTICE RUN (Optional but recommended)

1. **Do a dry run** 1 hour before real demo
2. **Test all features** you plan to show
3. **Time your demo** (aim for 12-15 minutes)
4. **Check for slow responses** and adjust pacing
5. **Note any issues** and fix before stakeholder meeting

---

## ✅ YOU'RE READY!

**Status**: All green  
**Confidence**: 100%  
**Go time**: Now! 🚀

---

Generated: April 15, 2026  
System: AI-Powered Recruitment Platform v1.0
