require('dotenv').config();
const { sequelize } = require('./src/models/index.js');

async function checkCols() {
  try {
    const [results1] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Jobs';");
    console.log('Jobs columns:', results1.map(r => r.column_name));

    const [results2] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Users';");
    console.log('Users columns:', results2.map(r => r.column_name));

    const [results3] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'ai_config';");
    console.log('ai_config columns:', results3.map(r => r.column_name));
    
    const [results4] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Notifications';");
    console.log('Notifications columns:', results4.map(r => r.column_name));

  } catch (e) {
    console.error(e);
  }
}

checkCols().then(() => process.exit(0));
