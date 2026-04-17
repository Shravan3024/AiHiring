const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Candidate", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  education: {
    type: DataTypes.STRING,
    allowNull: false
  },

  specialization: {
    type: DataTypes.STRING,
    allowNull: false
  },

  experience_years: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },

  location: {
    type: DataTypes.STRING,
    allowNull: true
  },

  parsed_resume: {
    type: DataTypes.JSON
  },

  resume_path: {
    type: DataTypes.STRING
  },

  profile_image_path: {
    type: DataTypes.STRING,
    allowNull: true
  },

  ai_score: {
    type: DataTypes.FLOAT
  },

  ai_summary: {
    type: DataTypes.TEXT
  },

  summary: {
    type: DataTypes.TEXT
  },

  current_stage: {
    type: DataTypes.STRING,
    defaultValue: "APPLIED"
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "IN_PROGRESS"
  },

  integrity_score: {
    type: DataTypes.FLOAT,
    defaultValue: 100
  },

  otp: {
    type: DataTypes.STRING,
    allowNull: true
  },

  otp_expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  active_session_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  last_login_ip: {
    type: DataTypes.STRING,
    allowNull: true
  },

  skills: {
    type: DataTypes.JSON, // Standardized to JSON for cross-dialect stability without sync
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

  }, {
    tableName: "Candidates",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });
};