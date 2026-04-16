/**
 * AuditLogger Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralised, immutable audit log writer.
 * All writes go to AdminAuditLog (admin_audit_logs table).
 * Never throws — errors are swallowed so audit failures never break
 * the main business flow.
 */

const getModel = () => require("../models/index.js").AdminAuditLog;

/**
 * Extract a clean IP from the Express request object.
 * Handles proxies that populate x-forwarded-for.
 */
function resolveIP(req) {
  if (!req) return "INTERNAL";
  const forwarded = req.headers?.["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || req.connection?.remoteAddress || "UNKNOWN";
}

/**
 * Core write — every call goes through here.
 *
 * @param {object} entry
 * @param {string}  entry.actionType      - ENUM value from AdminAuditLog
 * @param {string}  entry.userId          - User who triggered the action
 * @param {string}  entry.userRole        - Role of the user
 * @param {string} [entry.entityType]     - e.g. "Application", "HRApprovalRule"
 * @param {string} [entry.entityId]       - PK of the affected entity
 * @param {object} [entry.oldValue]       - Snapshot before change
 * @param {object} [entry.newValue]       - Snapshot after change
 * @param {string}  entry.description     - Human-readable description
 * @param {string}  entry.ipAddress       - Client IP
 * @param {string} [entry.userAgent]      - Browser / client
 * @param {string} [entry.status]         - SUCCESS | FAILURE | SUSPICIOUS
 * @param {string} [entry.relatedAiModelVersion] - AI model version if relevant
 */
async function log(entry) {
  try {
    const AdminAuditLog = getModel();
    await AdminAuditLog.create({
      actionType: entry.actionType,
      userId: String(entry.userId ?? "SYSTEM"),
      userRole: entry.userRole ?? "SYSTEM",
      entityType: entry.entityType ?? null,
      entityId: entry.entityId ? String(entry.entityId) : null,
      oldValue: entry.oldValue ?? null,
      newValue: entry.newValue ?? null,
      description: entry.description ?? "",
      ipAddress: entry.ipAddress ?? "UNKNOWN",
      userAgent: entry.userAgent ?? null,
      status: entry.status ?? "SUCCESS",
      relatedAiModelVersion: entry.relatedAiModelVersion ?? null,
    });
  } catch (err) {
    // Audit failures must NOT crash the app
    console.error("[AuditLogger] Write failed:", err.message);
  }
}

// ─── Convenience helpers ─────────────────────────────────────────────────────

/**
 * Log a LOGIN event.
 */
async function logLogin(req, user, status = "SUCCESS") {
  await log({
    actionType: "LOGIN",
    userId: user?.id ?? "UNKNOWN",
    userRole: user?.role ?? "UNKNOWN",
    entityType: "User",
    entityId: user?.id,
    description: `User "${user?.email}" logged in`,
    ipAddress: resolveIP(req),
    userAgent: req?.headers?.["user-agent"],
    status,
  });
}

/**
 * Log a LOGOUT event.
 */
async function logLogout(req, user) {
  await log({
    actionType: "LOGOUT",
    userId: user?.id ?? "UNKNOWN",
    userRole: user?.role ?? "UNKNOWN",
    entityType: "User",
    entityId: user?.id,
    description: `User "${user?.email ?? user?.id}" logged out`,
    ipAddress: resolveIP(req),
    userAgent: req?.headers?.["user-agent"],
    status: "SUCCESS",
  });
}

/**
 * Log an HR_DECISION event.
 */
async function logHRDecision(req, { applicationId, decision, previousStatus, newStatus, reason }) {
  await log({
    actionType: "HR_DECISION",
    userId: req.user?.id,
    userRole: req.user?.role ?? "HR",
    entityType: "Application",
    entityId: applicationId,
    oldValue: { status: previousStatus },
    newValue: { status: newStatus, decision, reason },
    description: `HR decision "${decision}" on application #${applicationId}`,
    ipAddress: resolveIP(req),
    userAgent: req.headers?.["user-agent"],
    status: "SUCCESS",
  });
}

/**
 * Log an AI recommendation.
 */
async function logAIRecommendation(req, { applicationId, aiDecision, confidence, modelVersion }) {
  await log({
    actionType: "AI_RECOMMENDATION",
    userId: req.user?.id ?? "AI_SYSTEM",
    userRole: req.user?.role ?? "SYSTEM",
    entityType: "Application",
    entityId: applicationId,
    newValue: { aiDecision, confidence },
    description: `AI recommended "${aiDecision}" for application #${applicationId} (confidence: ${confidence}%)`,
    ipAddress: resolveIP(req),
    userAgent: req.headers?.["user-agent"],
    status: "SUCCESS",
    relatedAiModelVersion: modelVersion,
  });
}

/**
 * Log an APPROVAL_FLOW event.
 */
async function logApprovalFlow(req, { applicationId, stage, approvalDecision, hrUserId }) {
  await log({
    actionType: "APPROVAL_FLOW",
    userId: hrUserId ?? req.user?.id,
    userRole: req.user?.role ?? "HR",
    entityType: "Application",
    entityId: applicationId,
    newValue: { stage, approvalDecision },
    description: `Approval flow event: stage="${stage}" decision="${approvalDecision}" for application #${applicationId}`,
    ipAddress: resolveIP(req),
    userAgent: req.headers?.["user-agent"],
    status: "SUCCESS",
  });
}

/**
 * Log a RULE_CHANGED event.
 */
async function logRuleChange(req, { entityType, entityId, oldValue, newValue, description }) {
  await log({
    actionType: "RULE_CHANGED",
    userId: req.user?.id,
    userRole: req.user?.role ?? "ADMIN",
    entityType,
    entityId,
    oldValue,
    newValue,
    description: description ?? `Rule changed on ${entityType} #${entityId}`,
    ipAddress: resolveIP(req),
    userAgent: req.headers?.["user-agent"],
    status: "SUCCESS",
  });
}

/**
 * Log a CONFIG_CHANGED event.
 */
async function logConfigChange(req, { entityType, entityId, oldValue, newValue, description }) {
  await log({
    actionType: "CONFIG_CHANGED",
    userId: req.user?.id,
    userRole: req.user?.role ?? "ADMIN",
    entityType,
    entityId,
    oldValue,
    newValue,
    description: description ?? `Config changed on ${entityType} #${entityId}`,
    ipAddress: resolveIP(req),
    userAgent: req.headers?.["user-agent"],
    status: "SUCCESS",
  });
}

/**
 * Log a MODEL_DEPLOYED event.
 */
async function logModelDeployed(req, { modelId, modelVersion, modelType }) {
  await log({
    actionType: "MODEL_DEPLOYED",
    userId: req.user?.id,
    userRole: req.user?.role ?? "ADMIN",
    entityType: "AIModel",
    entityId: modelId,
    newValue: { modelVersion, modelType },
    description: `AI model "${modelVersion}" (${modelType}) deployed`,
    ipAddress: resolveIP(req),
    userAgent: req.headers?.["user-agent"],
    status: "SUCCESS",
    relatedAiModelVersion: modelVersion,
  });
}

/**
 * Log a MODEL_ROLLBACK event.
 */
async function logModelRollback(req, { modelId, fromVersion, toVersion }) {
  await log({
    actionType: "MODEL_ROLLBACK",
    userId: req.user?.id,
    userRole: req.user?.role ?? "ADMIN",
    entityType: "AIModel",
    entityId: modelId,
    oldValue: { modelVersion: fromVersion },
    newValue: { modelVersion: toVersion },
    description: `AI model rolled back from "${fromVersion}" to "${toVersion}"`,
    ipAddress: resolveIP(req),
    userAgent: req.headers?.["user-agent"],
    status: "SUCCESS",
    relatedAiModelVersion: toVersion,
  });
}

/**
 * Log any generic job change.
 */
async function logJobChange(req, { actionType, jobId, oldValue, newValue, description }) {
  await log({
    actionType,
    userId: req.user?.id,
    userRole: req.user?.role ?? "ADMIN",
    entityType: "Job",
    entityId: jobId,
    oldValue,
    newValue,
    description,
    ipAddress: resolveIP(req),
    userAgent: req.headers?.["user-agent"],
    status: "SUCCESS",
  });
}

module.exports = {
  log,
  resolveIP,
  logLogin,
  logLogout,
  logHRDecision,
  logAIRecommendation,
  logApprovalFlow,
  logRuleChange,
  logConfigChange,
  logModelDeployed,
  logModelRollback,
  logJobChange,
};
