const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JSON_TYPE = sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.JSON;
  const ARRAY_STRING = sequelize.getDialect() === 'postgres' ? DataTypes.ARRAY(DataTypes.STRING) : DataTypes.JSON;

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
        comment: "Reference to application",
      },
      candidate_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      job_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Component Scores (Individual Assessments)
      resume_score: {
        type: DataTypes.FLOAT,
        comment: "Resume evaluation score (0-100)",
      },
      resume_weight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.3,
        comment: "Weight in final decision",
      },
      technical_assessment_score: {
        type: DataTypes.FLOAT,
        comment: "Technical test score (0-100)",
      },
      technical_weight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.4,
        comment: "Weight in final decision",
      },
      interview_score: {
        type: DataTypes.FLOAT,
        comment: "Interview evaluation score (0-100)",
      },
      interview_weight: {
        type: DataTypes.FLOAT,
        defaultValue: 0.3,
        comment: "Weight in final decision",
      },
      // Final Decision Score
      final_score: {
        type: DataTypes.FLOAT,
        comment: "Weighted final score: resume*0.3 + technical*0.4 + interview*0.3",
      },
      score_threshold: {
        type: DataTypes.FLOAT,
        comment: "Cutoff score for this role/level",
      },
      // Qualification Assessment
      meets_minimum_requirements: {
        type: DataTypes.BOOLEAN,
        comment: "Does candidate meet minimum qualifications",
      },
      has_required_skills: {
        type: DataTypes.BOOLEAN,
        comment: "Does candidate have all required skills",
      },
      experience_aligned: {
        type: DataTypes.BOOLEAN,
        comment: "Is experience level appropriate",
      },
      // Final Decision
      ai_decision: {
        type: DataTypes.ENUM("AUTO_REJECTED", "PROCEED_TO_HR", "RECOMMENDED", "AUTO_SELECTED"),
        comment: "Final AI decision on candidate",
      },
      decision_reason: {
        type: DataTypes.TEXT,
        comment: "Explanation of why this decision was made",
      },
      confidence_percentage: {
        type: DataTypes.FLOAT,
        comment: "AI confidence in recommendation (0-100)",
      },
      // Ranking & Comparison
      ranked_position: {
        type: DataTypes.INTEGER,
        comment: "Rank among all candidates for this job",
      },
      percentile_rank: {
        type: DataTypes.FLOAT,
        comment: "What percentage of candidates are better (0-100)",
      },
      score_distribution_percentile: {
        type: DataTypes.FLOAT,
        comment: "Score as percentile of score distribution",
      },
      // Detailed Scoring Breakdown
      scoring_breakdown: {
        type: JSON_TYPE,
        comment: {
          technical_alignment: "0-100",
          experience_fit: "0-100",
          skill_match: "0-100",
          communication_ability: "0-100",
          cultural_fit: "0-100",
          growth_potential: "0-100",
        },
      },
      // Risk Assessment
      risk_level: {
        type: DataTypes.ENUM("low", "medium", "high"),
        comment: "Risk level if hired",
      },
      risk_factors: {
        type: ARRAY_STRING,
        comment: "Identified risk factors",
      },
      
      summary: {
        type: DataTypes.TEXT,
        comment: "Executive summary of decision",
      },
      strengths_summary: {
        type: DataTypes.TEXT,
        comment: "Summary of key strengths",
      },
      concerns_summary: {
        type: DataTypes.TEXT,
        comment: "Summary of concerns or gaps",
      },
      recommendations_for_hr: {
        type: ARRAY_STRING,
        comment: "What HR should look for",
      },
      // Alternative Candidates
      top_alternatives: {
        type: JSON_TYPE,
        comment: "[{candidate_id, score, reason}] for comparison",
      },
      // Decision Timeline
      decision_made_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      hr_review_decision: {
        type: DataTypes.ENUM("APPROVED", "REJECTED", "NEEDS_CLARIFICATION", "PENDING"),
        defaultValue: "PENDING",
        comment: "HR's decision after reviewing AI recommendation",
      },
      hr_review_notes: {
        type: DataTypes.TEXT,
        comment: "HR's additional notes/reasoning",
      },
      md_approval: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "MD final approval",
      },
      // Audit Trail
      decision_version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: "Track if decision was recalculated",
      },
      previous_decision: {
        type: DataTypes.ENUM("AUTO_REJECTED", "PROCEED_TO_HR", "RECOMMENDED", "AUTO_SELECTED"),
        comment: "Previous decision if recalculated",
      },
      recalculation_reason: {
        type: DataTypes.STRING,
        comment: "Why decision was recalculated",
      },
      // Metadata
      ai_model_used: {
        type: DataTypes.STRING,
        defaultValue: "gemini-1.5-flash",
        comment: "AI model used for decision",
      },
      decision_type: {
        type: DataTypes.ENUM("automated", "manual_override", "appeal_reconsideration"),
        defaultValue: "automated",
      },
      is_appeal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Is this an appeal reconsideration",
      },
    },
    {
      tableName: "ai_decisions",
      timestamps: true,
    }
  );
};
