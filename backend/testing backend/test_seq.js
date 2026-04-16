const sequelize = require('../src/config/db');

console.log('Testing authentication...');
sequelize.authenticate()
  .then(() => {
    console.log('Auth OK - Connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('Auth failed:', err);
    process.exit(1);
  });
