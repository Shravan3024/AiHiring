const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AIConfig",
    {
      configId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      jobId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resumeWeight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.25,
      },
      mcqWeight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.25,
      },
      technicalWeight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.25,
      },
      interviewWeight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.25,
      },
      passingThreshold: {
        type: DataTypes.FLOAT,
        defaultValue: 0.6,
      },
      integrityPenalty: {
        type: DataTypes.FLOAT,
        defaultValue: 0.2,
      },
      confidenceWeighting: {
        type: DataTypes.JSON,
        defaultValue: {
          HIGH: 1.0,
          MEDIUM: 0.8,
          LOW: 0.5,
        },
      },
      prosConsRules: {
        type: DataTypes.JSON,
        defaultValue: {
          maxProsPerStage: 5,
          maxConsPerStage: 5,
          confidenceThreshold: 0.7,
          biasCheckEnabled: true,
        },
      },
      riskyWordings: {
        type: DataTypes.JSON,
        defaultValue: [
          "discriminatory",
          "biased",
          "stereotypical",
        ],
      },
      autoEscalateThreshold: {
        type: DataTypes.FLOAT,
        defaultValue: 0.85,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE", "TESTING"),
        defaultValue: "ACTIVE",
      },
    },
    {
      timestamps: true,
      tableName: "ai_config",
    }
  );
};
