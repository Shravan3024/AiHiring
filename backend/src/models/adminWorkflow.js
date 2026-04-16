const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AdminWorkflow",
    {
      workflowId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      jobId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      workflowName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      stages: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      stageOrder: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      mandatoryStages: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      optionalStages: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      retryRules: {
        type: DataTypes.JSON,
        defaultValue: { maxRetries: 3, coolOffPeriodDays: 7 },
      },
      coolingOffPeriods: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      approvalRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "admin_workflows",
    }
  );
};
