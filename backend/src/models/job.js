const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Job", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    min_experience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_experience: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    salary_min: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    salary_max: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE"
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Remote"
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "FULL_TIME"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    required_skills: {
      type: DataTypes.JSON,
      allowNull: true
    },
    skill_weights: {
      type: DataTypes.JSON,
      allowNull: true
    },
    urgency: {
      type: DataTypes.ENUM("NORMAL", "FAST_TRACK"),
      defaultValue: "NORMAL"
    }
  });
};
