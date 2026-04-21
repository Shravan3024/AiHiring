const { sequelize } = require("./src/models");

async function verifyData() {
  const table = "AssessmentAttempts";
  try {
    const [results] = await sequelize.query(`SELECT "created_at", "createdAt", "updated_at", "updatedAt" FROM "${table}" LIMIT 5`);
    console.log(`Table ${table} data snippet:`);
    console.table(results);
    
    // Check which one is NOT null most often
    const [counts] = await sequelize.query(`
      SELECT 
        COUNT("created_at") as created_at_count, 
        COUNT("createdAt") as createdAt_count 
      FROM "${table}"
    `);
    console.log("Counts of non-null values:");
    console.table(counts);

  } catch (e) {
    console.error(e.message);
  }
  process.exit(0);
}

verifyData();
