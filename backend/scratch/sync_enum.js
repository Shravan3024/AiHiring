const sequelize = require('../src/config/db');

async function fixEnum() {
  try {
    console.log("Checking current enum values...");
    const [results] = await sequelize.query(`
      SELECT n.nspname as enum_schema,  
             t.typname as enum_name,  
             e.enumlabel as enum_value
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE t.typname = 'enum_Applications_status';
    `);
    
    const existingValues = results.map(r => r.enum_value);
    console.log("Existing values:", existingValues);

    const neededValues = [
      "RESUME_EVALUATED",
      "ASSESSMENT_UNLOCKED",
      "TECHNICAL_ROUND_PENDING",
      "TECHNICAL_ROUND_IN_PROGRESS",
      "TECHNICAL_ROUND_COMPLETED",
      "INTERVIEW_UNLOCKED",
      "INTERVIEW_SCHEDULED",
      "INTERVIEW_IN_PROGRESS",
      "INTERVIEW_COMPLETED",
      "RE_INTERVIEW_REQUESTED",
      "HR_REVIEW"
    ];

    for (const val of neededValues) {
      if (!existingValues.includes(val)) {
        console.log(`Adding ${val} to enum...`);
        try {
          await sequelize.query(`ALTER TYPE "enum_Applications_status" ADD VALUE '${val}'`);
        } catch (e) {
          console.log(`Could not add ${val}: ${e.message}`);
        }
      }
    }
    
    console.log("Enum sync complete.");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

fixEnum();
