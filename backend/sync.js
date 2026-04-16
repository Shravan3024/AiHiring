const sequelize = require('./src/config/db.js');

const migrations = [
  // Users table
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS hr_role VARCHAR(255)`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS auth_token_revision INTEGER DEFAULT 1`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS otp VARCHAR(255)`,
  `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ`,

  // interview_analysis — rating + extra columns
  `ALTER TABLE interview_analysis ADD COLUMN IF NOT EXISTS rating VARCHAR(50)`,
  `ALTER TABLE interview_analysis ADD COLUMN IF NOT EXISTS interview_type TEXT`,

  // assessment_analysis — ensure key columns exist
  `ALTER TABLE assessment_analysis ADD COLUMN IF NOT EXISTS unattempted INTEGER`,
  `ALTER TABLE assessment_analysis ADD COLUMN IF NOT EXISTS red_flags TEXT[]`,

  // resume_analysis — ensure all cols exist
  `ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS green_flags TEXT[]`,
  `ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS red_flags TEXT[]`,
  `ALTER TABLE resume_analysis ADD COLUMN IF NOT EXISTS analysis_explanation TEXT`,

  // ai_decisions — ensure HR and MD columns
  `ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS strengths_summary TEXT`,
  `ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS concerns_summary TEXT`,
  `ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS recommendations_for_hr TEXT[]`,
  `ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20)`,
  `ALTER TABLE ai_decisions ADD COLUMN IF NOT EXISTS risk_factors TEXT[]`,

  // Applications — ensure all score columns
  `ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS overall_score DOUBLE PRECISION`,
  `ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS resume_score DOUBLE PRECISION`,
  `ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS technical_score DOUBLE PRECISION`,
  `ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS interview_score DOUBLE PRECISION`,
];

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');
    for (const sql of migrations) {
      try {
        await sequelize.query(sql);
        console.log(`✅ ${sql.substring(0, 80).replace(/\n/g, ' ')}…`);
      } catch (e) {
        console.log(`⚠️  Skip: ${e.message.split('\n')[0]}`);
      }
    }
    console.log('\n🎉 All migrations complete.');
  } catch (e) {
    console.error('❌ DB connection failed:', e.message);
  } finally {
    await sequelize.close();
  }
}

run();
