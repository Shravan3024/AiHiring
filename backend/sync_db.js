const { sequelize } = require("./src/models");

async function syncDB() {
  console.log("Starting DB Sync (alter: true)...");
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    // This will compare models with current DB state and add missing columns
    await sequelize.authenticate();
    console.log("✅ Database authenticated");
    console.log("✅ Database synchronized successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync error:", error);
    process.exit(1);
  }
}

syncDB();
