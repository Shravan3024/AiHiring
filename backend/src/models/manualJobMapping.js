const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "ManualJobMapping",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'Jobs',
          key: 'id'
        }
      },
      jobRole: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requiredSkills: {
        type: DataTypes.JSON, // Array of strings or object with weights
        allowNull: false,
      },
      preferredSkills: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      requiredEducation: {
        type: DataTypes.JSON, // Array of degrees e.g. ["B.Tech", "MCA"]
        defaultValue: [],
      },
      minExperience: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      mappingKeywords: {
        type: DataTypes.JSON, // Detailed keywords for manual matching
        defaultValue: {},
      },
      prosRules: {
        type: DataTypes.JSON, // Rules for generating pros
        defaultValue: [],
      },
      consRules: {
        type: DataTypes.JSON, // Rules for generating cons
        defaultValue: [],
      }
    },
    {
      timestamps: true,
      tableName: "manual_job_mappings",
    }
  );
};
