const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "SystemHealth",
    {
      healthId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      resumeParsingFailures: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      interviewAiCrashes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      emailFailures: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      longRunningApprovals: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      averageApprovalTime: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      databaseHealth: {
        type: DataTypes.ENUM("HEALTHY", "DEGRADED", "CRITICAL"),
        defaultValue: "HEALTHY",
      },
      apiResponseTime: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      systemLoadPercentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      pendingAiTasks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      failedAiTasks: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastHealthCheck: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      criticalAlerts: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
    },
    {
      timestamps: true,
      tableName: "system_health",
    }
  );
};
