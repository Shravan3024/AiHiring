const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "InterviewAnalysis",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      interview_session_id: {
        type: DataTypes.INTEGER,
      },
      interview_type: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      interviewer_name: {
        type: DataTypes.STRING,
      },
      interview_duration_minutes: {
        type: DataTypes.INTEGER,
      },
      transcript: {
        type: DataTypes.TEXT,
      },
      qa_pairs: {
        type: DataTypes.JSON,
      },
      overall_score: {
        type: DataTypes.FLOAT,
      },
      technical_knowledge_score: {
        type: DataTypes.FLOAT,
        defaultValue: null,
      },
      problem_solving_score: {
        type: DataTypes.FLOAT,
        defaultValue: null,
      },
      communication_score: {
        type: DataTypes.FLOAT,
        defaultValue: null,
      },
      soft_skills_score: {
        type: DataTypes.FLOAT,
        defaultValue: null,
      },
      cultural_fit_score: {
        type: DataTypes.FLOAT,
        defaultValue: null,
      },
      answer_analyses: {
        type: DataTypes.JSON,
      },
      confidence_level: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      communication_style: {
        type: DataTypes.STRING,
      },
      pace: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      clarity: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      hesitation_level: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      vocabulary_level: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      strengths: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      weaknesses: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      key_takeaways: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      green_flags: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      red_flags: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      predicted_on_job_performance: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      performance_confidence_percentage: {
        type: DataTypes.FLOAT,
      },
      time_to_productivity_months: {
        type: DataTypes.INTEGER,
      },
      retention_probability_percentage: {
        type: DataTypes.FLOAT,
      },
      team_fit_assessment: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      growth_trajectory: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      follow_up_questions: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      further_discussion_topics: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      hire_recommendation: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      recommendation_confidence: {
        type: DataTypes.FLOAT,
      },
      next_round_ready: {
        type: DataTypes.BOOLEAN,
      },
      detailed_evaluation: {
        type: DataTypes.TEXT,
      },
      scoring_rationale: {
        type: DataTypes.TEXT,
      },
      ai_model_used: {
        type: DataTypes.STRING,
        defaultValue: "gemini-1.5-flash-latest",
      },
      analysis_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      analyzed_by: {
        type: DataTypes.STRING,
      },
    },
    {
      tableName: "interview_analysis",
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
};
