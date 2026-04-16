const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.fpwfspxymlnbrwbnosfu:HwQRQEZm6ZFmf4btkNaBoOuQK9W5bV32UF4M7Hqu9MEFm2RE8S5ssJxirMUPSqac@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
});

console.log("Testing pg.Pool...");
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('Error:', err);
  else console.log('Result:', res.rows);
  pool.end();
});
