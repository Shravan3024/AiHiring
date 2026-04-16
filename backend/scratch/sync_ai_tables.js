const { sequelize, InterviewAnalysis, AssessmentAnalysis, ResumeAnalysis } = require('../src/models');

async function syncAIModels() {
  try {
    console.log("Checking AI Analysis tables for missing columns...");

    // 1. InterviewAnalysis
    const interviewAttrs = InterviewAnalysis.getAttributes();
    for (const attrName in interviewAttrs) {
      if (attrName === 'id' || attrName === 'createdAt' || attrName === 'updatedAt') continue;
      const colName = interviewAttrs[attrName].field || attrName;
      try {
        await sequelize.query(`ALTER TABLE "interview_analysis" ADD COLUMN IF NOT EXISTS "${colName}" ${interviewAttrs[attrName].type.toSql ? interviewAttrs[attrName].type.toSql() : 'TEXT'}`);
        console.log(`- Checked column: interview_analysis.${colName}`);
      } catch (e) {
        // console.log(`- Column ${colName} might already exist or failed: ${e.message}`);
      }
    }

    // 2. AssessmentAnalysis
    const assessmentAttrs = AssessmentAnalysis.getAttributes();
    for (const attrName in assessmentAttrs) {
      if (attrName === 'id' || attrName === 'createdAt' || attrName === 'updatedAt') continue;
      const colName = assessmentAttrs[attrName].field || attrName;
      try {
        await sequelize.query(`ALTER TABLE "assessment_analysis" ADD COLUMN IF NOT EXISTS "${colName}" ${assessmentAttrs[attrName].type.toSql()}`);
        console.log(`- Checked column: assessment_analysis.${colName}`);
      } catch (e) {}
    }

    // 3. ResumeAnalysis
    const resumeAttrs = ResumeAnalysis.getAttributes();
    for (const attrName in resumeAttrs) {
      if (attrName === 'id' || attrName === 'createdAt' || attrName === 'updatedAt') continue;
      const colName = resumeAttrs[attrName].field || attrName;
      try {
        await sequelize.query(`ALTER TABLE "resume_analysis" ADD COLUMN IF NOT EXISTS "${colName}" ${resumeAttrs[attrName].type.toSql()}`);
        console.log(`- Checked column: resume_analysis.${colName}`);
      } catch (e) {}
    }

    console.log("\n✅ AI Analysis tables sync attempt completed.");
  } catch (err) {
    console.error("❌ Sync failed:", err.message);
  } finally {
    process.exit(0);
  }
}

async function ensureSnakeCaseTimestamps(tableName) {
  try {
    // Check if snake_case exists
    const [cols] = await sequelize.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${tableName}'`);
    const names = cols.map(c => c.column_name);

    if (names.includes('createdAt') && !names.includes('created_at')) {
      await sequelize.query(`ALTER TABLE "${tableName}" RENAME COLUMN "createdAt" TO created_at`);
      console.log(`- Renamed createdAt -> created_at in ${tableName}`);
    } else if (!names.includes('created_at')) {
      await sequelize.query(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()`);
      console.log(`- Added created_at to ${tableName}`);
    }

    if (names.includes('updatedAt') && !names.includes('updated_at')) {
      await sequelize.query(`ALTER TABLE "${tableName}" RENAME COLUMN "updatedAt" TO updated_at`);
      console.log(`- Renamed updatedAt -> updated_at in ${tableName}`);
    } else if (!names.includes('updated_at')) {
      await sequelize.query(`ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()`);
      console.log(`- Added updated_at to ${tableName}`);
    }
  } catch (e) {
    console.log(`- Timestamp sync for ${tableName} failed: ${e.message}`);
  }
}

// Wrap existing logic to include timestamp sync
async function runSync() {
  await ensureSnakeCaseTimestamps('interview_analysis');
  await ensureSnakeCaseTimestamps('assessment_analysis');
  await ensureSnakeCaseTimestamps('resume_analysis');
  await syncAIModels();
}

runSync();
