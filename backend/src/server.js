require("dotenv").config();

console.log("Loading app...");
const app = require("./app");
console.log("Loading config/db...");
const { sequelize } = require("./config/db");

console.log("Loading models...");
// ✅ IMPORTANT: Load ALL models from index
const db = require("./models");
console.log("Models loaded!");

const PORT = process.env.PORT || 5000;
async function startServer() {
  const isPostgres = sequelize.getDialect() === 'postgres';
  
  try {
    // 🔄 Authenticate only - no more auto-sync or migrations
    await sequelize.authenticate();
    console.log("✅ Database authenticated successfully");

    // 🚀 Start server
    app.listen(PORT, async () => {
      console.log(`🚀 Mask Polymers Backend running on port ${PORT}`);
      console.log(`📡 Connected to: ${isPostgres ? 'Remote Supabase' : 'Local SQLite'}`);
      
      // Auto-Seed if needed
      try {
        const seedDatabase = require("./seeds");
        await seedDatabase();
      } catch (seedErr) {
        console.error("⚠️ Seeding failed:", seedErr.message);
      }
    });

  } catch (err) {
    console.error("❌ Fatal startup error:", err.message);
    if (isPostgres) {
      console.error("💡 TIP: Verify your DATABASE_URL in .env or the Supabase connection status.");
    }
    process.exit(1);
  }
}

startServer();
