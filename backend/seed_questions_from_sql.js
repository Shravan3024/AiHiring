const fs = require('fs');
const path = require('path');
const { sequelize } = require('./src/config/db');

async function seedFromSQL() {
  try {
    console.log("Reading SQL from technical_question_bank.txt...");
    const sqlPath = path.join(__dirname, '..', 'technical_question_bank.txt');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove comments
    sql = sql.replace(/--.*$/gm, '');

    // Cleanup gen_random_uuid if you want to use JS uuid, 
    // but usually Postgres has it. Let's try executing it as is first.
    
    console.log("Executing SQL...");
    
    // Split by semicolons if there are multiple statements, 
    // but here it seems to be one big INSERT.
    await sequelize.query(sql);

    console.log("✅ Successfully seeded questions from SQL file!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding from SQL:", err);
    process.exit(1);
  }
}

seedFromSQL();
