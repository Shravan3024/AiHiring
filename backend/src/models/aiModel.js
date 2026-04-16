const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AIModel",
    {
      modelId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      modelVersion: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      modelType: {
        type: DataTypes.ENUM("RESUME_PARSER", "MCQ_EVALUATOR", "TECH_EVALUATOR", "INTERVIEW_EVALUATOR"),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE", "TESTING", "DEPRECATED"),
        defaultValue: "TESTING",
      },
      accuracy: {
        type: DataTypes.FLOAT,
        defaultValue: null,
      },
      totalEvaluations: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      correctEvaluations: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      failureRate: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      rollbackModelId: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      frozenCandidates: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      releaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
    },
    {
      timestamps: true,
      tableName: "ai_models",
    }
  );
};
