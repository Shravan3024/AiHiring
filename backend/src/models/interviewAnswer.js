const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("InterviewAnswer", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  interview_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer_text: DataTypes.TEXT,
  audio_path: DataTypes.STRING,
  video_path: DataTypes.STRING,
    ai_score: DataTypes.INTEGER
  });
};
