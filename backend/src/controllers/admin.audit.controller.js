const { AdminAuditLog, DataRetentionPolicy, SystemHealth } = require("../models/index.js");
const { Op } = require("sequelize");
const auditLogger = require("../services/auditLogger.service");

const getAuditLogs = async (req, res) => {
  try {
    const { limit = 50, offset = 0, actionType, userId } = req.query;

    const where = {};
    if (actionType) where.actionType = actionType;
    if (userId) where.userId = userId;

    const logs = await AdminAuditLog.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["timestamp", "DESC"]],
    });

    const total = await AdminAuditLog.count({ where });

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching audit logs",
      error: error.message,
    });
  }
};

const searchAuditLogs = async (req, res) => {
  try {
    const { entityId, actionType, dateRange } = req.query;

    const where = {};
    if (entityId) where.entityId = entityId;
    if (actionType) where.actionType = actionType;

    if (dateRange) {
      const [startDate, endDate] = dateRange.split(",");
      where.timestamp = {
        [Op.gte]: new Date(startDate),
        [Op.lte]: new Date(endDate),
      };
    }

    const logs = await AdminAuditLog.findAll({
      where,
      order: [["timestamp", "DESC"]],
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching audit logs",
      error: error.message,
    });
  }
};

const getDataRetentionPolicy = async (req, res) => {
  try {
    let policy = await DataRetentionPolicy.findOne({
      order: [["createdAt", "DESC"]],
    });

    if (!policy) {
      policy = await DataRetentionPolicy.create({
        createdBy: "SYSTEM",
      });
    }

    res.json({
      success: true,
      data: policy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching data retention policy",
      error: error.message,
    });
  }
};

const updateDataRetentionPolicy = async (req, res) => {
  try {
    let policy = await DataRetentionPolicy.findOne({
      order: [["createdAt", "DESC"]],
    });

    if (!policy) {
      policy = await DataRetentionPolicy.create({
        ...req.body,
        createdBy: req.user.id,
      });
    } else {
      await policy.update(req.body);
    }

    await auditLogger.logRuleChange(req, {
      entityType: "DATA_RETENTION_POLICY",
      entityId: String(policy.policyId),
      newValue: policy,
      description: "Data retention policy updated",
    });

    res.json({
      success: true,
      message: "Data retention policy updated",
      data: policy,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating data retention policy",
      error: error.message,
    });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const health = await SystemHealth.findOne({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching system health",
      error: error.message,
    });
  }
};

const updateSystemHealth = async (req, res) => {
  try {
    const health = await SystemHealth.create(req.body);

    if (req.body.failedAiTasks > 0 || req.body.databaseHealth === "CRITICAL") {
      await auditLogger.log({
        actionType: "RULE_CHANGED",
        userId: "SYSTEM",
        userRole: "SYSTEM",
        entityType: "SYSTEM_HEALTH",
        entityId: String(health.healthId),
        description: "Critical system health alert",
        ipAddress: "INTERNAL",
        userAgent: "SYSTEM_MONITOR",
        status: "SUSPICIOUS",
        newValue: health,
      });
    }

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating system health",
      error: error.message,
    });
  }
};

const getAuditStats = async (req, res) => {
  try {
    const stats = await AdminAuditLog.findAll({
      attributes: [
        "actionType",
        [AdminAuditLog.sequelize.fn("COUNT", AdminAuditLog.sequelize.col("auditId")), "count"],
      ],
      group: ["actionType"],
    });

    const statusStats = await AdminAuditLog.findAll({
      attributes: [
        "status",
        [AdminAuditLog.sequelize.fn("COUNT", AdminAuditLog.sequelize.col("auditId")), "count"],
      ],
      group: ["status"],
    });

    res.json({
      success: true,
      data: {
        actions: stats,
        status: statusStats,
      },
    });
  } catch (error) {
    console.error("getAuditStats error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const exportAuditLogs = async (req, res) => {
  try {
    const { format = "json" } = req.query;
    const logs = await AdminAuditLog.findAll({ order: [["timestamp", "DESC"]] });

    if (format === "csv") {
      // Simple CSV generation
      const headers = "ID,Type,User,Role,Entity,EntityID,Description,IP,Status,Timestamp\n";
      const rows = logs.map(l => {
        const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
        return [
          l.auditId, l.actionType, l.userId, l.userRole, 
          l.entityType, l.entityId, l.description, 
          l.ipAddress, l.status, l.timestamp
        ].map(escape).join(",");
      }).join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.attachment("audit-logs.csv");
      return res.send(headers + rows);
    }

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const triggerAiRetry = async (req, res) => {
  try {
    const { applicationId, taskType } = req.body;
    const aiController = require("./ai.controller.complete.js");
    
    // Create a mock req/res to call the controller function internally
    const mockReq = { 
      body: { applicationId, jobId: req.body.jobId },
      params: { applicationId },
      user: req.user,
      file: req.file // if resume retry
    };
    
    const mockRes = {
      json: (data) => res.json(data),
      status: (code) => ({ json: (data) => res.status(code).json(data) })
    };

    if (taskType === "RESUME_PARSING") {
      return aiController.parseResumeWithAI(mockReq, mockRes);
    } else if (taskType === "FINAL_DECISION") {
      return aiController.makeFinalAIDecision(mockReq, mockRes);
    } else {
      return res.status(400).json({ success: false, message: "Invalid task type for retry" });
    }
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  getAuditLogs,
  searchAuditLogs,
  getDataRetentionPolicy,
  updateDataRetentionPolicy,
  getSystemHealth,
  updateSystemHealth,
  getAuditStats,
  exportAuditLogs,
  triggerAiRetry,
};
