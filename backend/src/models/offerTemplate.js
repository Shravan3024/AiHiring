const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "OfferTemplate",
    {
      templateId: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      jobId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      templateName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      templateContent: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      salaryBreakupTemplate: {
        type: DataTypes.JSON,
        defaultValue: null,
      },
      legalClauses: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      branding: {
        type: DataTypes.JSON,
        defaultValue: null,
      },
      downloadAllowed: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      watermarkEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      expiryDurationDays: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
      },
      versionNumber: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      tableName: "offer_templates",
    }
  );
};
