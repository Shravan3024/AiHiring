const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AdminAuditLog",
    {
      auditId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      actionType: {
        type: DataTypes.ENUM(
          // Job lifecycle
          "JOB_CREATED",
          "JOB_UPDATED",
          "JOB_DELETED",
          // HR actions
          "HR_DECISION",
          // AI
          "AI_RECOMMENDATION",
          "VIEW_ANALYSIS",
          "VIEW_ANALYTICS",
          "FINAL_DECISION",
          "RESUME_PARSE",
          "CODING_ANALYSIS",
          "INTERVIEW_ANALYSIS",
          // Approval workflow
          "APPROVAL_FLOW",
          // Rule & config changes
          "RULE_CHANGED",
          "CONFIG_CHANGED",
          // Auth / access
          "LOGIN",
          "LOGOUT",
          "ACCESS_REVOKED",
          // Model lifecycle
          "MODEL_DEPLOYED",
          "MODEL_ROLLBACK"
        ),
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userRole: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      entityType: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "e.g. Application, Job, HRApprovalRule, AIModel, User",
      },
      entityId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      oldValue: {
        type: DataTypes.JSON,
        defaultValue: null,
        comment: "State before change (for immutable diff view)",
      },
      newValue: {
        type: DataTypes.JSON,
        defaultValue: null,
        comment: "State after change",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userAgent: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM("SUCCESS", "FAILURE", "SUSPICIOUS"),
        defaultValue: "SUCCESS",
      },
      relatedAiModelVersion: {
        type: DataTypes.STRING,
        defaultValue: null,
        comment: "AI model version tag used at the time of decision",
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: null,
        comment: "Flexible extra payload (confidence, AI config id, etc.)",
      },
    },
    {
      tableName: "admin_audit_logs",
      timestamps: true,
      createdAt: "timestamp",
      updatedAt: false,
      indexes: [
        { fields: ["actionType"] },
        { fields: ["userId"] },
        { fields: ["entityType", "entityId"] },
        { fields: ["status"] },
        { fields: ["timestamp"] },
      ],
    }
  );
};
