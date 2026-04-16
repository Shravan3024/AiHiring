# AI Service Setup & Quick Start Guide

## ⚡ Quick Start (5 Minutes)

### 1. Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable "Generative Language API" or "Google AI API"
4. Generate API key in "Credentials" section
5. Copy the key

### 2. Setup Python Environment

```bash
# Navigate to AI service
cd backend/ai_service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### 3. Create Environment File

Create `.env` in `backend/` directory:

```env
# Google AI
GOOGLE_API_KEY=your_api_key_here
GENAI_MODEL=gemini-2.0-flash

# AI Service
AI_SERVICE_HOST=127.0.0.1
AI_SERVICE_PORT=5000
FLASK_ENV=development

# Database (adjust to your setup)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=msk_db
DB_USER=postgres
DB_PASSWORD=password

# Files
UPLOAD_FOLDER=uploads
MAX_FILE_SIZE=52428800

# Logging
LOG_LEVEL=INFO
```

### 4. Start AI Service

```bash
cd backend/ai_service
python app.py
```

Expected output:
```
2026-04-06 12:00:00 - root - INFO - Starting AI Service on 127.0.0.1:5000
```

### 5. Verify Installation

In another terminal:

```bash
curl http://localhost:5000/health
```

Response should be:
```json
{
  "status": "healthy",
  "modules": {...}
}
```

### 6. Integrate with Node.js Backend

In your main server file (`backend/src/server.js` or `backend/src/app.js`):

```javascript
const aiRoutes = require('./routes/ai.routes');

// Add this line where you define routes
app.use('/api/ai', aiRoutes);
```

### 7. Test Integration

```bash
curl -X POST http://localhost:3000/api/ai/health
```

---

## 📦 Installation Details

### Full Setup with All Features

#### Prerequisites
```bash
# Check Python version
python --version  # Must be 3.9+

# Check Node version
node --version    # Must be 16+

# Check npm version
npm --version     # Must be 8+
```

#### Installation Steps

```bash
# 1. Clone/enter project
cd MSK/backend

# 2. Create Python environment
cd ai_service
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# 3. Install Python packages
pip install --upgrade pip
pip install -r requirements.txt

# 4. Download NLP models
python -m spacy download en_core_web_sm

# 5. Install Node dependencies
cd ..
npm install

# 6. Create environment file
cp .env.example .env
# Edit .env with your settings

# 7. Start services
# Terminal 1 - AI Service
cd ai_service
python app.py

# Terminal 2 - Node.js Backend
npm run dev
```

---

## 🔧 Configuration Options

### Database Configuration

If using PostgreSQL:
```bash
# Create database
createdb msk_db

# Connect string
DB_HOST=localhost
DB_PORT=5432
DB_NAME=msk_db
DB_USER=postgres
DB_PASSWORD=secure_password
```

If using SQLite (development):
```
DATABASE_URL=sqlite:///msk.db
```

### AI Model Options

**Available Models**:
```
gemini-2.0-flash       # Recommended (fastest)
gemini-1.5-flash       # Good balance
gemini-1.5-pro         # Most capable
text-bison-001         # Legacy
```

Change in `.env`:
```env
GENAI_MODEL=gemini-2.0-flash
```

### Logging Configuration

```env
LOG_LEVEL=DEBUG      # More verbose
LOG_LEVEL=INFO       # Normal
LOG_LEVEL=WARNING    # Less verbose
LOG_LEVEL=ERROR      # Only errors

LOG_FILE=ai_service.log  # Log file path
```

---

## 🚀 Running the System

### Single Terminal (Development)

```bash
# Terminal 1
cd backend
npm run dev

# On service startup, Python AI service will be called via HTTP
```

### Multiple Terminals (Recommended)

**Terminal 1 - AI Service**:
```bash
cd backend/ai_service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

Output:
```
2026-04-06 12:00:00 - root - INFO - AI Service initialized successfully
2026-04-06 12:00:01 - root - INFO - Starting AI Service on 127.0.0.1:5000
 * Running on http://127.0.0.1:5000
```

**Terminal 2 - Node.js Backend**:
```bash
cd backend
npm run dev
```

Output:
```
Server running on port 3000
AI Service available at http://127.0.0.1:5000
```

---

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Check AI Service health
curl http://localhost:5000/health
# Expected: { "status": "healthy", ... }

# 2. Check Node.js API
curl http://localhost:3000/api/ai/health
# Expected: { "success": true, ... }

# 3. Get capabilities
curl http://localhost:3000/api/ai/capabilities
# Expected: List of available operations

# 4. Test resume parsing (with actual file)
curl -F "file=@resume.pdf" \
  -H "Authorization: Bearer your_token" \
  http://localhost:3000/api/ai/resume/parse
```

---

## 🐛 Common Setup Issues & Solutions

### Issue: "Module not found" errors

```bash
# Ensure venv is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt

# Verify installation
python -c "import google.genai; print('OK')"
```

### Issue: GOOGLE_API_KEY not found

```bash
# Check .env file location (must be in backend/ folder)
ls -la .env

# Check contents
cat .env | grep GOOGLE_API_KEY

# Set fallback environment variable
export GOOGLE_API_KEY=your_key_here
```

### Issue: Port already in use

```bash
# Find process on port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
AI_SERVICE_PORT=5001 python app.py
```

### Issue: Database connection error

```bash
# Test database connection
python -c "from sqlalchemy import create_engine; engine = create_engine('postgresql://...'); print(engine.table_names())"

# Check PostgreSQL is running
sudo systemctl start postgresql  # Linux
brew services start postgresql   # Mac
```

### Issue: spaCy model not found

```bash
# Download model
python -m spacy download en_core_web_sm

# Verify
python -c "import spacy; spacy.load('en_core_web_sm'); print('OK')"
```

---

## 📚 Project Structure After Setup

```
MSK/
├── backend/
│   ├── .env                      # Environment variables
│   ├── package.json
│   ├── src/
│   │   ├── server.js             # Main server file
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   ├── ai.controller.js  # NEW: AI endpoints
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── ai.routes.js      # NEW: AI routes
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── ai.service.js     # NEW: AI client
│   │   │   └── ...
│   │   └── ...
│   ├── ai_service/               # NEW: Python AI service
│   │   ├── venv/                 # Python environment
│   │   ├── .env
│   │   ├── app.py                # Flask app
│   │   ├── ai_service.py         # Main orchestrator
│   │   ├── config.py
│   │   ├── utils.py
│   │   ├── requirements.txt
│   │   ├── modules/
│   │   │   ├── resume_parser.py
│   │   │   ├── summary_generator.py
│   │   │   ├── interview_analyzer.py
│   │   │   └── assessment_analyzer.py
│   │   └── ...
│   ├── AI_SERVICE_README.md      # NEW: Full documentation
│   └── SETUP_GUIDE.md            # NEW: This file
│
├── frontend/
│   └── ...
└── README.md
```

---

## 🔄 Development Workflow

### Making Code Changes

**Python Changes**:
```bash
cd backend/ai_service
# Edit files in modules/ or core files
# AI service auto-reloads with Flask debugger
```

**Node.js Changes**:
```bash
cd backend
# Edit files in src/
# Server auto-reloads with nodemon
```

### Testing Changes

```bash
# Terminal 1: Test AI service directly
curl -X POST http://localhost:5000/api/resume/parse \
  -F "file=@test_resume.pdf"

# Terminal 2: Test via Node.js
curl -X POST http://localhost:3000/api/ai/resume/parse \
  -F "file=@test_resume.pdf" \
  -H "Authorization: Bearer token"
```

---

## 📊 Performance Tuning

### For Production

```env
# Increase timeouts
API_TIMEOUT=60

# Reduce debugging
FLASK_ENV=production
LOG_LEVEL=WARNING

# Enable caching
CACHE_ENABLED=true
CACHE_TTL=7200

# Database pooling
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=40

# Max workers
AI_MAX_WORKERS=4
```

### Monitoring

```bash
# Monitor AI service
tail -f ai_service.log

# Monitor Node.js
npm run dev  # Shows all requests

# Check resource usage
top  # Process monitor
```

---

## 🆘 Getting Help

### Debugging Step-by-Step

1. **Check services are running**:
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:3000/api/health
   ```

2. **Check logs**:
   ```bash
   tail -f backend/ai_service.log
   tail -f backend/server_log.txt
   ```

3. **Test directly**:
   ```bash
   # Python directly
   cd backend/ai_service
   python -c "from ai_service import get_ai_service; ai = get_ai_service(); print(ai.health_check())"
   ```

4. **Check configuration**:
   ```bash
   cat backend/.env
   echo $GOOGLE_API_KEY
   ```

### Resources

- **Documentation**: [AI_SERVICE_README.md](AI_SERVICE_README.md)
- **API Docs**: Included in AI_SERVICE_README.md
- **Examples**: See usage examples section
- **Support**: Create issue in repository

---

## ✨ Next Steps

After successful setup:

1. **Test with Sample Resume**: Upload a PDF resume
2. **Test Scoring**: Compare resume against job requirements
3. **Test Assessments**: Send coding/MCQ responses
4. **Test Interviews**: Analyze interview transcripts
5. **Integrate Fully**: Connect all features to your applications

---

**Setup Complete!** 🎉

Your AI-powered recruitment system is now ready to use. Start by parsing resumes and analyzing assessments to see the power of AI integration.
