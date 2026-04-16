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

// ================= SYNC OPTIONS =================
const syncOptions = {
  force: false,
  alter: false
};

async function startServer() {
  const isPostgres = sequelize.getDialect() === 'postgres';
  
  try {
    // 🔄 Authenticate
    await sequelize.authenticate();
    console.log("✅ Database authenticated");
    
    // 🛠️ Sync models
    await sequelize.sync({ alter: isPostgres }); 
    console.log("✅ Database synced");

    // 🔍 Migration Hack for missing columns and tables
    try {
      // Fix for missing timestamps in assessment_analysis before sync
      try {
        await sequelize.query('ALTER TABLE "assessment_analysis" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
        await sequelize.query('ALTER TABLE "assessment_analysis" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
      } catch (_) {}

      if (isPostgres) {
        await sequelize.query('ALTER TABLE interview_question_bank ADD COLUMN IF NOT EXISTS job_id INTEGER;');
        await sequelize.query('ALTER TABLE technical_question_bank ADD COLUMN IF NOT EXISTS job_id INTEGER;');
        await sequelize.query('ALTER TABLE "AssessmentAttempts" ADD COLUMN IF NOT EXISTS malpractice_score FLOAT DEFAULT 0;');
        
        // Convert jobRole from ENUM to VARCHAR
        try {
          await sequelize.query('ALTER TABLE technical_question_bank ALTER COLUMN "jobRole" TYPE VARCHAR(255) USING "jobRole"::VARCHAR(255);');
          await sequelize.query('ALTER TABLE interview_question_bank ALTER COLUMN "jobRole" TYPE VARCHAR(255) USING "jobRole"::VARCHAR(255);');
        } catch (_) {}
      }
      
      // Sync manual mapping table
      if (db.ManualJobMapping) {
        await db.ManualJobMapping.sync({ alter: true });
      }
    } catch (migError) {
      console.warn("⚠️ Migration warning:", migError.message);
    }

    // 🌱 Seed Users
    try {
      const seedUsers = require("./seeds/userSeeder");
      await seedUsers();
    } catch (userError) {
      console.warn("⚠️ User seeding warning:", userError.message);
    }

    // 🌱 Run main seeder
    try {
      const seedDatabase = require("./seeds");
      await seedDatabase();
      const seedManualMappings = require("./seeds/manualMappingSeeder");
      await seedManualMappings();
    } catch (seedError) {
      console.warn("⚠️ Main seeding warning:", seedError.message);
    }

    // 🚀 Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Fatal startup error:", err.message);
    if (isPostgres) {
      console.error("💡 TIP: Could not connect to Supabase. Check your network or comment out DATABASE_URL in .env to use local mode.");
    }
    process.exit(1);
  }
}

startServer();
