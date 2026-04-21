const { sequelize } = require('./src/config/db');

async function migrate() {
  try {
    console.log("Starting database migration...");
    
    // Candidates table
    await sequelize.query(`ALTER TABLE "Candidates" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT '{}';`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Candidates" ADD COLUMN IF NOT EXISTS "cgpa" FLOAT;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Candidates" ADD COLUMN IF NOT EXISTS "year_of_passout" INTEGER;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Candidates" ADD COLUMN IF NOT EXISTS "profile_image_path" TEXT;`).catch(() => {});
    
    // Applications table
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "resume_url" TEXT;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "skills" TEXT[] DEFAULT '{}';`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "cgpa" FLOAT;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "year_of_passout" INTEGER;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "final_decision" TEXT;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "role_recommendation" TEXT;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "fit_breakdown" JSON;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "ai_rationale" TEXT;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "success_probability" FLOAT;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "integrity_score" FLOAT DEFAULT 100;`).catch(() => {});
    await sequelize.query(`ALTER TABLE "Applications" ADD COLUMN IF NOT EXISTS "behavioral_score" FLOAT DEFAULT 0;`).catch(() => {});

    // Admin Audit Logs table - Added for Traceability
    // 3. Update AssessmentAttempts
    console.log("Migrating AssessmentAttempts...");
    await sequelize.query('ALTER TABLE "AssessmentAttempts" ADD COLUMN IF NOT EXISTS candidate_id INTEGER;');
    await sequelize.query('ALTER TABLE "AssessmentAttempts" ADD COLUMN IF NOT EXISTS structure_score FLOAT DEFAULT 0;');
    await sequelize.query('ALTER TABLE "AssessmentAttempts" ADD COLUMN IF NOT EXISTS concept_coverage FLOAT DEFAULT 0;');
    await sequelize.query('ALTER TABLE "AssessmentAttempts" ADD COLUMN IF NOT EXISTS keyword_heatmap JSON;');
    
    // 4. Update InterviewSessions
    console.log("Migrating InterviewSessions...");
    await sequelize.query('ALTER TABLE "InterviewSessions" ADD COLUMN IF NOT EXISTS candidate_id INTEGER;');
    await sequelize.query('ALTER TABLE "InterviewSessions" ADD COLUMN IF NOT EXISTS dimension_scores JSON;');
    await sequelize.query('ALTER TABLE "InterviewSessions" ADD COLUMN IF NOT EXISTS highlights JSON;');
    await sequelize.query('ALTER TABLE "InterviewSessions" ADD COLUMN IF NOT EXISTS confidence_timeline JSON;');

    console.log("Migrating admin_audit_logs...");
    const dialect = sequelize.getDialect();
    
    // Metadata column
    if (dialect === "sqlite") {
      await sequelize.query(`ALTER TABLE admin_audit_logs ADD COLUMN metadata JSON;`).catch(() => {});
    } else {
      await sequelize.query(`ALTER TABLE admin_audit_logs ADD COLUMN IF NOT EXISTS metadata JSON;`).catch(() => {});
    }

    // Attempt to add indexes
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_aal_action_type ON admin_audit_logs (actionType);`).catch(() => {});
    await sequelize.query(`CREATE INDEX IF NOT EXISTS idx_aal_timestamp ON admin_audit_logs (timestamp);`).catch(() => {});
    
    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}
migrate();
