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
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      ai_summary: {
        type: DataTypes.TEXT,
      },
      strengths: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      weaknesses: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      recommendations: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      key_achievements: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      overall_score: {
        type: DataTypes.FLOAT,
      },
      jd_match_score: {
        type: DataTypes.FLOAT,
      },
      jd_matched_skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      jd_missing_skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      role_fit: {
        type: DataTypes.JSON,
      },
      analysis_explanation: {
        type: DataTypes.TEXT,
      },
      red_flags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      green_flags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
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
