const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("MCQQuestion", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM("TECHNICAL", "BEHAVIORAL"),
      defaultValue: "TECHNICAL"
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    options: {
      type: DataTypes.JSON,
      defaultValue: [] // ["a) Option 1", "b) Option 2", ...]
    },
    correct_option: {
      type: DataTypes.STRING,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM("EASY", "MEDIUM", "HARD"),
      defaultValue: "MEDIUM"
    },
    weight: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: "mcq_questions",
    timestamps: true
  });
};
