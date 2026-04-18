const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "InterviewQuestionBank",
    {
      questionId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `iq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      jobId: {
        type: DataTypes.INTEGER,
        field: 'job_id',
        allowNull: true
      },
      jobRole: {
        type: DataTypes.ENUM(
          "SENIOR_AI_ENGINEER",
          "FULL_STACK_DEVELOPER",
          "DATA_SCIENTIST",
          "QA_ENGINEER",
          "DEVOPS_ENGINEER",
          "MANAGEMENT_TRAINEE_MARKETING",
          "EXECUTIVE_MARKETING",
          "ASSISTANT_MANAGER_MARKETING",
          "RUBBER_PROCESS_ENGINEER"
        ),
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM(
          "INTRODUCTORY",
          "TECHNICAL_DEEP_DIVE",
          "SYSTEM_DESIGN",
          "BEHAVIORAL",
          "PROBLEM_SOLVING",
          "REAL_WORLD_SCENARIO"
        ),
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.ENUM("EASY", "MEDIUM", "HARD"),
        defaultValue: "MEDIUM",
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expectedAnswer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      keywords: {
        type: DataTypes.JSON, // ["keyword1", "keyword2"]
        defaultValue: [],
      },
      followUpQuestions: {
        type: DataTypes.JSON, // [{ question, expectedKeywords }]
        defaultValue: [],
      },
      scoringRubric: {
        type: DataTypes.JSON, // { excellent: {}, good: {}, poor: {} }
        defaultValue: {
          excellent: "Comprehensive answer with examples",
          good: "Correct with minor gaps",
          average: "Basic understanding shown",
          poor: "Incorrect or incomplete",
        },
      },
      estimatedTime: {
        type: DataTypes.INTEGER, // in minutes
        defaultValue: 5,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "interview_question_bank",
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
};
