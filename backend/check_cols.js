const { sequelize } = require("./src/models/index");

async function checkColumns(table) {
  try {
    const [results] = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
    console.log(`Columns in ${table}:`, results.map(r => r.column_name));
  } catch (error) {
    console.error(`Error checking columns for ${table}:`, error);
  }
}

async function run() {
  await checkColumns('Applications');
  await checkColumns('Candidates');
  await checkColumns('Jobs');
  await checkColumns('DocumentRecords');
  process.exit(0);
}

run();
