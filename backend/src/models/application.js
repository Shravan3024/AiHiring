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
      type: DataTypes.STRING, // Changed from ENUM for Supabase compatibility
      defaultValue: "APPLIED"
    },
    attempt_count: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    resume_score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    technical_score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    interview_score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    hr_decision: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hr_notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    overall_score: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    resume_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },
    cgpa: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    year_of_passout: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    applied_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: "Applications",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
