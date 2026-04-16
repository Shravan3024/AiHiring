const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AdminJob",
    {
      jobId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      jobTitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requiredSkills: {
        type: DataTypes.JSON, // Array of {skill, priority}
        allowNull: false,
      },
      experienceMin: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      experienceMax: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
      },
      hiringUrgency: {
        type: DataTypes.ENUM("NORMAL", "FAST_TRACK", "CRITICAL"),
        defaultValue: "NORMAL",
      },
      maxApplications: {
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM("DRAFT", "ACTIVE", "CLOSED", "ARCHIVED"),
        defaultValue: "DRAFT",
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      approvalRequirements: {
        type: DataTypes.JSON, // Multi-HR approval config
        defaultValue: null,
      },
      workflowStages: {
        type: DataTypes.JSON, // Stages for this job
        defaultValue: null,
      },
    },
    {
      timestamps: true,
      tableName: "admin_jobs",
    }
  );
};
