require("dotenv").config();
const { Sequelize } = require("sequelize");

const hasDatabaseUrl = !!process.env.DATABASE_URL;
let sequelize;

if (hasDatabaseUrl) {
  console.log("📡 Attempting to connect to remote database...");
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      keepAlive: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 60000,
      idle: 10000
    },
    logging: false
  });
} else {
  console.log("🏠 Using local SQLite database.");
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.SQLITE_PATH || "dev.sqlite",
    logging: false
  });
}

module.exports = { sequelize, Sequelize };
