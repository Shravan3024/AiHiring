const { sequelize } = require('../src/models');

async function updateEnum() {
  try {
    console.log("Attempting to add 'theory_based' to enum...");
    // PostgreSQL command to add value to enum
    // IF NOT EXISTS doesn't work directly with ADD VALUE in some PG versions 
    // but we can catch the error if it already exists
    try {
      await sequelize.query("ALTER TYPE \"enum_assessment_analysis_assessment_type\" ADD VALUE 'theory_based'");
      console.log("Added 'theory_based' to enum successfully.");
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log("'theory_based' already exists in enum.");
      } else {
        throw e;
      }
    }
    process.exit(0);
  } catch (err) {
    console.error("Failed to update enum:", err.message);
    process.exit(1);
  }
}

updateEnum();
