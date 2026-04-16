const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "DataRetentionPolicy",
    {
      policyId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      resumeRetentionDays: {
        type: DataTypes.INTEGER,
        defaultValue: 730, // 2 years
      },
      interviewVideoRetentionDays: {
        type: DataTypes.INTEGER,
        defaultValue: 365, // 1 year
      },
      archivedCandidateRetentionDays: {
        type: DataTypes.INTEGER,
        defaultValue: 180, // 6 months
      },
      rejectionFeedbackRetentionDays: {
        type: DataTypes.INTEGER,
        defaultValue: 90, // 3 months
      },
      anonymizationEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      gdprCompliant: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      dataEncrypted: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      autoDeleteEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastAuditDate: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "data_retention_policies",
    }
  );
};
