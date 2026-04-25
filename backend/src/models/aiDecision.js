const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "AIDecision",
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
      candidate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      resume_score: {
        type: DataTypes.FLOAT,
      },
      resume_weight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.3,
      },
      technical_assessment_score: {
        type: DataTypes.FLOAT,
      },
      technical_weight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.4,
      },
      interview_score: {
        type: DataTypes.FLOAT,
      },
      interview_weight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.3,
      },
      final_score: {
        type: DataTypes.FLOAT,
      },
      score_threshold: {
        type: DataTypes.FLOAT,
      },
      meets_minimum_requirements: {
        type: DataTypes.BOOLEAN,
      },
      has_required_skills: {
        type: DataTypes.BOOLEAN,
      },
      experience_aligned: {
        type: DataTypes.BOOLEAN,
      },
      ai_decision: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      decision_reason: {
        type: DataTypes.TEXT,
      },
      confidence_percentage: {
        type: DataTypes.FLOAT,
      },
      ranked_position: {
        type: DataTypes.INTEGER,
      },
      percentile_rank: {
        type: DataTypes.FLOAT,
      },
      score_distribution_percentile: {
        type: DataTypes.FLOAT,
      },
      scoring_breakdown: {
        type: DataTypes.JSON,
      },
      risk_level: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      risk_factors: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      summary: {
        type: DataTypes.TEXT,
      },
      strengths_summary: {
        type: DataTypes.TEXT,
      },
      concerns_summary: {
        type: DataTypes.TEXT,
      },
      recommendations_for_hr: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      top_alternatives: {
        type: DataTypes.JSON,
      },
      decision_made_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      hr_review_decision: {
        type: DataTypes.STRING, // Changed from ENUM
        defaultValue: "PENDING",
      },
      hr_review_notes: {
        type: DataTypes.TEXT,
      },
      md_approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      decision_version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      previous_decision: {
        type: DataTypes.STRING, // Changed from ENUM
      },
      recalculation_reason: {
        type: DataTypes.STRING,
      },
      ai_model_used: {
        type: DataTypes.STRING,
        defaultValue: "gemini-2.0-flash",
      },

      decision_type: {
        type: DataTypes.STRING, // Changed from ENUM
        defaultValue: "automated",
      },
      is_appeal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "ai_decisions",
      freezeTableName: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
};
