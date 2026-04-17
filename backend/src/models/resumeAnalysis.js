const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ResumeAnalysis",
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
      resume_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contact_info: {
        type: DataTypes.JSON,
      },
      education: {
        type: DataTypes.JSON,
      },
      experience: {
        type: DataTypes.JSON,
      },
      skills: {
        type: DataTypes.JSON,
      },
      certifications: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      languages: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      ai_summary: {
        type: DataTypes.TEXT,
      },
      strengths: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      weaknesses: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      recommendations: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      key_achievements: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      overall_score: {
        type: DataTypes.FLOAT,
      },
      jd_match_score: {
        type: DataTypes.FLOAT,
      },
      jd_matched_skills: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      jd_missing_skills: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      role_fit: {
        type: DataTypes.JSON,
      },
      analysis_explanation: {
        type: DataTypes.TEXT,
      },
      red_flags: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      green_flags: {
        type: DataTypes.JSON, // Changed from ARRAY
      },
      total_years_experience: {
        type: DataTypes.INTEGER,
      },
      highest_qualification: {
        type: DataTypes.STRING,
      },
      ai_model_used: {
        type: DataTypes.STRING,
        defaultValue: "gemini-1.5-flash",
      },
      processed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      reprocessed_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "resume_analysis",
      freezeTableName: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
};
