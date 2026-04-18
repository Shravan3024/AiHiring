const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TechnicalQuestionBank",
    {
      questionId: {
        type: DataTypes.STRING,
        primaryKey: true,
        field: "questionId",
        defaultValue: () => `tq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      jobRole: {
        type: DataTypes.ENUM(
          "MANAGEMENT_TRAINEE_MARKETING",
          "ASSISTANT_MANAGER_MARKETING",
          "EXECUTIVE_MARKETING",
          "RUBBER_PROCESS_ENGINEER"
        ),
        allowNull: false,
        field: "jobRole",
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.ENUM("EASY", "MEDIUM", "HARD"),
        defaultValue: "MEDIUM",
      },
      weight: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        field: "section_weight"
      },
      questionType: {
        type: DataTypes.STRING, // Changed from ENUM to allow more flexibility: MCQ, SCENARIO, APTITUDE, BEHAVIORAL, etc.
        defaultValue: "THEORY",
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // For MCQ
      options: {
        type: DataTypes.JSON, // ["a) Option 1", "b) Option 2", "c) Option 3", "d) Option 4"]
        defaultValue: [],
      },
      correct_answer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // For Coding/Debugging/AI Analysis
      expected_answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      evaluation_type: {
        type: DataTypes.STRING, // MCQ, AI
        defaultValue: "AI",
      },
      section_type: {
        type: DataTypes.STRING, // MCQ, SCENARIO, APTITUDE, TECHNICAL, BEHAVIORAL, etc.
        allowNull: true,
      },
      codeSnippet: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      expectedOutput: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      testCases: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      hints: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      keywords: {
        type: DataTypes.JSON,
        defaultValue: [],
        field: "scoring_keywords"
      },
      estimatedTime: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
      },
      maxAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
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
      tableName: "technical_question_bank",
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
};

