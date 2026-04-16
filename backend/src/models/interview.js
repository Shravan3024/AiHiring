const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Interview", {
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
    type: DataTypes.STRING,
    defaultValue: "SCHEDULED"
    // SCHEDULED | IN_PROGRESS | PAUSED | COMPLETED
  },
  ai_score: DataTypes.INTEGER,
  ai_summary: DataTypes.TEXT,
    hire_recommendation: DataTypes.STRING
    // STRONG_YES | YES | NO
  });
};
