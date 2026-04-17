const net = require('net');

const targets = [
  { host: 'fpwfspxymlnbrwbnosfu.supabase.co', port: 443, name: 'Supabase API (HTTPS)' },
  { host: 'pooler.supabase.com', port: 5432, name: 'Supabase Pooler (Postgres)' },
  { host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, name: 'Regional Pooler (Transaction)' }
];

console.log("🔍 Starting Production Network Audit...\n");

targets.forEach(target => {
  const socket = new net.Socket();
  const start = Date.now();

  socket.setTimeout(5000);

  socket.on('connect', () => {
    console.log(`✅ ${target.name}: SUCCESS (${Date.now() - start}ms)`);
    socket.destroy();
  }).on('timeout', () => {
    console.log(`❌ ${target.name}: TIMEOUT (Firewall is blocking this port)`);
    socket.destroy();
  }).on('error', (err) => {
    console.log(`❌ ${target.name}: FAILED (${err.message})`);
  }).connect(target.port, target.host);
});
