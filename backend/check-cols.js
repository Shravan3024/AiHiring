require('dotenv').config();
const { sequelize } = require('./src/models/index.js');

async function checkCols() {
  try {
    const [results1] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'admin_workflows';");
    console.log('admin_workflows columns:', results1.map(r => r.column_name));

    const [results2] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'ai_configs';");
    console.log('ai_configs columns:', results2.map(r => r.column_name));

    const [results3] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications';");
    console.log('notifications columns:', results3.map(r => r.column_name));

  } catch (e) {
    console.error(e);
  }
}

checkCols().then(() => process.exit(0));
