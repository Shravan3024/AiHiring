const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.fpwfspxymlnbrwbnosfu:HwQRQEZm6ZFmf4btkNaBoOuQK9W5bV32UF4M7Hqu9MEFm2RE8S5ssJxirMUPSqac@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  connectionTimeoutMillis: 5000 // 5 seconds timeout
});

client.connect()
  .then(() => {
    console.log('Connected to Supabase PostgreSQL!');
    client.end();
  })
  .catch(err => {
    console.error('Connection error', err.stack);
  });
