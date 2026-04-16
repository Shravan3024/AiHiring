require('dotenv').config();
const { Sequelize } = require('sequelize');
const seq = new Sequelize('postgres', 'postgres.fpwfspxymlnbrwbnosfu', 'HwQRQEZm6ZFmf4btkNaBoOuQK9W5bV32UF4M7Hqu9MEFm2RE8S5ssJxirMUPSqac', {
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 5432,
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});
console.log("Testing auth with object config...");
seq.authenticate().then(() => { console.log('OK'); process.exit(0); }).catch(e => { console.error('Failed', e); process.exit(1); });
