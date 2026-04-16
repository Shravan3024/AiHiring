const { sequelize } = require("../config/db");

// ===================== CORE MODELS (as factory functions) =====================
const userModel = require("./user");
const candidateModel = require("./candidate");
const jobModel = require("./job");
const applicationModel = require("./application");
const technicalRoundModel = require("./technicalRound");
const notificationModel = require("./notification");

// Initialize core models
const User = userModel(sequelize);
const Candidate = candidateModel(sequelize);
const Job = jobModel(sequelize);
const Application = applicationModel(sequelize);
const TechnicalRound = technicalRoundModel(sequelize);
const Notification = notificationModel(sequelize);

const resumeModel = require("./Resume");

// TODO: MCQ models are not yet created - commented out until they exist
// const MCQQuestion = require("./mcqQuestion");
// const MCQTest = require("./mcqTest");
// const MCQAnswer = require("./mcqAnswer");

const interviewModel = require("./interview");
const interviewAnswerModel = require("./interviewAnswer");

const malpracticeEventModel = require("./malpracticeEvent");
const offerModel = require("./offer");

// Initialize additional models
const Interview = interviewModel(sequelize);
const InterviewAnswer = interviewAnswerModel(sequelize);
const MalpracticeEvent = malpracticeEventModel(sequelize);
const Offer = offerModel(sequelize);

// ===================== NEW MODELS (CANDIDATE PANEL) =====================
const applicationStatusLogModel = require("./applicationStatusLog");
const assessmentAttemptModel = require("./assessmentAttempt");
const interviewSessionModel = require("./interviewSession");
const candidateSessionModel = require("./candidateSession");
const documentRecordModel = require("./documentRecord");
const notificationQueueModel = require("./notificationQueue");

// Initialize new models
const ApplicationStatusLog = applicationStatusLogModel(sequelize);
const AssessmentAttempt = assessmentAttemptModel(sequelize);
const InterviewSession = interviewSessionModel(sequelize);
const CandidateSession = candidateSessionModel(sequelize);
const DocumentRecord = documentRecordModel(sequelize);
const NotificationQueue = notificationQueueModel(sequelize);

// ===================== ADMIN PANEL MODELS =====================
const adminJobModel = require("./adminJob");
const aiConfigModel = require("./aiConfig");
const aiModelModel = require("./aiModel");
const adminWorkflowModel = require("./adminWorkflow");
const offerTemplateModel = require("./offerTemplate");
const adminAuditLogModel = require("./adminAuditLog");
const dataRetentionPolicyModel = require("./dataRetentionPolicy");
const systemHealthModel = require("./systemHealth");

// Initialize admin models
const AdminJob = adminJobModel(sequelize);
const AIConfig = aiConfigModel(sequelize);
const AIModel = aiModelModel(sequelize);
const AdminWorkflow = adminWorkflowModel(sequelize);
const OfferTemplate = offerTemplateModel(sequelize);
const AdminAuditLog = adminAuditLogModel(sequelize);
const DataRetentionPolicy = dataRetentionPolicyModel(sequelize);
const SystemHealth = systemHealthModel(sequelize);

const Resume = resumeModel(sequelize);

// ===================== QUESTION BANK MODELS =====================
const interviewQuestionBankModel = require("./interviewQuestionBank");
const technicalQuestionBankModel = require("./technicalQuestionBank");

const InterviewQuestionBank = interviewQuestionBankModel(sequelize);
const TechnicalQuestionBank = technicalQuestionBankModel(sequelize);

// ===================== AI ANALYSIS MODELS =====================
const resumeAnalysisModel = require("./resumeAnalysis");
const assessmentAnalysisModel = require("./assessmentAnalysis");
const interviewAnalysisModel = require("./interviewAnalysis");
const aiDecisionModel = require("./aiDecision");

const ResumeAnalysis = resumeAnalysisModel(sequelize);
const AssessmentAnalysis = assessmentAnalysisModel(sequelize);
const InterviewAnalysis = interviewAnalysisModel(sequelize);
const AIDecision = aiDecisionModel(sequelize);

// ===================== SCORING MODELS =====================
const manualJobMappingModel = require("./manualJobMapping");
const ManualJobMapping = manualJobMappingModel(sequelize);

// ===================== ASSOCIATIONS =====================

// User ↔ Candidate
User.hasOne(Candidate, { foreignKey: "user_id" });
Candidate.belongsTo(User, { foreignKey: "user_id" });

// Candidate ↔ Application
Candidate.hasMany(Application, { foreignKey: "candidate_id" });
Application.belongsTo(Candidate, { foreignKey: "candidate_id" });

// Application ↔ Resume
Application.hasOne(Resume, { foreignKey: "application_id" });
Resume.belongsTo(Application, { foreignKey: "application_id" });

// Job ↔ Application
Job.hasMany(Application, { foreignKey: "job_id" });
Application.belongsTo(Job, { foreignKey: "job_id" });

// Application ↔ Technical Round
Application.hasOne(TechnicalRound, { foreignKey: "application_id" });
TechnicalRound.belongsTo(Application, { foreignKey: "application_id" });

// TODO: MCQ Test associations commented out until MCQ models exist
// Application ↔ MCQ Test
// Application.hasOne(MCQTest, { foreignKey: "application_id" });
// MCQTest.belongsTo(Application, { foreignKey: "application_id" });

// MCQ Test ↔ Answers
// MCQTest.hasMany(MCQAnswer, { foreignKey: "mcq_test_id" });
// MCQAnswer.belongsTo(MCQTest, { foreignKey: "mcq_test_id" });

// Job ↔ MCQ Questions
// Job.hasMany(MCQQuestion, { foreignKey: "job_id" });
// MCQQuestion.belongsTo(Job, { foreignKey: "job_id" });

// Application ↔ Interview
Application.hasOne(Interview, { foreignKey: "application_id" });
Interview.belongsTo(Application, { foreignKey: "application_id" });

// Interview ↔ Answers
Interview.hasMany(InterviewAnswer, { foreignKey: "interview_id" });
InterviewAnswer.belongsTo(Interview, { foreignKey: "interview_id" });

// Application ↔ Malpractice Events
Application.hasMany(MalpracticeEvent, { foreignKey: "application_id" });
MalpracticeEvent.belongsTo(Application, { foreignKey: "application_id" });

// Application ↔ Offer
Application.hasOne(Offer, { foreignKey: "application_id" });
Offer.belongsTo(Application, { foreignKey: "application_id" });

// ===================== NEW ASSOCIATIONS (CANDIDATE PANEL) =====================

// Application ↔ ApplicationStatusLog
Application.hasMany(ApplicationStatusLog, { foreignKey: "application_id" });
ApplicationStatusLog.belongsTo(Application, { foreignKey: "application_id" });

// Application ↔ AssessmentAttempt
Application.hasMany(AssessmentAttempt, { foreignKey: "application_id" });
AssessmentAttempt.belongsTo(Application, { foreignKey: "application_id" });

// Application ↔ InterviewSession
Application.hasMany(InterviewSession, { foreignKey: "application_id" });
InterviewSession.belongsTo(Application, { foreignKey: "application_id" });

// Candidate ↔ CandidateSession
Candidate.hasMany(CandidateSession, { foreignKey: "candidate_id" });
CandidateSession.belongsTo(Candidate, { foreignKey: "candidate_id" });

// Application ↔ DocumentRecord
Application.hasMany(DocumentRecord, { foreignKey: "application_id" });
DocumentRecord.belongsTo(Application, { foreignKey: "application_id" });

// Candidate ↔ NotificationQueue
Candidate.hasMany(NotificationQueue, { foreignKey: "candidate_id" });
NotificationQueue.belongsTo(Candidate, { foreignKey: "candidate_id" });

// Application ↔ NotificationQueue (optional relation)
Application.hasMany(NotificationQueue, { foreignKey: "application_id" });
NotificationQueue.belongsTo(Application, { foreignKey: "application_id" });

// ===================== AI ANALYSIS ASSOCIATIONS =====================

// Application ↔ ResumeAnalysis
Application.hasOne(ResumeAnalysis, { foreignKey: "application_id" });
ResumeAnalysis.belongsTo(Application, { foreignKey: "application_id" });

// Application ↔ AssessmentAnalysis
Application.hasOne(AssessmentAnalysis, { foreignKey: "application_id" });
AssessmentAnalysis.belongsTo(Application, { foreignKey: "application_id" });

// Application ↔ InterviewAnalysis
Application.hasOne(InterviewAnalysis, { foreignKey: "application_id" });
InterviewAnalysis.belongsTo(Application, { foreignKey: "application_id" });

// Application ↔ AIDecision
Application.hasOne(AIDecision, { foreignKey: "application_id" });
AIDecision.belongsTo(Application, { foreignKey: "application_id" });

// ===================== EXPORT =====================
module.exports = {
  sequelize,
  User,
  Candidate,
  Job,
  Application,
  TechnicalRound,
  Notification,
  // TODO: MCQ models commented out until they exist
  // MCQQuestion,
  // MCQTest,
  // MCQAnswer,
  Interview,
  InterviewAnswer,
  MalpracticeEvent,
  Offer,
  Resume,
  // New models
  ApplicationStatusLog,
  AssessmentAttempt,
  InterviewSession,
  CandidateSession,
  DocumentRecord,
  NotificationQueue,
  // Admin Panel Models
  AdminJob,
  AIConfig,
  AIModel,
  AdminWorkflow,
  OfferTemplate,
  AdminAuditLog,
  DataRetentionPolicy,
  SystemHealth,
  // Question Bank Models
  InterviewQuestionBank,
  TechnicalQuestionBank,
  // AI Analysis Models
  ResumeAnalysis,
  AssessmentAnalysis,
  InterviewAnalysis,
  AIDecision,
  // Scoring Models
  ManualJobMapping
};
