# AI Service - Resume Parsing & Summary Generation

Complete Python-based AI service with Google Generative AI and deep learning for resume parsing, technical assessment analysis, interview evaluation, and intelligent summary generation.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Integration Guide](#integration-guide)
- [Performance & Optimization](#performance--optimization)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Resume Parsing & Analysis
- **AI-Powered Parsing**: Uses Google Generative AI (Gemini 2.0 Flash) for intelligent extraction
- **Skill Detection**: Categorizes skills (programming languages, frameworks, databases, cloud, DevOps, AI/ML, data tools, soft skills)
- **Education Extraction**: Identifies degrees, specializations, GPA, graduation year
- **Experience Analysis**: Extracts work history, positions, duration
- **Achievement Recognition**: Identifies key achievements and accomplishments
- **Certifications & Languages**: Detects certifications and languages
- **Resume Scoring**: Matches resume against job requirements
- **Intelligent Summaries**: Multi-perspective resume analysis (executive summary, professional overview, etc.)

### Technical Assessment Analysis
- **Coding Challenge Evaluation**: 
  - Correctness, code quality, efficiency scoring
  - Time & space complexity analysis
  - Problem-solving approach evaluation
  - Optimization suggestions
  
- **MCQ Test Analysis**:
  - Score calculation and performance metrics
  - Topic-wise strength/weakness analysis
  - Skill level estimation
  
- **System Design Evaluation**:
  - Architecture quality assessment
  - Scalability analysis
  - Reliability considerations
  - Design pattern identification
  
- **Case Study Analysis**:
  - Problem understanding evaluation
  - Analytical thinking assessment
  - Business acumen evaluation
  
- **Comprehensive Reporting**: Generates detailed assessment reports

### Interview Analysis & Evaluation
- **Transcript Analysis**: Parses and analyzes interview conversations
- **Answer Quality Assessment**: 
  - Relevance, completeness, clarity scoring
  - Confidence level detection
  - Follow-up question suggestions
  
- **Speaking Pattern Analysis**:
  - Pace, clarity, vocabulary level assessment
  - Hesitation and confidence indicators
  - Communication strengths/weaknesses
  
- **Performance Prediction**: Predicts on-job performance based on interview
- **Red & Green Flags**: Identifies potential concerns and positive indicators
- **Recommendation Generation**: Hire/reject/further rounds recommendation

### Summary Generation
- **Resume Summaries**: Executive summaries, professional overviews, career trajectories
- **Assessment Summaries**: Performance ratings, competency matrices, learning paths
- **Interview Summaries**: Comprehensive evaluation with scores and recommendations
- **Candidate Comparison**: Comparative analysis of multiple candidates
- **Custom Feedback**: Context-specific feedback generation

---

## 🏗️ Architecture

```
msK/backend/ai_service/
├── __init__.py                      # Package initialization
├── config.py                        # Configuration management
├── utils.py                         # Utility functions
├── ai_service.py                    # Main orchestrator
├── app.py                           # Flask API server
├── requirements.txt                 # Python dependencies
└── modules/
    ├── __init__.py
    ├── resume_parser.py             # Resume parsing with AI
    ├── summary_generator.py          # Summary generation
    ├── interview_analyzer.py         # Interview analysis
    └── assessment_analyzer.py        # Assessment analysis

msK/backend/src/
├── controllers/
│   ├── ai.controller.js             # Express controller
│   └── ... existing controllers
├── services/
│   ├── ai.service.js                # AI service client
│   └── ... existing services
├── routes/
│   ├── ai.routes.js                 # AI routes
│   └── ... existing routes
└── ... existing structure
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 16+ (for backend)
- Google API Key with Generative AI access
- PostgreSQL database

### Step 1: Setup Python Environment

```bash
cd backend/ai_service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### Step 2: Configuration

Create `.env` file in the backend directory:

```env
# Google Generative AI
GOOGLE_API_KEY=your_google_api_key_here
GENAI_MODEL=gemini-2.0-flash

# AI Service Configuration
AI_SERVICE_HOST=127.0.0.1
AI_SERVICE_PORT=5000
FLASK_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=msk_db
DB_USER=postgres
DB_PASSWORD=your_password

# File Upload
UPLOAD_FOLDER=../uploads
MAX_FILE_SIZE=52428800  # 50MB
AI_TEMPERATURE=0.7
MAX_TOKENS=2048

# Logging
LOG_LEVEL=INFO
LOG_FILE=ai_service.log

# Cache
CACHE_ENABLED=true
CACHE_TTL=3600
```

### Step 3: Install Node Dependencies

```bash
cd ..  # Go to backend root
npm install
```

Add to your Node backend `package.json` if using Express:

```json
{
  "dependencies": {
    "axios": "^1.13.2",
    "form-data": "^4.0.5"
  }
}
```

### Step 4: Run AI Service

```bash
cd ai_service
python app.py
```

The service will start on `http://localhost:5000`

### Step 5: Integrate with Node Backend

In your Express server setup (e.g., `src/server.js` or `src/app.js`):

```javascript
const aiRoutes = require('./routes/ai.routes');

// Add AI routes to your Express app
app.use('/api/ai', aiRoutes);
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | - | Google API key for Generative AI |
| `GENAI_MODEL` | `gemini-2.0-flash` | AI model to use |
| `AI_SERVICE_HOST` | `127.0.0.1` | Flask server host |
| `AI_SERVICE_PORT` | `5000` | Flask server port |
| `FLASK_ENV` | `development` | Environment |
| `DB_*` | - | Database connection details |
| `UPLOAD_FOLDER` | `../uploads` | File upload directory |
| `MAX_FILE_SIZE` | `52428800` | Maximum upload size (bytes) |
| `AI_TEMPERATURE` | `0.7` | AI response creativity (0-1) |
| `MAX_TOKENS` | `2048` | Maximum response tokens |
| `LOG_LEVEL` | `INFO` | Logging level |
| `CACHE_ENABLED` | `true` | Enable response caching |
| `CACHE_TTL` | `3600` | Cache time-to-live (seconds) |

### Model Configuration

The system uses:
- **Google Generative AI**: `gemini-2.0-flash` for NLP tasks
- **spaCy**: `en_core_web_sm` for entity recognition
- **Transformers**: Optional for advanced NLP tasks

---

## 📚 API Documentation

### Base URLs

**Python AI Service**: `http://localhost:5000`

**Node.js Backend**: `http://localhost:3000/api/ai`

---

### Resume Endpoints

#### Parse Resume
**POST** `/api/resume/parse` (Node.js) or `/api/resume/parse` (Python)

Parse and analyze resume file.

**Request (Node.js)**:
```javascript
const formData = new FormData();
formData.append('file', resumeFile);
formData.append('candidateId', '123');

POST /api/ai/resume/parse
```

**Response**:
```json
{
  "success": true,
  "data": {
    "contact_info": {
      "email": "candidate@example.com",
      "phone": "+1234567890",
      "name": "John Doe"
    },
    "education": [{
      "degree": "B.Tech",
      "specialization": "Computer Science",
      "cgpa": 8.5,
      "year_of_passout": 2020
    }],
    "experience": [{
      "position": "Senior Software Engineer",
      "duration_years": 5
    }],
    "skills": {
      "programming_languages": ["Python", "JavaScript", "Java"],
      "web_frameworks": ["React", "Django", "FastAPI"],
      "databases": ["PostgreSQL", "MongoDB"],
      "ai_ml": ["Machine Learning", "Deep Learning", "TensorFlow"],
      "cloud_platforms": ["AWS", "Google Cloud"]
    },
    "certifications": ["AWS Solutions Architect", "Kubernetes CKA"],
    "languages": ["English", "Hindi"],
    "key_achievements": ["Led team of 5 engineers", "Increased performance by 40%"],
    "ai_summary": {
      "executive_summary": "Experienced software engineer with 5+ years...",
      "professional_overview": "...",
      "key_strengths": ["Leadership", "Problem Solving", "Technical Depth"],
      "career_trajectory": "...",
      "recommended_roles": ["Senior Developer", "Tech Lead", "Engineering Manager"],
      "growth_potential": "..."
    }
  }
}
```

---

#### Score Resume
**POST** `/api/resume/score`

Score resume against job requirements.

**Request**:
```json
{
  "parsed_resume": { /* parsed resume object */ },
  "job_requirements": "Looking for 5+ years experience with Python, React, and AWS..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "skills_match_percentage": 85,
    "experience_match_percentage": 75,
    "overall_fit_percentage": 80,
    "matched_skills": ["Python", "React", "AWS"],
    "missing_skills": ["Kubernetes", "GraphQL"],
    "rating": "excellent"
  }
}
```

---

#### Generate Resume Summary
**POST** `/api/resume/summary`

Generate comprehensive resume summary.

**Request**:
```json
{
  "parsed_resume": { /* parsed resume object */ }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "executive_summary": "Highly skilled software engineer...",
    "professional_overview": "...",
    "key_strengths": ["Full-stack development", "System design", "Team leadership"],
    "career_trajectory": "...",
    "technical_proficiency": {
      "level": "expert",
      "areas": ["Backend", "DevOps", "AI/ML"]
    },
    "leadership_qualities": ["Decision making", "Problem solving"],
    "learning_agility": "Quickly masters new technologies",
    "recommended_roles": ["Tech Lead", "Principal Engineer"],
    "growth_potential": "High potential for leadership roles"
  }
}
```

---

### Assessment Endpoints

#### Analyze Coding Solution
**POST** `/api/assessment/coding`

Analyze coding solution for correctness, quality, and efficiency.

**Request**:
```json
{
  "code": "function fibonacci(n) { ... }",
  "problem": "Write function to calculate nth Fibonacci number with O(n) complexity"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "correctness_score": 95,
    "code_quality_score": 85,
    "efficiency_score": 90,
    "overall_score": 90,
    "time_complexity": "O(n)",
    "space_complexity": "O(1)",
    "strengths": ["Clean code structure", "Good variable naming"],
    "weaknesses": ["Could add more comments"],
    "optimizations": ["Could use memoization"],
    "skill_level": "senior",
    "estimated_experience_years": 5
  }
}
```

---

#### Analyze MCQ Test
**POST** `/api/assessment/mcq`

Analyze MCQ responses.

**Request**:
```json
{
  "questions": [
    {
      "id": 1,
      "text": "What is Python?",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "A"
    }
  ],
  "answers": ["A", "C", "B"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "score_percentage": 75,
    "correct_answers": 9,
    "total_questions": 12,
    "performance_level": "good",
    "topics_strengths": ["Python Basics", "OOP"],
    "topics_weaknesses": ["Advanced Concurrency"],
    "estimated_skill_level": "mid_level",
    "learning_recommendations": ["Study advanced concurrency patterns"],
    "study_plan": ["Threading", "Async/Await", "Multiprocessing"]
  }
}
```

---

#### Analyze System Design
**POST** `/api/assessment/design`

Analyze system design solution.

**Request**:
```json
{
  "design": "Database indexed with...",
  "requirements": "Build a real-time notification system..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "requirements_coverage": 90,
    "architecture_quality": 85,
    "scalability_score": 80,
    "reliability_score": 85,
    "overall_score": 85,
    "design_patterns_used": ["Observer", "Pub-Sub"],
    "strengths": ["Good scalability design"],
    "weaknesses": ["Limited disaster recovery"],
    "potential_bottlenecks": ["Database write lock"],
    "improvements": ["Add caching layer"],
    "estimated_seniority": "senior"
  }
}
```

---

#### Analyze Case Study
**POST** `/api/assessment/case-study`

Analyze case study response.

**Request**:
```json
{
  "case": "Your company needs to reduce operational costs...",
  "solution": "The best approach would be..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "problem_understanding": 85,
    "analytical_thinking": 80,
    "solution_quality": 75,
    "business_acumen": 80,
    "overall_score": 80,
    "strengths": ["Clear problem statement", "Practical solutions"],
    "areas_for_improvement": ["Risk analysis"],
    "estimated_experience_level": "mid"
  }
}
```

---

### Interview Endpoints

#### Analyze Interview
**POST** `/api/interview/analyze`

Analyze complete interview session.

**Request**:
```json
{
  "transcript": "Interviewer: Tell me about yourself...\nCandidate: I'm an engineer with...",
  "details": {
    "type": "technical",
    "duration_minutes": 60,
    "role": "Senior Software Engineer"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "qa_analyses": [
      {
        "relevance_score": 85,
        "completeness_score": 90,
        "clarity_score": 88,
        "confidence_level": "high",
        "rating": "excellent"
      }
    ],
    "overall_assessment": {
      "overall_score": 85,
      "hire_recommendation": "strong_yes",
      "confidence_level": 90
    },
    "red_flags": [],
    "green_flags": ["Clear examples", "Growth mindset"],
    "recommendation": "strong_yes"
  }
}
```

---

#### Analyze Interview Answer
**POST** `/api/interview/answer`

Analyze single interview answer.

**Request**:
```json
{
  "question": "Design a cache system...",
  "answer": "I would use a LRU cache with..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "relevance_score": 90,
    "completeness_score": 85,
    "clarity_score": 88,
    "confidence_level": "high",
    "strengths": ["Structured thinking", "Good examples"],
    "weaknesses": ["Could mention edge cases"],
    "follow_up_suggestion": "How would you handle cache invalidation?",
    "rating": "excellent"
  }
}
```

---

#### Predict Interview Performance
**POST** `/api/interview/performance-prediction`

Predict on-job performance.

**Request**:
```json
{
  "technical_knowledge_score": 85,
  "communication_score": 80,
  "problem_solving_score": 90
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "predicted_performance": "high",
    "confidence_percentage": 85,
    "time_to_productivity": "2",
    "likely_strengths_in_role": ["Problem solving", "Learning"],
    "potential_challenges": ["Mentoring junior developers"],
    "retention_probability_percentage": 85,
    "growth_trajectory": "fast"
  }
}
```

---

#### Analyze Speaking Patterns
**POST** `/api/interview/speaking-patterns`

Analyze candidate's speaking patterns.

**Request**:
```json
{
  "transcript": "..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "pace": "normal",
    "clarity": "very_clear",
    "vocabulary_level": "advanced",
    "use_of_examples": "frequent",
    "hesitation_level": "low",
    "confidence_indicators": ["Decisive tone", "Clear transitions"],
    "communication_strengths": ["Well-articulated", "Good structure"],
    "communication_weaknesses": []
  }
}
```

---

### Comparison & Feedback Endpoints

#### Compare Candidates
**POST** `/api/candidates/compare`

Compare multiple candidates.

**Request**:
```json
{
  "candidates": [
    { "name": "Candidate A", "scores": { /* ... */ } },
    { "name": "Candidate B", "scores": { /* ... */ } }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "comparison_summary": "Candidate A is stronger in technical skills...",
    "ranked_candidates": [
      {
        "rank": 1,
        "name": "Candidate A",
        "score": 88,
        "reason": "Excellent technical skills and leadership"
      }
    ],
    "best_for_role": {
      "name": "Candidate A",
      "fit_percentage": 90
    }
  }
}
```

---

#### Generate Feedback
**POST** `/api/feedback/generate`

Generate context-specific feedback.

**Request**:
```json
{
  "context": "Candidate showed good problem solving but weak communication",
  "type": "interview"
}
```

**Response**:
```json
{
  "success": true,
  "data": "Based on your interview performance, you demonstrated strong technical depth... Your communication could improve by..."
}
```

---

### Metadata Endpoints

#### Health Check
**GET** `/health` or `/api/ai/health`

Check service health.

**Response**:
```json
{
  "status": "healthy",
  "service": "AI Service",
  "modules": {
    "resume_parser": "active",
    "summary_generator": "active",
    "interview_analyzer": "active",
    "assessment_analyzer": "active"
  }
}
```

---

#### Get Capabilities
**GET** `/capabilities` or `/api/ai/capabilities`

Get available service capabilities.

**Response**:
```json
{
  "resume": ["parse_resume", "score_resume", "..."],
  "assessment": ["analyze_coding_challenge", "..."],
  "interview": ["analyze_interview", "..."],
  "summary": ["generate_resume_summary", "..."]
}
```

---

## 💻 Usage Examples

### Python/Direct Usage

```python
from ai_service import get_ai_service

# Initialize service
ai = get_ai_service()

# Parse resume
parsed = ai.parse_resume('path/to/resume.pdf')

# Generate summary
summary = ai.generate_resume_summary(parsed)
print(summary['executive_summary'])

# Score against job requirements
score = ai.score_resume(parsed, "5+ years Python, React, AWS...")
print(f"Overall fit: {score['overall_fit_percentage']}%")

# Analyze coding challenge
code_analysis = ai.analyze_coding_challenge(
    code="def solution(n): return n * 2",
    problem_description="Write a function that doubles the input"
)
print(f"Code quality: {code_analysis['code_quality_score']}/100")

# Analyze interview
interview = ai.analyze_interview(
    transcript="Q: Tell me about yourself... A: I have 5 years...",
    interview_details={'type': 'technical'}
)
print(f"Interview score: {interview['overall_assessment']['overall_score']}")
```

---

### Node.js/Express Usage

```javascript
const aiService = require('./services/ai.service');

// Parse resume
const parsed = await aiService.parseResumeWithAI('path/to/resume.pdf');

// Score resume
const score = await aiService.scoreResume(parsed, jobRequirements);

// Analyze coding
const codeAnalysis = await aiService.analyzeCodingSolution(
  code,
  problemDescription
);

// Analyze interview
const interview = await aiService.analyzeInterview(
  transcript,
  { type: 'technical' }
);

// Compare candidates
const comparison = await aiService.compareCandidates([
  { name: 'Candidate A', score: 85 },
  { name: 'Candidate B', score: 78 }
]);
```

---

### API Client Usage

```javascript
// JavaScript Fetch API
const parseResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('candidateId', '123');

  const response = await fetch('/api/ai/resume/parse', {
    method: 'POST',
    body: formData
  });

  return await response.json();
};

// cURL
curl -F "file=@resume.pdf" \
     -H "Authorization: Bearer token" \
     "http://localhost:3000/api/ai/resume/parse"

// Axios
const response = await axios.post('/api/ai/assessment/coding', {
  code: 'function solve() {}',
  problem: 'Problem description...'
});
```

---

## 🔌 Integration Guide

### 1. Mount Routes in Express App

```javascript
// src/app.js or src/server.js
const aiRoutes = require('./routes/ai.routes');

app.use('/api/ai', aiRoutes);
```

---

### 2. Update Resume Controller

Replace existing resume parsing with AI:

```javascript
// src/controllers/resume.controller.js
const aiService = require('../services/ai.service');

exports.uploadResume = async (req, res) => {
  try {
    // Use AI service
    const parsed = await aiService.parseResumeWithAI(req.file.path);
    const summary = await aiService.generateResumeSummary(parsed);

    // Save to database
    const resume = await Resume.create({
      candidateId: req.user.id,
      file_path: req.file.path,
      parsed_data: parsed,
      ai_summary: summary
    });

    res.json({ success: true, data: resume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

### 3. Integrate in Candidate Dashboard

```javascript
// components/candidate/ResumeUpload.tsx
const [parsed, setParsed] = useState(null);

const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/ai/resume/parse', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  setParsed(data.data);
};
```

---

### 4. Add to Assessment Pipeline

```javascript
// In assessment submission controller
const assessmentAnalysis = await aiService.analyzeAssessment({
  type: 'coding',
  code: submittedCode,
  problem: assessmentDetails.problem
});

// Save analysis with submission
await AssessmentSubmission.update({
  assessment_results: assessmentAnalysis
}, { where: { id: submissionId } });
```

---

### 5. Interview Analysis Integration

```javascript
// After interview recording/transcript generation
const interviewAnalysis = await aiService.analyzeInterview(
  transcript,
  { role: jobRole, duration: duration_minutes }
);

// Store and display results
const interview = await Interview.create({
  candidateId,
  transcript,
  analysis: interviewAnalysis,
  recommendation: interviewAnalysis.overall_assessment.hire_recommendation
});
```

---

## 📊 Performance & Optimization

### Response Times

```
Resume Parsing: ~2-5 seconds
Resume Scoring: ~3-4 seconds
MCQ Analysis: ~1-2 seconds
Code Analysis: ~3-6 seconds
Interview Analysis: ~4-8 seconds (depends on length)
```

### Optimization Tips

1. **Enable Caching**: Set `CACHE_ENABLED=true` in .env
2. **Batch Requests**: Send multiple analyses together
3. **Async Processing**: Use background jobs for heavy operations
4. **Model Loading**: Models load once on service start
5. **File Size**: Keep files under 50MB max

### Scaling

For production:
- Use process manager (PM2, systemd)
- Deploy multiple Python instances
- Use load balancer (nginx)
- Add Redis for caching
- Consider async task queue (Celery)

---

## 🔧 Troubleshooting

### Common Issues

**1. "GOOGLE_API_KEY not set"**
```bash
# Check .env file exists and is in correct location
export GOOGLE_API_KEY=your_key
# or in .env
GOOGLE_API_KEY=your_key
```

**2. "Module 'spacy' not found"**
```bash
pip install spacy
python -m spacy download en_core_web_sm
```

**3. "Connection refused" (AI Service down)**
```bash
# Check if AI service is running
curl http://localhost:5000/health

# Restart AI service
python app.py
```

**4. "File too large"**
```bash
# Increase MAX_FILE_SIZE in .env
MAX_FILE_SIZE=104857600  # 100MB
```

**5. "PDF parsing issues"**
```bash
# Try alternative PDF backends
pip install pdfplumber pdf2image pytesseract
```

### Debugging

Enable verbose logging:
```python
# In config.py or .env
LOG_LEVEL=DEBUG
```

Check logs:
```bash
tail -f ai_service.log
```

---

## 📝 Development & Contribution

### Running Tests

```bash
# Unit tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=ai_service
```

### Code Quality

```bash
# Format code
black .

# Lint
pylint modules/

# Type checking
mypy .
```

---

## 📄 License

MIT License - See LICENSE file

---

## 🤝 Support

For issues, questions, or suggestions:
- Create GitHub issue
- Email: support@example.com
- Documentation: https://docs.example.com/ai-service

---

**Last Updated**: April 2026  
**Version**: 1.0.0
