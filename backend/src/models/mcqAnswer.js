const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("MCQAnswer", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    attempt_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    ai_feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: "mcq_answers",
    timestamps: true
  });
};
