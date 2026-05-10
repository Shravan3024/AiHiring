require('dotenv').config();
const { sequelize } = require('./src/config/db');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    await sequelize.query('ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS md_notes TEXT');
    console.log('Added md_notes column');

    await sequelize.query('ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS md_decision_date TIMESTAMP WITH TIME ZONE');
    console.log('Added md_decision_date column');

    await sequelize.query('ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS md_user_name VARCHAR(255)');
    console.log('Added md_user_name column');

    console.log('Migration complete!');
    process.exit(0);
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exit(1);
  }
}

migrate();
