const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("TechnicalRound", {
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
    defaultValue: "PENDING" // PENDING | IN_PROGRESS | COMPLETED
  },

  score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

    ai_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });
};
