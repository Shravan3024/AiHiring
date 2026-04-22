const express = require("express");
const authenticateToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");

const {
  getHRs,
  createHR,
  deleteHR,
  updateHR,
  forceLogoutHR,
  getApprovalRules,
  createApprovalRule
} = require("../controllers/admin.controller");

const {
  createTechnicalQuestion,
  getTechnicalQuestions,
  deleteTechnicalQuestion,
  createMCQQuestion,
  getMCQQuestions,
  deleteMCQQuestion
} = require("../controllers/admin.question.controller");

const {
  getDashboardStats,
  getHiringVolumeTrend,
  getRoleWiseApplications,
  getFunnelAnalysis,
  getApprovalBottleneck,
  getSystemHealth,
} = require("../controllers/admin.dashboard.controller");

const {
  createJob,
  updateJob,
  getJobs,
  getJobById,
  activateJob,
  closeJob,
  deleteJob,
} = require("../controllers/admin.job.controller");

const {
  createAIConfig,
  updateAIConfig,
  getAIConfig,
  getAllAIConfigs,
  testAIConfig,
} = require("../controllers/admin.aiConfig.controller");

const {
  deployAIModel,
  activateAIModel,
  rollbackAIModel,
  getAIModels,
  updateModelAccuracy,
} = require("../controllers/admin.aiModel.controller");

const {
  createWorkflow,
  updateWorkflow,
  getWorkflows,
  getWorkflowByJobId,
} = require("../controllers/admin.workflow.controller");

const {
  createOfferTemplate,
  updateOfferTemplate,
  getOfferTemplates,
  getOfferTemplate,
} = require("../controllers/admin.offerTemplate.controller");

const {
  getAuditLogs,
  searchAuditLogs,
  getDataRetentionPolicy,
  updateDataRetentionPolicy,
  getSystemHealth: getSystemHealthAudit,
  updateSystemHealth,
} = require("../controllers/admin.audit.controller");

const { getNotifications } = require("../controllers/notification.controller");

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);
router.use(checkRole(["ADMIN"]));

// ===================== DASHBOARD =====================
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/hiring-trend", getHiringVolumeTrend);
router.get("/dashboard/role-applications", getRoleWiseApplications);
router.get("/dashboard/funnel", getFunnelAnalysis);
router.get("/dashboard/approval-bottleneck", getApprovalBottleneck);
router.get("/dashboard/system-health", getSystemHealth);

// ===================== JOB MANAGEMENT =====================
router.post("/jobs", createJob);
router.get("/jobs", getJobs);
router.get("/jobs/:jobId", getJobById);
router.put("/jobs/:jobId", updateJob);
router.patch("/jobs/:jobId/activate", activateJob);
router.patch("/jobs/:jobId/close", closeJob);
router.delete("/jobs/:jobId", deleteJob);

// ===================== AI CONFIGURATION =====================
router.post("/ai-config", createAIConfig);
router.get("/ai-config", getAllAIConfigs);
router.get("/ai-config/job/:jobId", getAIConfig);
router.put("/ai-config/:configId", updateAIConfig);
router.post("/ai-config/:configId/test", testAIConfig);

// ===================== AI MODEL MANAGEMENT =====================
router.post("/ai-models", deployAIModel);
router.get("/ai-models", getAIModels);
router.patch("/ai-models/:modelId/activate", activateAIModel);
router.post("/ai-models/:modelId/rollback", rollbackAIModel);
router.put("/ai-models/:modelId/accuracy", updateModelAccuracy);

// ===================== WORKFLOW MANAGEMENT =====================
router.post("/workflows", createWorkflow);
router.get("/workflows", getWorkflows);
router.get("/workflows/job/:jobId", getWorkflowByJobId);
router.put("/workflows/:workflowId", updateWorkflow);

// ===================== OFFER TEMPLATES =====================
router.post("/offer-templates", createOfferTemplate);
router.get("/offer-templates", getOfferTemplates);
router.get("/offer-templates/:templateId", getOfferTemplate);
router.put("/offer-templates/:templateId", updateOfferTemplate);

// ===================== AUDIT & COMPLIANCE =====================
router.get("/audit-logs", getAuditLogs);
router.get("/audit-logs/search", searchAuditLogs);
router.get("/data-retention-policy", getDataRetentionPolicy);
router.put("/data-retention-policy", updateDataRetentionPolicy);
router.get("/system-health", getSystemHealthAudit);
router.put("/system-health", updateSystemHealth);

// ===================== HR MANAGEMENT =====================
router.get("/hrs", getHRs);
router.post("/hrs", createHR);
router.put("/hrs/:id", updateHR);
router.delete("/hrs/:id", deleteHR);
router.post("/hrs/:id/logout", forceLogoutHR);

// ===================== APPROVAL RULES =====================
router.get("/approval-rules", getApprovalRules);
router.post("/approval-rules", createApprovalRule);

// ===================== NOTIFICATIONS =====================
router.get("/notifications", getNotifications);

// ===================== QUESTION BANK =====================
router.post("/questions/technical", createTechnicalQuestion);
router.get("/questions/technical", getTechnicalQuestions);
router.delete("/questions/technical/:questionId", deleteTechnicalQuestion);

router.post("/questions/mcq", createMCQQuestion);
router.get("/questions/mcq", getMCQQuestions);
router.delete("/questions/mcq/:id", deleteMCQQuestion);

module.exports = router;
