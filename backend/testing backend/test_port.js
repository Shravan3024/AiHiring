const { Sequelize } = require('sequelize');
const url = 'postgresql://postgres.fpwfspxymlnbrwbnosfu:HwQRQEZm6ZFmf4btkNaBoOuQK9W5bV32UF4M7Hqu9MEFm2RE8S5ssJxirMUPSqac@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
const seq = new Sequelize(url, {
  dialect: 'postgres',
  dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
});
console.log("Testing auth on port 6543...");
seq.authenticate()
  .then(() => { console.log('OK'); process.exit(0); })
  .catch(e => { console.error('Failed', e); process.exit(1); });
