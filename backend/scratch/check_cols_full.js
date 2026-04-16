const { sequelize } = require('../src/models');

async function checkTable() {
  try {
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'resume_analysis'
    `);
    console.log(JSON.stringify(results.map(r => r.column_name), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkTable();
