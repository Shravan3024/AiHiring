const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JSON_TYPE = sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.JSON;
  const ARRAY_STRING = sequelize.getDialect() === 'postgres' ? DataTypes.ARRAY(DataTypes.STRING) : DataTypes.JSON;

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
      // Parsed structured data
      contact_info: {
        type: JSON_TYPE,
        comment: "Name, email, phone extracted by AI",
      },
      education: {
        type: JSON_TYPE,
        comment: "Array of {degree, specialization, cgpa, year_of_passout}",
      },
      experience: {
        type: JSON_TYPE,
        comment: "Array of {position, duration_years, company}",
      },
      skills: {
        type: JSON_TYPE,
        comment: "Categorized skills: programming_languages, web_frameworks, etc",
      },
      certifications: {
        type: ARRAY_STRING,
        comment: "Extracted certifications",
      },
      languages: {
        type: ARRAY_STRING,
        comment: "Languages spoken/written",
      },
      // AI Analysis Results
      ai_summary: {
        type: DataTypes.TEXT,
        comment: "AI-generated executive summary",
      },
      strengths: {
        type: ARRAY_STRING,
        comment: "AI-identified strengths",
      },
      weaknesses: {
        type: ARRAY_STRING,
        comment: "AI-identified weaknesses",
      },
      recommendations: {
        type: ARRAY_STRING,
        comment: "AI recommendations for improvement",
      },
      key_achievements: {
        type: ARRAY_STRING,
        comment: "Extracted key achievements",
      },
      // Scoring
      overall_score: {
        type: DataTypes.FLOAT,
        comment: "Overall resume quality score (0-100)",
      },
      // JD Matching
      jd_match_score: {
        type: DataTypes.FLOAT,
        comment: "Resume match with job description (0-100)",
      },
      jd_matched_skills: {
        type: ARRAY_STRING,
        comment: "Skills matching JD",
      },
      jd_missing_skills: {
        type: ARRAY_STRING,
        comment: "Skills required but missing from resume",
      },
      role_fit: {
        type: JSON_TYPE,
        comment: "{technical_fit: 0-100, cultural_fit: 0-100, seniority_match: 0-100}",
      },
      // Explainability
      analysis_explanation: {
        type: DataTypes.TEXT,
        comment: "Detailed explanation of scores and decisions",
      },
      red_flags: {
        type: ARRAY_STRING,
        comment: "Potential red flags identified",
      },
      green_flags: {
        type: ARRAY_STRING,
        comment: "Positive indicators",
      },
      // Metadata
      total_years_experience: {
        type: DataTypes.INTEGER,
        comment: "Total professional experience in years",
      },
      highest_qualification: {
        type: DataTypes.STRING,
        comment: "Highest degree",
      },
      ai_model_used: {
        type: DataTypes.STRING,
        defaultValue: "gemini-1.5-flash",
        comment: "Which AI model was used for analysis",
      },
      processed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      reprocessed_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Track how many times resume was re-analyzed",
      },
    },
    {
      tableName: "resume_analysis",
      timestamps: true,
    }
  );
};
