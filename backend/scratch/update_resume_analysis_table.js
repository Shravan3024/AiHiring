const { sequelize } = require('../src/models');

async function updateTable() {
  try {
    await sequelize.query("ALTER TABLE \"resume_analysis\" ADD COLUMN IF NOT EXISTS \"why_to_hire\" TEXT");
    console.log("Added 'why_to_hire' column to resume_analysis table successfully.");
    process.exit(0);
  } catch (err) {
    if (err.message.includes("already exists")) {
       console.log("Column already exists.");
       process.exit(0);
    }
    console.error("Error updating table:", err.message);
    process.exit(1);
  }
}

updateTable();
