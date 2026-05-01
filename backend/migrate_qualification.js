/**
 * One-time migration: populate highest_qualification in resume_analysis
 * from the education JSON array, for all records where it's currently NULL
 */
require('dotenv').config();
const db = require('./src/config/db');
const { sequelize } = db;

async function migrateHighestQualification() {
  console.log('=== Migrating highest_qualification ===\n');
  
  const [records] = await sequelize.query(`
    SELECT id, application_id, education, total_years_experience
    FROM resume_analysis
    WHERE highest_qualification IS NULL OR highest_qualification = 'null'
  `);
  
  console.log(`Found ${records.length} records with missing highest_qualification`);
  
  const degreePriority = ['PhD', 'M.Tech', 'M.E', 'M.Sc', 'MBA', 'MCA', 'M.S', 'M.A', 'M.Com',
                          'B.Tech', 'B.E', 'B.Sc', 'BCA', 'B.S', 'B.A', 'B.Com', 'Diploma'];
  
  let updated = 0;
  for (const rec of records) {
    let education = rec.education;
    if (typeof education === 'string') {
      try { education = JSON.parse(education); } catch(e) { education = null; }
    }
    
    if (!Array.isArray(education) || education.length === 0) continue;
    
    let highestQual = null;
    for (const deg of degreePriority) {
      for (const edu of education) {
        const edDeg = (edu.degree || edu.qualification || '').toLowerCase();
        if (edDeg.includes(deg.toLowerCase())) {
          const spec = edu.specialization || edu.field_of_study || '';
          highestQual = `${edu.degree || deg}${spec ? ' in ' + spec : ''}`;
          break;
        }
      }
      if (highestQual) break;
    }
    
    // Fallback: use first education entry
    if (!highestQual && education[0]) {
      const edu = education[0];
      const deg = edu.degree || edu.qualification || null;
      const spec = edu.specialization || edu.field_of_study || '';
      if (deg) highestQual = `${deg}${spec ? ' in ' + spec : ''}`;
    }
    
    if (highestQual) {
      await sequelize.query(`
        UPDATE resume_analysis SET highest_qualification = :qual WHERE id = :id
      `, { replacements: { qual: highestQual, id: rec.id } });
      console.log(`  App ${rec.application_id}: Set qualification = "${highestQual}"`);
      updated++;
    } else {
      console.log(`  App ${rec.application_id}: Could not detect qualification from education data`);
    }
  }
  
  console.log(`\n✅ Migration complete. Updated ${updated}/${records.length} records.`);
  
  // Also fix experience_years = 2 for freshers (likely from old default)
  console.log('\n=== Checking for fresher experience anomalies ===');
  
  // Find applications where candidate is fresher but resume shows exp > 0
  const { Application, Candidate } = require('./src/models');
  const freshers = await Candidate.findAll({ where: { candidate_type: 'FRESHER' } });
  console.log(`Found ${freshers.length} fresher candidates`);
  
  let fixedFreshers = 0;
  for (const c of freshers) {
    if (c.experience_years !== 0) {
      await c.update({ experience_years: 0 });
      console.log(`  Fixed fresher candidate ${c.id}: experience_years reset to 0`);
      fixedFreshers++;
    }
  }
  
  // Fix resume_analysis total_years_experience for freshers
  const fresherAppIds = freshers.map(c => c.id);
  if (fresherAppIds.length > 0) {
    const apps = await Application.findAll({ where: { candidate_id: fresherAppIds } });
    const appIdList = apps.map(a => a.id);
    if (appIdList.length > 0) {
      await sequelize.query(`
        UPDATE resume_analysis SET total_years_experience = 0
        WHERE application_id IN (${appIdList.join(',')}) AND total_years_experience > 0
      `);
      console.log(`  Reset experience to 0 for ${appIdList.length} fresher applications in resume_analysis`);
    }
  }
  
  console.log(`\n✅ Fresher fix complete. ${fixedFreshers} candidates updated.`);
  process.exit(0);
}

migrateHighestQualification().catch(e => {
  console.error('Migration error:', e.message);
  process.exit(1);
});
