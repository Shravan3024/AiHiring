const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Offer", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  position_title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  salary: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bonus: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  joining_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  offer_letter_content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pdf_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "PENDING" // ACCEPTED / REJECTED
  },
  candidate_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  benefits: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
    responded_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });
};
