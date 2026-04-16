const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Resume",
    {
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      file_name: DataTypes.STRING,
      file_path: DataTypes.STRING,
      skills: sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.JSON,
      education: sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.JSON,
      total_experience_months: DataTypes.INTEGER,
      summary: DataTypes.TEXT,
      parsed_at: DataTypes.DATE,
    },
    {
      tableName: "Resumes",
      timestamps: true,
    }
  );
};
