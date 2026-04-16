const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JSON_TYPE = sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.JSON;
  const ARRAY_STRING = sequelize.getDialect() === 'postgres' ? DataTypes.ARRAY(DataTypes.STRING) : DataTypes.JSON;

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
        type: DataTypes.ENUM("coding", "mcq", "design", "case_study"),
        allowNull: false,
        comment: "Type of technical assessment",
      },
      // Test Metadata
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
      // Raw Response Data
      candidate_response: {
        type: JSON_TYPE,
        comment: "Raw response from candidate (code, answers, design, etc)",
      },
      // AI Analysis Results
      overall_score: {
        type: DataTypes.FLOAT,
        comment: "Overall assessment score (0-100)",
      },
      // Assessment Type Specific Scores
      correctness_score: {
        type: DataTypes.FLOAT,
        comment: "For coding/MCQ: correctness (0-100)",
      },
      code_quality_score: {
        type: DataTypes.FLOAT,
        comment: "For coding: code quality, readability (0-100)",
      },
      efficiency_score: {
        type: DataTypes.FLOAT,
        comment: "For coding: time/space complexity (0-100)",
      },
      time_complexity: {
        type: DataTypes.STRING,
        comment: "For coding: e.g., O(n log n)",
      },
      space_complexity: {
        type: DataTypes.STRING,
        comment: "For coding: e.g., O(1)",
      },
      design_score: {
        type: DataTypes.FLOAT,
        comment: "For design: architecture quality (0-100)",
      },
      scalability_score: {
        type: DataTypes.FLOAT,
        comment: "For design: scalability (0-100)",
      },
      clarity_score: {
        type: DataTypes.FLOAT,
        comment: "For design/case_study: clarity of explanation (0-100)",
      },
      business_acumen_score: {
        type: DataTypes.FLOAT,
        comment: "For case_study: business understanding (0-100)",
      },
      // MCQ Specific
      correct_answers: {
        type: DataTypes.INTEGER,
        comment: "Number of correct answers",
      },
      incorrect_answers: {
        type: DataTypes.INTEGER,
        comment: "Number of incorrect answers",
      },
      unattempted: {
        type: DataTypes.INTEGER,
        comment: "Number of unattempted questions",
      },
      // Topic-wise breakdown
      topic_scores: {
        type: JSON_TYPE,
        comment: "{topic_name: {score: 0-100, questions: 5, correct: 4}}",
      },
      // AI Analysis Fields
      strengths: {
        type: ARRAY_STRING,
        comment: "What candidate did well",
      },
      weaknesses: {
        type: ARRAY_STRING,
        comment: "Areas needing improvement",
      },
      improvement_areas: {
        type: ARRAY_STRING,
        comment: "Specific topics to focus on",
      },
      optimization_suggestions: {
        type: ARRAY_STRING,
        comment: "For coding: optimization ideas",
      },
      design_issues: {
        type: ARRAY_STRING,
        comment: "For design: identified issues",
      },
      // Skill Assessment
      estimated_skill_level: {
        type: DataTypes.ENUM("junior", "mid_level", "senior", "expert"),
        comment: "Inferred skill level from performance",
      },
      estimated_years_experience: {
        type: DataTypes.INTEGER,
        comment: "Estimated professional experience level",
      },
       
      detailed_feedback: {
        type: DataTypes.TEXT,
        comment: "Detailed human-readable feedback",
      },
      follow_up_questions: {
        type: ARRAY_STRING,
        comment: "Questions to ask in interview",
      },
      red_flags: {
        type: ARRAY_STRING,
        comment: "Potential concerns identified",
      },
      // Proctoring (if applicable)
      proctoring_data: {
        type: JSON_TYPE,
        comment: "{has_cheating_suspicion: false, violations: [], suspicious_events: []}",
      },
      // Metadata
      ai_model_used: {
        type: DataTypes.STRING,
        defaultValue: "gemini-2.5-flash",
        comment: "AI model used for analysis",
      },
      analysis_confidence: {
        type: DataTypes.FLOAT,
        comment: "AI confidence in the analysis (0-100)",
      },
      analyzed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      time_taken_minutes: {
        type: DataTypes.INTEGER,
        comment: "How long candidate took to complete",
      },
    },
    {
      tableName: "assessment_analysis",
      timestamps: true,
    }
  );
};
