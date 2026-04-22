require('dotenv').config();
const { sequelize } = require('./src/models/index.js');

async function checkCols() {
  try {
    const [results1] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'offer_templates';");
    console.log('offer_templates columns:', results1.map(r => r.column_name));
  } catch (e) {
    console.error(e);
  }
}

checkCols().then(() => process.exit(0));
