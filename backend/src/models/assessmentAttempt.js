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
    type: DataTypes.STRING, // Changed from ENUM for Supabase stability
    allowNull: false
  },
  status: {
    type: DataTypes.STRING, // Changed from ENUM for Supabase stability
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
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: true
  },
  anti_cheating_data: {
    type: DataTypes.JSON,
    allowNull: true
  },
  malpractice_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  ai_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  ml_score: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  final_score: {
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
    allowNull: true
  }
  }, {
    tableName: "AssessmentAttempts", // Ensured exact case-sensitive name
    freezeTableName: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  });
};
