const { sequelize } = require("./src/models");

async function checkSync() {
  const tables = ["InterviewSessions", "DocumentRecords", "NotificationQueues"];
  for (const table of tables) {
    try {
      const [diffs] = await sequelize.query(`
        SELECT count(*) as diff_count 
        FROM "${table}" 
        WHERE "created_at" != "createdAt" 
        OR ("created_at" IS NULL AND "createdAt" IS NOT NULL)
        OR ("created_at" IS NOT NULL AND "createdAt" IS NULL)
      `);
      console.log(`Table ${table} sync differences: ${diffs[0].diff_count}`);
    } catch (e) {
      console.log(`Table ${table} error: ${e.message}`);
    }
  }
  process.exit(0);
}

checkSync();
