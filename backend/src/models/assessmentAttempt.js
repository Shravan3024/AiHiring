const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("AssessmentAttempt", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assessment_type: {
    type: DataTypes.ENUM("TECHNICAL", "APTITUDE", "CODING"),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "EVALUATED"),
    defaultValue: "NOT_STARTED"
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  submitted_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  total_marks: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  percentage: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "Time taken to complete assessment"
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Additional attempt metadata like selected question IDs",
    defaultValue: {}
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Candidate answers stored as JSON"
  },
  anti_cheating_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Tab switches, fullscreen exits, etc."
  },
  malpractice_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  device_info: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ai_feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "AI-generated feedback (limited view for candidate)"
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
