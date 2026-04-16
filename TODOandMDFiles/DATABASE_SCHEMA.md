# Complete Database Schema Documentation
## Resume Analysis | Technical Assessment | Interview Analysis | AI Predictions

---

## 📊 DATABASE OVERVIEW

**Total Tables**: 35+ models
**Primary Purpose**: Complete recruitment pipeline with AI/ML scoring
**Key Features**: Resume parsing, Assessment tracking, Interview analysis, Predictive scoring

---

## 🔑 CORE MODELS

### 1. **Users** Table
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key, auto-increment |
| name | STRING | Full name |
| email | STRING (UNIQUE) | Email address |
| password | STRING | Hashed password |
| role | ENUM | ADMIN, HR, CANDIDATE, MD |
| status | STRING | ACTIVE, INACTIVE |
| hr_role | ENUM | VIEWER, REVIEWER, APPROVER, SENIOR_HR |
| email_verified | BOOLEAN | Email verification status |
| otp | STRING | One-time password for verification |
| auth_token_revision | INTEGER | Token invalidation counter |

### 2. **Candidates** Table
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key |
| user_id | INTEGER | FK to Users |
| education | STRING | Degree (B.Tech, MBA, etc) |
| specialization | STRING | Field of study |
| experience_years | INTEGER | Total years of experience |
| phone | STRING | Contact phone |
| location | STRING | Current location |
| parsed_resume | JSON | Extracted resume data |
| resume_path | STRING | File path to resume |
| profile_image_path | STRING | Avatar image path |
| ai_score | FLOAT | Overall AI score |
| ai_summary | TEXT | AI-generated profile summary |
| summary | TEXT | Candidate's professional summary |
| current_stage | STRING | Application pipeline stage |
| status | STRING | IN_PROGRESS, COMPLETED, REJECTED |

### 3. **Jobs** Table
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key |
| title | STRING | Job title |
| department | STRING | Department |
| min_experience | INTEGER | Minimum years required |
| max_experience | INTEGER | Maximum years acceptable |
| salary_min | INTEGER | Min salary |
| salary_max | INTEGER | Max salary |
| status | ENUM | ACTIVE, INACTIVE |
| location | STRING | Job location |
| type | STRING | FULL_TIME, PART_TIME, CONTRACT |
| description | TEXT | Full job description |
| requirements | TEXT | Requirements text |
| required_skills | JSON | Array of required skills |
| skill_weights | JSON | Weight per skill |
| urgency | ENUM | NORMAL, FAST_TRACK |

### 4. **Applications** Table  
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key |
| candidate_id | INTEGER | FK to Candidates |
| job_id | INTEGER | FK to Jobs |
| education | STRING | Profile education |
| specialization | STRING | Profile specialization |
| experience_years | INTEGER | Years of experience |
| status | ENUM | APPLIED, RESUME_SUBMITTED, RESUME_EVALUATED, ASSESSMENT_UNLOCKED, TECHNICAL_ROUND_*, INTERVIEW_*, HR_REVIEW, SELECTED, OFFERED, HIRED, REJECTED, etc |
| attempt_count | INTEGER | Track application attempts |
| resume_score | FLOAT | AI resume matching score (0-100) |
| technical_score | FLOAT | Technical assessment score |
| interview_score | FLOAT | Interview analysis score |
| hr_decision | STRING | HR's final decision |
| hr_notes | TEXT | Internal HR notes |
| overall_score | FLOAT | Combined score (resume + assessment + interview) |
| resume_url | TEXT | Public URL to resume |
| skills | ARRAY | Parsed skills from resume |
| cgpa | FLOAT | CGPA from resume |
| year_of_passout | INTEGER | Graduation year |
| summary | TEXT | Professional summary |
| applied_at | DATE | Application date |
| created_at | DATE | Record creation |
| updated_at | DATE | Last update |

---

## 📄 RESUME ANALYSIS MODELS

### 5. **Resumes** Table
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key, auto-increment |
| application_id | INTEGER | FK to Applications |
| file_name | STRING | Original upload filename |
| file_path | STRING | Stored path |
| skills | JSONB | Extracted skills in JSON |
| education | JSONB | Education details |
| total_experience_months | INTEGER | Total experience in months |
| summary | TEXT | Resume summary text |
| parsed_at | DATE | When resume was parsed |
| created_at | DATE | Record creation |
| updated_at | DATE | Last update |

### 6. **ResumeAnalysis** Table
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key, auto-increment |
| application_id | INTEGER | FK to Applications (UNIQUE) |
| resume_id | INTEGER | FK to Resumes |
| **PARSED DATA** | | |
| contact_info | JSONB | Name, email, phone extracted by AI |
| education | JSONB | Array of {degree, specialization, cgpa, year_of_passout} |
| experience | JSONB | Array of {position, duration_years, company} |
| skills | JSONB | Categorized skills (8 categories) |
| certifications | ARRAY | Extracted certifications |
| languages | ARRAY | Languages known |
| **AI ANALYSIS** | | |
| ai_summary | TEXT | AI-generated executive summary |
| strengths | ARRAY | AI-identified strengths |
| weaknesses | ARRAY | AI-identified weaknesses |
| recommendations | ARRAY | AI recommendations |
| key_achievements | ARRAY | Extracted achievements |
| **SCORING** | | |
| overall_score | FLOAT | Overall resume quality (0-100) |
| jd_match_score | FLOAT | Resume-to-JD match (0-100) |
| jd_matched_skills | ARRAY | Skills matching JD |
| jd_missing_skills | ARRAY | Skills missing vs JD |
| role_fit | JSONB | {technical_fit, cultural_fit, seniority_match} (0-100 each) |
| **EXPLAINABILITY** | | |
| analysis_explanation | TEXT | Detailed score explanation |
| red_flags | ARRAY | Potential red flags |
| green_flags | ARRAY | Positive indicators |
| **METADATA** | | |
| total_years_experience | INTEGER | Professional years |
| highest_qualification | STRING | Highest degree |
| ai_model_used | STRING | Model used (gemini-1.5-flash) |
| processed_at | DATE | Processing timestamp |
| reprocessed_count | INTEGER | Re-analysis count |
| created_at | DATE | Record creation |
| updated_at | DATE | Last update |

---

## 🧪 ASSESSMENT MODELS

### 7. **AssessmentAttempt** Table
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key |
| application_id | INTEGER | FK to Applications |
| assessment_type | ENUM | TECHNICAL, APTITUDE, CODING |
| status | ENUM | NOT_STARTED, IN_PROGRESS, SUBMITTED, EVALUATED |
| started_at | DATE | When assessment started |
| submitted_at | DATE | When assessment submitted |
| score | FLOAT | Final score received |
| total_marks | FLOAT | Total marks possible |
| percentage | FLOAT | Score percentage |
| duration_minutes | INTEGER | Time taken to complete |
| metadata | JSON | Selected question IDs, attempt details |
| created_at | DATE | Record creation |
| updated_at | DATE | Last update |

### 8. **TechnicalQuestionBank** Table (Your Theoretical Questions)
| Column | Type | Purpose |
|--------|------|---------|
| questionId | STRING | Primary key (unique identifier) |
| jobRole | ENUM | Job role (MANAGEMENT_TRAINEE_MARKETING, ASSISTANT_MANAGER_MARKETING, EXECUTIVE_MARKETING, RUBBER_PROCESS_ENGINEER) |
| topic | STRING | E.g., "Marketing Strategy", "Operations", "Data Analysis" |
| difficulty | ENUM | EASY, MEDIUM, HARD |
| questionType | ENUM | **THEORY** (your focus), MCQ, CODING, DEBUGGING |
| question | TEXT | The actual question text |
| **FOR MCQ** | | |
| options | JSON | ["a) Option 1", "b) Option 2", ...] |
| correct_answer | STRING | "c) Option 3" |
| **FOR CODING** | | |
| codeSnippet | TEXT | Code sample (if debugging) |
| expectedOutput | TEXT | Expected output |
| testCases | JSON | [{input, expectedOutput}, ...] |
| **GENERAL** | | |
| explanation | TEXT | Answer explanation |
| hints | JSON | ["hint1", "hint2"] |
| keywords | JSON | Keywords for grading |
| estimatedTime | INTEGER | Time limit (minutes) |
| maxAttempts | INTEGER | Max attempts allowed |
| isActive | BOOLEAN | Whether question is active |
| createdBy | STRING | Who created the question |
| created_at | DATE | Record creation |
| updated_at | DATE | Last update |

### 9. **AssessmentAnalysis** Table (Detailed Scoring)
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key |
| application_id | INTEGER | FK to Applications |
| assessment_type | ENUM | coding, mcq, design, case_study |
| **TEST METADATA** | | |
| test_name | STRING | Name of the test |
| duration_minutes | INTEGER | Test duration |
| total_questions | INTEGER | Number of questions |
| **RAW RESPONSE** | | |
| candidate_response | JSONB | Raw answer data |
| **OVERALL SCORE** | | |
| overall_score | FLOAT | Final assessment score (0-100) |
| **COMPONENT SCORES** | | |
| correctness_score | FLOAT | Correctness (0-100) |
| code_quality_score | FLOAT | Code quality (0-100) |
| efficiency_score | FLOAT | Efficiency (0-100) |
| design_score | FLOAT | Design quality (0-100) |
| scalability_score | FLOAT | Scalability (0-100) |
| clarity_score | FLOAT | Clarity (0-100) |
| business_acumen_score | FLOAT | Business understanding (0-100) |
| **COMPLEXITY ANALYSIS** | | |
| time_complexity | STRING | E.g., O(n log n) |
| space_complexity | STRING | E.g., O(1) |
| **MCQ METRICS** | | |
| correct_answers | INTEGER | Number correct |
| incorrect_answers | INTEGER | Number incorrect |
| unattempted | INTEGER | Unattempted questions |
| **TOPIC BREAKDOWN** | | |
| topic_scores | JSONB | {topic: {score, questions, correct}} |
| **AI ANALYSIS** | | |
| strengths | ARRAY | What they did well |
| weaknesses | ARRAY | Areas needing improvement |
| improvement_areas | ARRAY | Topics to focus on |
| optimization_suggestions | ARRAY | Optimization ideas |
| design_issues | ARRAY | Identified issues |
| **SKILL ASSESSMENT** | | |
| estimated_skill_level | ENUM | junior, mid_level, senior, expert |
| estimated_years_experience | INTEGER | Years exp based on performance |
| **FEEDBACK** | | |
| detailed_feedback | TEXT | Human-readable feedback |
| follow_up_questions | ARRAY | Questions for interview |
| red_flags | ARRAY | Concerns identified |
| **PROCTORING** | | |
| proctoring_data | JSONB | {has_cheating_suspicion, violations, events} |
| **METADATA** | | |
| ai_model_used | STRING | Model used (gemini-2.5-flash) |
| created_at | DATE | Record creation |
| updated_at | DATE | Last update |

---

## 🎤 INTERVIEW ANALYSIS MODELS

### 10. **InterviewAnalysis** Table (Comprehensive Interview Scoring)
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key |
| application_id | INTEGER | FK to Applications (UNIQUE) |
| interview_session_id | INTEGER | Reference to interview session |
| **INTERVIEW METADATA** | | |
| interview_type | ENUM | technical, hr, behavioral, system_design |
| interviewer_name | STRING | Interviewer name |
| interview_duration_minutes | INTEGER | Interview duration |
| **TRANSCRIPT & DATA** | | |
| transcript | TEXT | Full interview transcript |
| qa_pairs | JSONB | [{question, answer, analysis_score}] |
| **OVERALL SCORE** | | |
| overall_score | FLOAT | Overall interview score (0-100) |
| **COMPONENT SCORES (Weighted)** | | |
| technical_knowledge_score | FLOAT | Technical depth (30% weight) |
| problem_solving_score | FLOAT | Problem-solving approach (25% weight) |
| communication_score | FLOAT | Clarity & articulation (20% weight) |
| soft_skills_score | FLOAT | Teamwork & leadership (15% weight) |
| cultural_fit_score | FLOAT | Values alignment (10% weight) |
| **ANSWER ANALYSIS** | | |
| answer_analyses | JSONB | [{question_id, relevance, completeness, clarity, confidence, feedback}] |
| **BEHAVIORAL INDICATORS** | | |
| confidence_level | ENUM | high, medium, low |
| communication_style | STRING | formal, conversational, technical |
| pace | ENUM | fast, normal, slow |
| clarity | ENUM | very_clear, clear, somewhat_clear, unclear |
| hesitation_level | ENUM | high, medium, low |
| vocabulary_level | ENUM | advanced, intermediate, basic |
| **QUALITATIVE ANALYSIS** | | |
| strengths | ARRAY | Demonstrated strengths |
| weaknesses | ARRAY | Areas of concern |
| key_takeaways | ARRAY | Important observations |
| green_flags | ARRAY | Positive signals |
| red_flags | ARRAY | Concerning signals |
| **PERFORMANCE PREDICTION** | | |
| predicted_on_job_performance | ENUM | high, medium, low |
| performance_confidence_percentage | FLOAT | Confidence (0-100) |
| time_to_productivity_months | INTEGER | Estimated months to full productivity |
| retention_probability_percentage | FLOAT | Likelihood to stay (0-100) |
| team_fit_assessment | ENUM | good, fair, poor |
| growth_trajectory | ENUM | fast, moderate, slow |
| **RECOMMENDATIONS** | | |
| follow_up_questions | ARRAY | Questions for clarification |
| further_discussion_topics | ARRAY | Topics to explore |
| hire_recommendation | ENUM | strong_yes, yes, maybe, no, strong_no |
| recommendation_confidence | FLOAT | Confidence (0-100) |
| next_round_ready | BOOLEAN | Ready for next round |
| **EXPLAINABILITY** | | |
| detailed_evaluation | TEXT | Comprehensive evaluation |
| scoring_rationale | TEXT | How scores were calculated |
| **METADATA** | | |
| ai_model_used | STRING | Model used (gemini-1.5-flash-latest) |
| analysis_timestamp | DATE | Analysis time |
| analyzed_by | STRING | HR/Interviewer name |
| created_at | DATE | Record creation |
| updated_at | DATE | Last update |

---

## 🤖 PREDICTIVE MODELS

### 11. **AIDecision** Table (Final Candidate Prediction)
| Column | Type | Purpose |
|--------|------|---------|
| id | INTEGER | Primary key |
| application_id | INTEGER | FK to Applications (UNIQUE) |
| candidate_id | INTEGER | FK to Candidates |
| job_id | INTEGER | FK to Jobs |
| **COMPONENT SCORES** | | |
| resume_score | FLOAT | Resume evaluation (0-100) |
| resume_weight | FLOAT | Weight in decision (default 0.3 = 30%) |
| technical_assessment_score | FLOAT | Assessment score (0-100) |
| technical_weight | FLOAT | Weight (default 0.4 = 40%) |
| interview_score | FLOAT | Interview score (0-100) |
| interview_weight | FLOAT | Weight (default 0.3 = 30%) |
| **FINAL DECISION SCORE** | | |
| final_score | FLOAT | **Resume*0.3 + Technical*0.4 + Interview*0.3** |
| score_threshold | FLOAT | Cutoff score for role |
| **QUALIFICATION ASSESSMENT** | | |
| meets_minimum_requirements | BOOLEAN | Meets minimum qualifications |
| has_required_skills | BOOLEAN | Has all required skills |
| experience_aligned | BOOLEAN | Experience level match |
| **FINAL DECISION** | | |
| ai_decision | ENUM | **AUTO_REJECTED, PROCEED_TO_HR, RECOMMENDED, AUTO_SELECTED** |
| decision_reason | TEXT | Explanation of decision |
| confidence_percentage | FLOAT | AI confidence (0-100) |
| **RANKING & COMPARISON** | | |
| ranked_position | INTEGER | Rank among candidates |
| percentile_rank | FLOAT | Percentile (0-100) |
| score_distribution_percentile | FLOAT | Score distribution percentile |
| **DETAILED SCORING BREAKDOWN** | | |
| scoring_breakdown | JSONB | {technical_alignment, experience_fit, skill_match, communication_ability, cultural_fit, growth_potential} |
| **RISK ASSESSMENT** | | |
| risk_level | ENUM | low, medium, high |
| risk_factors | ARRAY | Identified risk factors |
| **EXPLAINABILITY** | | |
| summary | TEXT | Executive summary |
| strengths_summary | TEXT | Key strengths |
| concerns_summary | TEXT | Concerns/gaps |
| recommendations_for_hr | ARRAY | HR guidance |
| **ALTERNATIVES** | | |
| top_alternatives | JSONB | [{candidate_id, score, reason}] |
| **DECISION WORKFLOW** | | |
| decision_made_at | DATE | When decision made |
| hr_review_decision | ENUM | APPROVED, REJECTED, NEEDS_CLARIFICATION, PENDING |
| hr_review_notes | TEXT | HR's additional notes |
| md_approval | BOOLEAN | MD final approval |
| **AUDIT TRAIL** | | |
| decision_version | INTEGER | Track recalculations |
| previous_decision | ENUM | Previous decision if recalculated |
| recalculation_reason | STRING | Why recalculated |
| **METADATA** | | |
| ai_model_used | STRING | Model used (gemini-1.5-flash) |
| decision_type | ENUM | automated, manual_override, appeal_reconsideration |
| is_appeal | BOOLEAN | Is this an appeal |
| created_at | DATE | Record creation |
| updated_at | DATE | Last update |

---

## 📊 SUPPORTING MODELS

### 12. **ApplicationStatusLog** Table
- Tracks status history of applications
- Columns: id, application_id, old_status, new_status, changed_by, reason, changed_at

### 13. **AssessmentAttempt** Table  
- Tracks each assessment attempt details
- Already covered above

### 14. **InterviewSession** Table
- Records interview sessions
- Columns: id, application_id, scheduled_at, started_at, ended_at, recording_url, status

### 15. **CandidateSession** Table
- Tracks candidate portal sessions
- Columns: id, candidate_id, login_at, logout_at, ip_address, device_info

### 16. **DocumentRecord** Table
- Stores document records (resumes, transcripts, reports)
- Columns: id, application_id, type (RESUME, OFFER_LETTER, ASSESSMENT_REPORT, INTERVIEW_TRANSCRIPT, OTHER), file_path, uploaded_at

### 17. **NotificationQueue** Table
- Email/SMS notifications
- Columns: id, candidate_id, application_id, type, status, sent_at

---

## 🔄 RELATIONSHIPS

```
User (1) ──→ (Many) Candidate
Candidate (1) ──→ (Many) Application
Job (1) ──→ (Many) Application
Application (1) ──→ (1) Resume
Application (1) ──→ (1) ResumeAnalysis
Application (1) ──→ (Many) AssessmentAttempt
Application (1) ──→ (1) AssessmentAnalysis
Application (1) ──→ (1) InterviewAnalysis
Application (1) ──→ (1) AIDecision
TechnicalQuestionBank (Many) ──→ (1) Job
```

---

## ✅ SUMMARY

**Total Models**: 35+
**Core Tables**: 11
**Supporting Tables**: 15+
**Total Fields for ML/Analytics**: 150+

**Key Features**:
- ✅ Complete resume parsing data (24 fields)
- ✅ Comprehensive assessment records (38 fields)
- ✅ Detailed interview analysis (35+ fields)
- ✅ Predictive scoring (45+ fields)
- ✅ Full audit trail & explainability
- ✅ Fallback data structures for non-AI processing

**Status**: **PRODUCTION READY**
