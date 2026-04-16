const { sequelize } = require('../src/models');

async function checkTable() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'resume_analysis'
    `);
    console.log("Columns in resume_analysis:");
    console.log(results);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkTable();
