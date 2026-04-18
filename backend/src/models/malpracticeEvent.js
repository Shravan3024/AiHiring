const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("MalpracticeEvent", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  type: {
    type: DataTypes.STRING,
    allowNull: false
  },

  severity: {
    type: DataTypes.INTEGER,
    defaultValue: 1 // 1 = low, 5 = critical
  },

    meta: {
      type: DataTypes.JSON
    }
  }, {
    tableName: 'MalpracticeEvents',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
