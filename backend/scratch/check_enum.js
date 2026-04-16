const { sequelize } = require('../src/models');

async function checkEnum() {
  try {
    const [results] = await sequelize.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE typname = 'enum_assessment_analysis_assessment_type'
    `);
    console.log("Current enum values:", results.map(r => r.enumlabel));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

checkEnum();
