const { sequelize } = require('./src/config/db');

async function migrate() {
  try {
    console.log('Starting migration...');
    await sequelize.query('ALTER TABLE "InterviewSessions" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP WITH TIME ZONE;');
    console.log('✅ Column "expires_at" added successfully to "InterviewSessions" table.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
