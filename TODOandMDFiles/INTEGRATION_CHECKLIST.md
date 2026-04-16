# AI Service Integration Checklist

Complete checklist for integrating the AI service into your project.

## ✅ Pre-Integration Checklist

- [ ] Python 3.9+ installed
- [ ] Node.js 16+ installed
- [ ] PostgreSQL database set up
- [ ] Google API key obtained (from [makersuite.google.com](https://makersuite.google.com/app/apikey))
- [ ] Repository cloned/available
- [ ] Terminal/command line access

## 📦 Installation & Setup

### Python Environment
- [ ] Created virtual environment in `backend/ai_service/`
- [ ] Activated virtual environment
- [ ] Installed dependencies: `pip install -r requirements.txt`
- [ ] Downloaded spaCy model: `python -m spacy download en_core_web_sm`
- [ ] Verified installation: `python -c "import google.genai; print('OK')"`

### Environment Configuration
- [ ] Copied `.env.example` to `backend/.env`
- [ ] Set `GOOGLE_API_KEY` in `.env`
- [ ] Configured `DB_*` variables for database connection
- [ ] Set other required variables (AI_SERVICE_PORT, UPLOAD_FOLDER, etc.)
- [ ] Verified `.env` file is in correct location

### Node.js Setup
- [ ] Installed Node dependencies: `npm install`
- [ ] Added `axios` and `form-data` to package.json
- [ ] Verified npm dependencies installed

## 🚀 Service Startup

- [ ] Started AI Service: `python app.py` in ai_service/ directory
- [ ] Verified AI Service health: `curl http://localhost:5000/health` ✅
- [ ] Started Node.js server: `npm run dev`
- [ ] Verified Node.js running on port 3000
- [ ] Checked no port conflicts

## 📁 File Integration

### Python AI Service Files
- [ ] `backend/ai_service/__init__.py` ✅
- [ ] `backend/ai_service/config.py` ✅
- [ ] `backend/ai_service/utils.py` ✅
- [ ] `backend/ai_service/ai_service.py` ✅
- [ ] `backend/ai_service/app.py` ✅
- [ ] `backend/ai_service/requirements.txt` ✅
- [ ] `backend/ai_service/modules/resume_parser.py` ✅
- [ ] `backend/ai_service/modules/summary_generator.py` ✅
- [ ] `backend/ai_service/modules/interview_analyzer.py` ✅
- [ ] `backend/ai_service/modules/assessment_analyzer.py` ✅
- [ ] `backend/ai_service/modules/__init__.py` ✅

### Node.js Integration Files
- [ ] `backend/src/services/ai.service.js` ✅
- [ ] `backend/src/controllers/ai.controller.js` ✅
- [ ] `backend/src/routes/ai.routes.js` ✅

### Documentation Files
- [ ] `backend/AI_SERVICE_README.md` ✅
- [ ] `SETUP_GUIDE.md` ✅
- [ ] `.env.example` ✅ (copy to `.env`)

## 🔌 Route Integration

### Express App Setup
- [ ] Located main server file (`src/server.js` or `src/app.js`)
- [ ] Added AI routes to Express app:
  ```javascript
  const aiRoutes = require('./routes/ai.routes');
  app.use('/api/ai', aiRoutes);
  ```
- [ ] Verified routes load without errors
- [ ] Tested with `curl http://localhost:3000/api/ai/health`

### Database Models (if needed)
- [ ] Created/updated Resume model to include `ai_analysis` field
- [ ] Created/updated Assessment model for storing analysis results
- [ ] Created/updated Interview model for interview data
- [ ] Ran migrations: `npm run migrate` or `sequelize db:migrate`

## 🧪 API Testing

### Health & Status
- [ ] Test AI Service: `GET http://localhost:5000/health`
- [ ] Test Node Gateway: `GET http://localhost:3000/api/ai/health`
- [ ] Get Capabilities: `GET http://localhost:3000/api/ai/capabilities`

### Resume APIs
- [ ] Test Resume Parse: Upload PDF file
  ```bash
  curl -F "file=@sample.pdf" \
    -H "Authorization: Bearer your_token" \
    http://localhost:3000/api/ai/resume/parse
  ```
- [ ] Test Resume Score: POST with parsed resume and job requirements
- [ ] Test Resume Summary: Generate summary of parsed resume

### Assessment APIs
- [ ] Test Coding Analysis: Submit code and problem
- [ ] Test MCQ Analysis: Submit questions and answers
- [ ] Test Design Analysis: Submit system design
- [ ] Test Case Study Analysis: Submit case and solution
- [ ] Test Report Generation: Generate full assessment report

### Interview APIs
- [ ] Test Interview Analysis: Submit transcript
- [ ] Test Answer Analysis: Analyze single answer
- [ ] Test Performance Prediction: Predict on-job performance
- [ ] Test Speaking Patterns: Analyze speaking patterns

### Comparison & Feedback
- [ ] Test Candidate Comparison: Compare multiple candidates
- [ ] Test Feedback Generation: Generate feedback for context

## 📊 UI/Controller Updates

### Resume Upload Controller
- [ ] Updated `resumeController.uploadResume()` to use AI service
- [ ] Stores AI analysis in database
- [ ] Returns enriched resume data in response

### Assessment Controller
- [ ] Updated to call AI assessment endpoints
- [ ] Stores analysis results with submission
- [ ] Displays scores and feedback to candidate

### Interview Controller
- [ ] Integrated interview analysis
- [ ] Stores interview analysis with interview record
- [ ] Shows recommendations to hiring team

### Candidate Comparison
- [ ] Added endpoint to compare multiple candidates
- [ ] Displays ranking and comparison results
- [ ] Shows recommendation for best fit

## 🎨 Frontend Integration (Optional)

### Resume Upload
- [ ] Created resume upload component
- [ ] Added file validation
- [ ] Shows parsing progress
- [ ] Displays AI-generated summary

### Assessment Results
- [ ] Shows code quality score
- [ ] Displays skills match analysis
- [ ] Shows recommendations

### Interview Feedback
- [ ] Displays interview score
- [ ] Shows red/green flags
- [ ] Provides detailed feedback

### Candidate Dashboard
- [ ] Shows all assessments with scores
- [ ] Displays AI summaries
- [ ] Shows hiring recommendations

## 🔐 Security & Authentication

- [ ] Verified all AI endpoints require authentication (`isAuthenticated` middleware)
- [ ] Set appropriate access controls for each endpoint
- [ ] Ensured JWT tokens are validated
- [ ] Configured CORS if frontend is separate domain
- [ ] Sanitized all user inputs

## 📈 Performance Verification

- [ ] Resume parsing completes in < 5 seconds
- [ ] Assessment analysis completes in < 10 seconds
- [ ] Interview analysis completes in reasonable time
- [ ] No timeout errors in logs
- [ ] Database queries are optimized
- [ ] File uploads handle large files (up to 50MB)

## 🛡️ Error Handling

- [ ] Added try-catch in all controllers
- [ ] Return appropriate HTTP status codes
- [ ] Log errors to file
- [ ] User-friendly error messages
- [ ] No sensitive data in error responses
- [ ] Graceful fallbacks if AI service is unavailable

## 📚 Documentation

- [ ] README updated with AI features
- [ ] API documentation generated/reviewed
- [ ] Setup guide completed
- [ ] Environment variables documented
- [ ] Integration examples provided
- [ ] Troubleshooting guide available

## 🚀 Going Live

### Production Checklist
- [ ] Environment set to `production`
- [ ] Debug mode disabled
- [ ] Logging configured appropriately
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] API rate limiting configured
- [ ] Database backups configured
- [ ] SSL/HTTPS enabled
- [ ] Load testing completed

### Deployment
- [ ] Python service deployed (systemd, Docker, etc.)
- [ ] Node.js app deployed
- [ ] Environment variables set in production
- [ ] Database migrations run
- [ ] Health checks passing
- [ ] Monitoring/alerts configured
- [ ] Rollback procedures documented

## 📞 Post-Integration

- [ ] Monitor logs for errors
- [ ] Track API response times
- [ ] Monitor error rates
- [ ] Get user feedback
- [ ] Plan improvements
- [ ] Document any issues found
- [ ] Version control all changes

---

## 📋 Quick Reference

### Port Requirements
- Python AI Service: **5000** (configurable in .env)
- Node.js Backend: **3000** (configurable in .env)
- PostgreSQL: **5432** (default)

### Key Endpoints
```
Health: GET /api/ai/health
Parse Resume: POST /api/ai/resume/parse
Score Resume: POST /api/ai/resume/score
Analyze Code: POST /api/ai/assessment/coding
Analyze Interview: POST /api/ai/interview/analyze
Compare Candidates: POST /api/ai/candidates/compare
```

### Default Credentials
- **Database**: postgres @ localhost:5432
- **AI Model**: gemini-2.0-flash
- **Timeout**: 30 seconds

### Useful Commands
```bash
# Start AI Service
cd backend/ai_service && python app.py

# Start Node.js
cd backend && npm run dev

# Check AI Service health
curl http://localhost:5000/health

# Check Node.js health
curl http://localhost:3000/api/ai/health

# View logs
tail -f ai_service.log

# Test with sample
curl -F "file=@resume.pdf" \
  -H "Authorization: Bearer token" \
  http://localhost:3000/api/ai/resume/parse
```

---

## ✨ Integration Complete!

Once all items are checked, your AI-powered recruitment system is fully integrated and ready for use.

**Estimated Time for Full Integration**: 1-2 hours

For issues, refer to AI_SERVICE_README.md or SETUP_GUIDE.md
