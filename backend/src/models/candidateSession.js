const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("CandidateSession", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  candidate_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  session_token: {
    type: DataTypes.STRING(500),
    unique: true,
    allowNull: false
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: "Browser and OS info"
  },
  device_fingerprint: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Hash of device characteristics"
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  started_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_activity_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  activity_log: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Array of activities: login, logout, test_start, test_submit, etc."
  }
  });
};
