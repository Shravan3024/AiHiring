const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("ApplicationStatusLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previous_status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  new_status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  changed_by: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "USER_ID or SYSTEM"
  },
  changed_by_role: {
    type: DataTypes.ENUM("candidate", "hr", "md", "admin", "system")
  },
  // AI-specific tracking
  is_ai_decision: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: "Was this triggered by AI decision"
  },
  ai_decision_id: {
    type: DataTypes.INTEGER,
    comment: "Reference to AI decision if applicable"
  },
  ai_score: {
    type: DataTypes.FLOAT,
    comment: "AI score at time of decision"
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: "Additional info: reason, notes, explanation, etc."
  },
  changed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ip_address: {
    type: DataTypes.STRING,
    comment: "IP address of requester"
  }
  });
};
