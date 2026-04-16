const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("DocumentRecord", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  document_type: {
    type: DataTypes.ENUM("RESUME", "OFFER_LETTER", "ASSESSMENT_REPORT", "INTERVIEW_TRANSCRIPT", "OTHER"),
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Path to file on disk or S3"
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: "File size in bytes"
  },
  file_type: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "MIME type: application/pdf, etc."
  },
  is_confidential: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: "If true, candidate cannot view"
  },
  generated_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  viewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: "If set, document link expires after this date"
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
  });
};
