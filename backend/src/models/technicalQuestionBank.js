const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "TechnicalQuestionBank",
    {
      questionId: {
  type: DataTypes.STRING,
  primaryKey: true,
  field: "questionId", // 🔥 FIX
  defaultValue: () => `tq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
},
      jobRole: {
        type: DataTypes.ENUM(
          "MANAGEMENT_TRAINEE_MARKETING",
          "ASSISTANT_MANAGER_MARKETING",
          "EXECUTIVE_MARKETING",
          "RUBBER_PROCESS_ENGINEER"
        ),
        allowNull: false,
        field: "jobRole", // 🔥 FIX
      },
      topic: {
        type: DataTypes.STRING, // e.g., "Machine Learning", "React", "Data Structures"
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.ENUM("EASY", "MEDIUM", "HARD"),
        defaultValue: "MEDIUM",
      },
      questionType: {
        type: DataTypes.ENUM("MCQ", "CODING", "THEORY", "DEBUGGING"),
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
        type: DataTypes.STRING, // The correct option text, e.g., "c) Option 3"
        allowNull: true,
      },
      // For Coding/Debugging
      codeSnippet: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      expectedOutput: {
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      testCases: {
        type: DataTypes.JSON, // [{ input, expectedOutput }]
        defaultValue: [],
      },
      // General
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true, // Nullable for some question types
      },
      hints: {
        type: DataTypes.JSON, // ["hint1", "hint2"]
        defaultValue: [],
      },
      keywords: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      estimatedTime: {
        type: DataTypes.INTEGER, // in minutes
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
    }
  );
};
