# AI Platform Integration Guide

This document provides step-by-step instructions for integrating the comprehensive AI recruitment system into your existing MSK platform.

## Overview

The AI platform consists of:
- **7 React/Next.js Components** for different roles
- **4 Database Models** for storing AI analysis results
- **1 Python AI Service** (Flask) with 4 analyzer modules
- **1 Node.js Controller** with auto-rejection engine
- **1 RBAC Middleware** for authorization
- **Complete Routes** for all AI endpoints

## Component Architecture

### Frontend Components

1. **ResumeAnalysisPanel.tsx**
   - Resume upload, parsing, and JD matching
   - Skills breakdown visualization
   - Experience timeline display
   - **Target Page**: `/hr/candidates/[id]` or `/admin/applications/[id]`

2. **AssessmentAnalysisPanel.tsx**
   - Multi-tab assessment analyzer (Coding, MCQ, Design, Case Study)
   - Performance metrics and skill level assessment
   - **Target Page**: `/hr/applications/[id]/assessment` or `/admin/assessments/[id]`

3. **InterviewAnalysisPanel.tsx**
   - Interview transcript analysis
   - Speaking patterns evaluation
   - Performance prediction
   - **Target Page**: `/hr/applications/[id]/interview` or `/admin/interviews/[id]`

4. **AIDecisionPanel.tsx**
   - Final score aggregation
   - Auto-rejection status display
   - Hiring recommendation
   - **Target Page**: `/hr/applications/[id]/decision` or `/admin/decisions/[id]`

5. **CandidateComparisonPanel.tsx**
   - Side-by-side candidate ranking
   - Multi-metric comparison (scores, skills, experience)
   - Decision breakdown
   - **Target Page**: `/hr/jobs/[jobId]/ranking` or `/admin/jobs/[jobId]/candidates`

6. **MDAnalyticsPanel.tsx**
   - Department-wide analytics
   - Score distribution, timeline trends
   - Skill level analysis
   - **Target Page**: `/md/analytics` or `/md/dashboard`

7. **AdminAIPanel.tsx**
   - System health monitoring
   - AI model selection (Gemini 2.0 vs 1.5)
   - Configuration management
   - Audit logging
   - **Target Page**: `/admin/settings/ai` or `/admin/ai-config`

## Database Setup

### Step 1: Create New Models

Add these 4 models to `backend/src/models/`:

**Models Already Created:**
- `resumeAnalysis.js` - Resume parsing results
- `assessmentAnalysis.js` - Assessment scores and analysis
- `interviewAnalysis.js` - Interview evaluation data
- `aiDecision.js` - Final AI decision with auto-rejection status

### Step 2: Update Database Initialization

**File**: `backend/src/config/db.js`

Add to the Sequelize model initialization:

```javascript
const resumeAnalysis = require('./models/resumeAnalysis');
const assessmentAnalysis = require('./models/assessmentAnalysis');
const interviewAnalysis = require('./models/interviewAnalysis');
const aiDecision = require('./models/aiDecision');

// In db.sequelize.sync() or migration:
db.resumeAnalysis = resumeAnalysis(db.sequelize, Sequelize.DataTypes);
db.assessmentAnalysis = assessmentAnalysis(db.sequelize, Sequelize.DataTypes);
db.interviewAnalysis = interviewAnalysis(db.sequelize, Sequelize.DataTypes);
db.aiDecision = aiDecision(db.sequelize, Sequelize.DataTypes);

// Set up associations
db.Application.hasMany(db.resumeAnalysis, { foreignKey: 'application_id' });
db.Application.hasMany(db.assessmentAnalysis, { foreignKey: 'application_id' });
db.Application.hasMany(db.interviewAnalysis, { foreignKey: 'application_id' });
db.Application.hasMany(db.aiDecision, { foreignKey: 'application_id' });
```

### Step 3: Run Database Migrations

```bash
cd backend
npx sequelize-cli db:migrate
# Or if using custom migration:
npm run migrate
```

## Backend Setup

### Step 1: Add RBAC Middleware

**File**: `backend/src/middleware/rbac.middleware.js`

Already created. Use in routes:

```javascript
router.get('/api/ai/resume/analyze', 
  isAuthenticated, 
  authorize(['HR', 'MD', 'Admin']),
  aiController.parseResumeWithAI
);
```

### Step 2: Implement Routes

**File**: `backend/src/routes/ai.routes.complete.js`

Already created with 20+ endpoints. Register in `app.js`:

```javascript
const aiRoutes = require('./routes/ai.routes.complete');
app.use('/api/ai', aiRoutes);
```

### Step 3: Complete Controller Implementation

**File**: `backend/src/controllers/ai.controller.complete.js`

Already created with all methods. Key methods:

```javascript
// Auto-Rejection Engine
generateAIDecision(applicationId) {
  // Calculates: finalScore = (resume×0.3) + (technical×0.4) + (interview×0.3)
  // Auto-rejects if finalScore < 40
  // Recommends if finalScore >= 60
}
```

### Step 4: Environment Variables

Create/update `.env` in backend folder:

```env
# AI Service Configuration
AI_SERVICE_URL=http://localhost:5000
GOOGLE_API_KEY=your_google_generative_ai_key_here
GENAI_MODEL=gemini-2.0-flash

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=msk_recruitment
DB_USER=postgres
DB_PASSWORD=your_password

# Service Configuration
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret

# AI Service Timeouts
AI_REQUEST_TIMEOUT=30000
AI_MAX_RETRIES=3
```

## Python AI Service Setup

### Step 1: Install Dependencies

```bash
cd backend/ai_service
pip install -r requirements.txt
```

**Requirements.txt should include:**
```
google-generativeai==0.8.2
Flask==2.3.3
flask-cors==4.0.0
pdfplumber==0.10.3
pdf2image==1.16.3
PyPDF2==3.0.1
python-docx==0.8.11
spacy==3.7.2
nltk==3.8.1
python-dotenv==1.0.0
psycopg2-binary==2.9.9
```

### Step 2: Download spaCy Model

```bash
python -m spacy download en_core_web_sm
```

### Step 3: Start AI Service

```bash
cd backend/ai_service
python app.py
# Or with Flask directly
FLASK_APP=app.py FLASK_ENV=development flask run --port 5000
```

The service will expose endpoints at `http://localhost:5000/api/`:
- POST `/resume/parse` - Parse resume and match with job description
- POST `/assessment/analyze` - Analyze coding/MCQ/design assessments
- POST `/interview/analyze` - Analyze interview transcript
- POST `/summary/generate` - Generate summaries and comparisons

### Step 4: Verify Service Health

```bash
curl http://localhost:5000/health
# Should return: { "status": "healthy", "version": "1.0.0" }
```

## Frontend Integration

### Step 1: Import Components

**File**: `frontend/components/ai/index.ts`

Already created with all exports:

```typescript
export { ResumeAnalysisPanel } from "./ResumeAnalysisPanel";
export { AssessmentAnalysisPanel } from "./AssessmentAnalysisPanel";
export { InterviewAnalysisPanel } from "./InterviewAnalysisPanel";
export { AIDecisionPanel } from "./AIDecisionPanel";
export { CandidateComparisonPanel } from "./CandidateComparisonPanel";
export { MDAnalyticsPanel } from "./MDAnalyticsPanel";
export { AdminAIPanel } from "./AdminAIPanel";
```

### Step 2: Integrate into Pages

#### HR Dashboard - Candidate Details Page

**File**: `frontend/app/hr/candidates/[id]/page.tsx`

```typescript
import { ResumeAnalysisPanel, AssessmentAnalysisPanel, 
         InterviewAnalysisPanel, AIDecisionPanel } from "@/components/ai";

export default function CandidateDetailsPage({ params }) {
  return (
    <PanelLayout allowedRoles={['HR', 'MD', 'Admin']}>
      <Tabs>
        <TabsContent value="resume">
          <ResumeAnalysisPanel applicationId={params.id} />
        </TabsContent>
        
        <TabsContent value="assessment">
          <AssessmentAnalysisPanel applicationId={params.id} />
        </TabsContent>
        
        <TabsContent value="interview">
          <InterviewAnalysisPanel applicationId={params.id} />
        </TabsContent>
        
        <TabsContent value="decision">
          <AIDecisionPanel applicationId={params.id} />
        </TabsContent>
      </Tabs>
    </PanelLayout>
  );
}
```

#### HR Dashboard - Job Rankings Page

**File**: `frontend/app/hr/jobs/[jobId]/ranking/page.tsx`

```typescript
import { CandidateComparisonPanel } from "@/components/ai";

export default function JobRankingPage({ params }) {
  return (
    <PanelLayout allowedRoles={['HR', 'MD', 'Admin']}>
      <CandidateComparisonPanel jobId={params.jobId} />
    </PanelLayout>
  );
}
```

#### MD Analytics Page

**File**: `frontend/app/md/analytics/page.tsx`

```typescript
import { MDAnalyticsPanel } from "@/components/ai";

export default function MDAnalyticsPage() {
  return (
    <PanelLayout allowedRoles={['MD', 'Admin']}>
      <MDAnalyticsPanel />
    </PanelLayout>
  );
}
```

#### Admin AI Settings Page

**File**: `frontend/app/admin/settings/ai/page.tsx`

```typescript
import { AdminAIPanel } from "@/components/ai";

export default function AdminAISettingsPage() {
  return (
    <PanelLayout allowedRoles={['Admin']}>
      <AdminAIPanel />
    </PanelLayout>
  );
}
```

### Step 3: Update API Service

**File**: `frontend/lib/api.ts`

Add AI-specific query functions:

```typescript
export const aiService = {
  // Resume Analysis
  parseResume: (applicationId: number, jobId?: number) =>
    api.post(`/ai/resume/parse`, { applicationId, jobId }),
  
  // Assessment Analysis
  analyzeAssessment: (applicationId: number, assessmentData: any) =>
    api.post(`/ai/assessment/analyze`, { applicationId, ...assessmentData }),
  
  // Interview Analysis
  analyzeInterview: (applicationId: number, transcript: string) =>
    api.post(`/ai/interview/analyze`, { applicationId, transcript }),
  
  // AI Decision & Auto-Rejection
  generateDecision: (applicationId: number) =>
    api.post(`/ai/decision/generate`, { applicationId }),
  
  // Rankings & Comparison
  getRankedCandidates: (jobId: number) =>
    api.get(`/ai/candidates/ranked?jobId=${jobId}`),
  
  // Analytics
  getAnalytics: (jobId?: number, departmentId?: number) =>
    api.get(`/ai/analytics`, { params: { jobId, departmentId } }),
};
```

## Testing & Validation

### Step 1: Test Python AI Service

```bash
# Test Health
curl http://localhost:5000/health

# Test Resume Parsing
curl -X POST http://localhost:5000/api/resume/parse \
  -F "file=@sample_resume.pdf" \
  -H "X-API-Key: test"

# Test Assessment Analysis
curl -X POST http://localhost:5000/api/assessment/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "assessment_type": "coding",
    "code": "console.log(\"hello\")",
    "problem_description": "Print hello world"
  }'
```

### Step 2: Test Node.js Routes

```bash
# Test Resume Analysis Endpoint
curl -X POST http://localhost:3000/api/ai/resume/parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"application_id": 1, "job_id": 1}'

# Test Auto-Rejection
curl -X POST http://localhost:3000/api/ai/decision/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"application_id": 1}'

# Test Rankings
curl http://localhost:3000/api/ai/candidates/ranked?jobId=1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 3: Test Frontend Components

1. **Resume Analysis**: Upload a PDF resume, verify parsing and JD matching
2. **Assessment Analysis**: Submit assessment data, verify scoring
3. **Interview Analysis**: Paste interview transcript, verify Q&A extraction
4. **AI Decision**: Verify auto-rejection notification if score < 40
5. **Candidate Ranking**: Compare multiple candidates by score
6. **Analytics**: View department-wide trends and distributions
7. **Admin Settings**: Verify model switching and config updates

## RBAC Configuration

The system enforces role-based access at multiple levels:

### Route Level (Middleware)

```javascript
// Candidate: Can only view their own data
authorize(['Candidate'])

// HR: Full access to all candidates in assigned jobs
authorize(['HR', 'MD', 'Admin'])

// MD: Read-only analytics across departments
authorize(['MD', 'Admin'])

// Admin: System configuration and monitoring
authorize(['Admin'])
```

### Component Level

All AI components use `PanelLayout` with `allowedRoles`:

```typescript
<PanelLayout allowedRoles={['HR', 'MD', 'Admin']}>
  <ResumeAnalysisPanel />
</PanelLayout>
```

### Data Level

Queries filter by `current_user.role`:
- Candidates see only their own applications
- HR sees candidates in their jobs
- MD sees department analytics
- Admin sees system-wide data

## Performance Optimization

### Caching Strategy

```javascript
// Cache for 5 minutes
queryKey: ["ai-resume", applicationId],
staleTime: 5 * 60 * 1000,
cacheTime: 10 * 60 * 1000,
```

### Batch Processing

For bulk analysis:

```typescript
// Instead of individual API calls, use batch endpoint
POST /api/ai/batch/analyze
{
  "applications": [1, 2, 3],
  "analysis_type": "resume"
}
```

### Image Optimization

Resume PDFs converted to images for display:

```typescript
const convertPDFToImage = async (pdfBuffer: Buffer) => {
  // Use pdf2image or similar
};
```

## Error Handling

### Python Service Errors

The Node.js service will catch and format errors:

```javascript
try {
  const result = await axiosInstance.post('/resume/parse', data);
} catch (error) {
  if (error.response?.status === 408) {
    // Timeout - retry or show user message
  }
}
```

### Frontend Error Boundaries

Wrap components in error boundary:

```typescript
<ErrorBoundary>
  <ResumeAnalysisPanel />
</ErrorBoundary>
```

## Monitoring & Debugging

### Enable Debug Logging

```javascript
// backend/.env
DEBUG=ai:*
LOG_LEVEL=debug
```

### View Audit Logs

Admin panel shows all AI system actions:
- Model changes
- Configuration updates
- User actions
- API errors

### Monitor Service Health

```bash
# Check uptime
curl http://localhost:3000/api/admin/ai-health

# View error rate
GET /api/admin/ai-health -> error_rate (%)
```

## Troubleshooting

### Python Service Not Starting

```bash
# Check if port 5000 is in use
lsof -i :5000
# Kill if needed
kill -9 <PID>

# Try running with specific Python version
python3.9 app.py
```

### CORS Issues

Add to Python Flask service:

```python
from flask_cors import CORS
CORS(app, 
     origins=['http://localhost:3000', 'http://localhost:3001'],
     allow_headers=['Content-Type', 'Authorization'])
```

### Database Connection Failed

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d msk_recruitment

# Verify Sequelize models are synced
npm run db:sync  # If you have this command
```

### AI API Rate Limiting

If hitting Google API limits:
1. Check API quota in Google Cloud Console
2. Implement request queue with delays
3. Use model with higher rate limit (Gemini 2.0)

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Python Flask service running on stable port (5000)
- [ ] Database migrations completed
- [ ] RBAC rules verified for each role
- [ ] Audit logging enabled
- [ ] Error monitoring configured (Sentry, etc.)
- [ ] API rate limits set (Redis queue recommended)
- [ ] PDF extraction fallbacks tested
- [ ] Auto-rejection thresholds reviewed with HR
- [ ] Frontend components wrapped in error boundaries
- [ ] performance.now() logging added for slow endpoints

## Next Steps

1. **Week 1**: Setup Python service, test endpoints
2. **Week 2**: Integrate database models, run migrations
3. **Week 3**: Implement Node.js routes, test RBAC
4. **Week 4**: Integrate frontend components, styling
5. **Week 5**: Testing, debugging, performance optimization
6. **Week 6**: Deployment, monitoring, user training

## Contact & Support

For issues or questions:
- Check `/backend/AI_SERVICE_README.md` for AI service details
- Review component prop interfaces in TypeScript files
- Check network tab in browser DevTools for API calls
- Review server logs: `tail -f backend/server_log.txt`

---

**Last Updated**: 2025-02-12
**Version**: 1.0.0
**Status**: Ready for Integration
