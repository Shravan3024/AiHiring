const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AssessmentAnalysis",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assessment_type: {
        type: DataTypes.STRING, // Changed from ENUM
        allowNull: false,
      },
      test_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
      },
      total_questions: {
        type: DataTypes.INTEGER,
      },
      candidate_response: {
        type: DataTypes.JSON,
      },
      overall_score: {
        type: DataTypes.FLOAT,
      },
      correctness_score: {
        type: DataTypes.FLOAT,
      },
      code_quality_score: {
        type: DataTypes.FLOAT,
      },
      efficiency_score: {
        type: DataTypes.FLOAT,
      },
      time_complexity: {
        type: DataTypes.STRING,
      },
      space_complexity: {
        type: DataTypes.STRING,
      },
      design_score: {
        type: DataTypes.FLOAT,
      },
      scalability_score: {
        type: DataTypes.FLOAT,
      },
      clarity_score: {
        type: DataTypes.FLOAT,
      },
      business_acumen_score: {
        type: DataTypes.FLOAT,
      },
      correct_answers: {
        type: DataTypes.INTEGER,
      },
      incorrect_answers: {
        type: DataTypes.INTEGER,
      },
      unattempted: {
        type: DataTypes.INTEGER,
      },
      topic_scores: {
        type: DataTypes.JSON,
      },
      strengths: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      weaknesses: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      improvement_areas: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      optimization_suggestions: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      design_issues: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      estimated_skill_level: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      estimated_years_experience: {
        type: DataTypes.INTEGER,
      },
      detailed_feedback: {
        type: DataTypes.TEXT,
      },
      follow_up_questions: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      red_flags: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      proctoring_data: {
        type: DataTypes.JSON,
      },
      ai_model_used: {
        type: DataTypes.STRING,
        defaultValue: "gemini-1.5-flash",
      },
      analysis_confidence: {
        type: DataTypes.FLOAT,
      },
      analyzed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      time_taken_minutes: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "assessment_analysis",
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
};
