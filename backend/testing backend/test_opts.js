require('dotenv').config();
const { Sequelize } = require('sequelize');
const seq = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {},
  pool: { max: 1, min: 0, acquire: 5000, idle: 10000 }
});
console.log("Testing auth without SSL options...");
seq.authenticate().then(() => { console.log('OK'); process.exit(0); }).catch(e => { console.error('Failed', e); process.exit(1); });
