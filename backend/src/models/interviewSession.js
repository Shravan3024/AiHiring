const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("InterviewSession", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("SCHEDULED", "IN_PROGRESS", "SUBMITTED", "COMPLETED", "FAILED", "CANCELLED"),
    defaultValue: "SCHEDULED"
  },
  interview_type: {
    type: DataTypes.ENUM("VIDEO", "AUDIO", "TEXT"),
    defaultValue: "VIDEO"
  },
  scheduled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  recording_path: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Path to video/audio file"
  },
  transcription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Speech-to-text transcription"
  },
  questions_asked: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Array of questions asked"
  },
  answers_provided: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Candidate answers with timestamps"
  },
  ai_analysis: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Sentiment, confidence, clarity, relevance scores"
  },
  anomalies_detected: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Suspicious behavior, time gaps, etc."
  },
  overall_score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  hire_recommendation: {
    type: DataTypes.ENUM("STRONG_YES", "YES", "MAYBE", "NO", "STRONG_NO"),
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  device_info: {
    type: DataTypes.JSON,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Internal HR notes (not visible to candidate)"
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
