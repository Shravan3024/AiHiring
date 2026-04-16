const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Application", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    education: DataTypes.STRING,
    specialization: DataTypes.STRING,
    experience_years: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM(
        "APPLIED",
        "RESUME_SUBMITTED",
        "RESUME_EVALUATED",
        "ASSESSMENT_UNLOCKED",
        "TECHNICAL_ROUND_PENDING",
        "TECHNICAL_ROUND_IN_PROGRESS",
        "TECHNICAL_ROUND_COMPLETED",
        "INTERVIEW_UNLOCKED",
        "INTERVIEW_SCHEDULED",
        "INTERVIEW_IN_PROGRESS",
        "INTERVIEW_COMPLETED",
        "RE_INTERVIEW_REQUESTED",
        "HR_REVIEW",
        "SELECTED",
        "OFFERED",
        "HIRED",
        "OFFER_REJECTED",
        "REJECTED",
        "REJECTED_BY_CANDIDATE",
        "AUTO_REJECTED",
        "RECOMMENDED_BY_AI",
        "PROCEED_TO_HR"
      ),
      defaultValue: "APPLIED"
    },
    attempt_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "Track how many times the candidate has applied for this role"
    },
    resume_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "AI resume matching score (0-100)"
    },
    technical_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Technical assessment score"
    },
    interview_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "AI interview analysis score"
    },
    hr_decision: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hr_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Internal notes (not visible to candidate)"
    },
    overall_score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "Combined score from all rounds"
    },
    resume_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Public URL to the uploaded resume file"
    },
    skills: {
      type: sequelize.getDialect() === 'postgres' ? DataTypes.ARRAY(DataTypes.TEXT) : DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      comment: "Parsed skills from resume"
    },
    cgpa: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "CGPA extracted from resume"
    },
    year_of_passout: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Year of passout extracted from resume"
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Professional summary of the candidate"
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });
};
