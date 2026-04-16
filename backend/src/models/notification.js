const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING, // HR / ADMIN
    allowNull: false
  },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};
