require("dotenv").config();
const { Sequelize } = require("sequelize");

if (!process.env.DATABASE_URL) {
  console.error("❌ CRITICAL ERROR: DATABASE_URL not found in .env");
  process.exit(1);
}

// Strictly Supabase PostgreSQL configuration
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for Supabase standard SSL
    }
  },
  logging: false, // Set to console.log to debug SQL queries
  pool: {
    max: 20,
    min: 2,
    acquire: 60000,
    idle: 10000
  }
});

module.exports = { sequelize, Sequelize };
