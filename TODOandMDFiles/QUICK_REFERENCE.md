# AI Service Quick Reference Guide

## 🚀 Quick Start (Copy-Paste Ready)

### 1. Environment Setup
```bash
# Copy template
cp .env.example .env

# Edit .env with:
# GOOGLE_API_KEY=your_key_here
# GENAI_MODEL=gemini-2.0-flash
```

### 2. Install & Run
```bash
# Terminal 1 - AI Service
cd backend/ai_service
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python app.py

# Terminal 2 - Node.js Backend
cd backend
npm install
npm run dev
```

### 3. Verify
```bash
# Health check
curl http://localhost:5000/health
curl http://localhost:3000/api/ai/health
```

---

## 📝 Common Operations

### Parse Resume
```javascript
// Node.js/Frontend
const formData = new FormData();
formData.append('file', resumeFile);
formData.append('candidateId', '123');

const response = await fetch('/api/ai/resume/parse', {
  method: 'POST',
  body: formData,
  headers: { 'Authorization': 'Bearer token' }
});

const data = await response.json();
console.log(data.data.skills);  // Extracted skills
console.log(data.data.ai_summary);  // AI summary
```

### Score Resume
```javascript
const response = await fetch('/api/ai/resume/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    parsed_resume: resumeData,
    job_requirements: "5+ years Python, React..."
  })
});
```

### Analyze Code
```javascript
const response = await fetch('/api/ai/assessment/coding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: userSubmittedCode,
    problem: "Write function to calculate Fibonacci..."
  })
});
```

### Analyze Interview
```javascript
const response = await fetch('/api/ai/interview/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    transcript: "Q: Tell me about yourself\nA: I'm a...",
    details: { type: 'technical', role: 'Senior Developer' }
  })
});
```

---

## 🔄 Integration Points

### 1. Resume Upload Handler
```javascript
// backend/src/controllers/resume.controller.js
const aiService = require('../services/ai.service');

exports.uploadResume = async (req, res) => {
  const parsed = await aiService.parseResumeWithAI(req.file.path);
  const summary = await aiService.generateResumeSummary(parsed);
  
  await Resume.create({
    candidateId: req.user.id,
    parsed_data: parsed,
    ai_summary: summary
  });
};
```

### 2. Assessment Analyzer
```javascript
// In assessment submission controller
const analysis = await aiService.analyzeCodingSolution(code, problem);

await AssessmentSubmission.update({
  analysis: analysis,
  score: analysis.overall_score
}, { where: { id } });
```

### 3. Interview Evaluator
```javascript
// After transcript generation
const evaluation = await aiService.analyzeInterview(transcript);

await Interview.create({
  candidateId,
  evaluation,
  recommendation: evaluation.overall_assessment.hire_recommendation
});
```

---

## 📊 Data Structures

### Parsed Resume
```json
{
  "contact_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "education": [{
    "degree": "B.Tech",
    "specialization": "Computer Science",
    "cgpa": 8.5,
    "year_of_passout": 2020
  }],
  "experience": [{
    "position": "Senior Engineer",
    "duration_years": 5
  }],
  "skills": {
    "programming_languages": ["Python", "JavaScript"],
    "web_frameworks": ["React", "Django"],
    "databases": ["PostgreSQL"],
    "ai_ml": ["TensorFlow"]
  },
  "ai_summary": {
    "executive_summary": "...",
    "key_strengths": ["..."],
    "recommended_roles": ["..."]
  }
}
```

### Assessment Analysis
```json
{
  "correctness_score": 95,
  "code_quality_score": 85,
  "efficiency_score": 90,
  "overall_score": 90,
  "time_complexity": "O(n)",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "skill_level": "senior"
}
```

### Interview Analysis
```json
{
  "overall_score": 85,
  "communication_score": 80,
  "technical_knowledge_score": 90,
  "problem_solving_score": 85,
  "red_flags": [],
  "green_flags": ["Clear examples", "Growth mindset"],
  "recommendation": "strong_yes"
}
```

---

## 🔑 Key Environment Variables

```bash
# Required
GOOGLE_API_KEY=your_key

# Optional (Defaults shown)
GENAI_MODEL=gemini-2.0-flash
AI_SERVICE_PORT=5000
AI_TEMPERATURE=0.7
MAX_TOKENS=2048
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=52428800
```

---

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| "GOOGLE_API_KEY not found" | Add to `.env` file in backend/ directory |
| "module not found" | Activate venv and `pip install -r requirements.txt` |
| "Connection refused" | Start Python AI service on port 5000 |
| Port already in use | Change port in `.env`: `AI_SERVICE_PORT=5001` |
| PDF parsing fails | Install: `pip install pdfplumber` |

---

## 📞 Support Resources

- **Full Documentation**: [AI_SERVICE_README.md](AI_SERVICE_README.md)
- **Setup Guide**: [SETUP_GUIDE.md](../SETUP_GUIDE.md)
- **Integration Checklist**: [INTEGRATION_CHECKLIST.md](../INTEGRATION_CHECKLIST.md)
- **API Examples**: Included in AI_SERVICE_README.md (#API Documentation)

---

## ✨ Pro Tips

1. **Enable Caching**: Set `CACHE_ENABLED=true` for faster responses
2. **Batch Requests**: Send multiple analyses together
3. **Monitor Logs**: `tail -f ai_service.log` for debugging
4. **Use Postman**: Import endpoints for easy testing
5. **Rate Limit**: Add middleware if needed: `npm install express-rate-limit`

---

## 🎯 Common Workflows

### Hiring Workflow
```
1. Candidate submits resume
   → Parse with AI
   → Generate summary
   → Score against job
   → Store analysis

2. Candidate takes assessments
   → Analyze coding/MCQ/design
   → Generate report
   → Show score to candidate

3. Candidate interviews
   → Analyze transcript
   → Predict performance
   → Make recommendation
   → Compare with other candidates
```

### Data Flow
```
User Input → Express API → AI Service → Google GenAI → Analysis → Database → Response
```

---

## 📈 Performance Expectations

- Parse resume: ~3 seconds
- Analyze assessment: ~4 seconds
- Analyze interview: ~6 seconds
- Generate summary: ~2 seconds
- Compare candidates: ~5 seconds

---

## 🔐 Security Checklist

- [ ] `.env` file with secrets (not in git)
- [ ] Authentication on all endpoints
- [ ] File upload validation (size, type)
- [ ] Input sanitization
- [ ] Error messages don't leak data
- [ ] HTTPS in production
- [ ] Rate limiting configured
- [ ] Database backups enabled

---

**Keep this guide handy for daily development! 📌**
