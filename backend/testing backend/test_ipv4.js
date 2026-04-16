require('node:dns').setDefaultResultOrder('ipv4first');
require('dotenv').config();
const { Sequelize } = require('sequelize');
const seq = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
      ssl: {
          require: true,
          rejectUnauthorized: false
      }
  }
});
console.log("Testing auth with ipv4first...");
seq.authenticate().then(() => { console.log('OK'); process.exit(0); }).catch(e => { console.error('Failed', e); process.exit(1); });
