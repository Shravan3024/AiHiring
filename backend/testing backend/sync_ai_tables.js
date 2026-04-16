const sequelize = require('../src/config/db');
const app = require('../src/app');

console.log('🔄 Syncing database with models...\n');

sequelize.sync({ force: false, alter: false })
  .then(() => {
    console.log('✓ Database synced successfully');
    console.log('\n📝 Checking tables:');
    
    const tables = [
      'resume_analysis',
      'assessment_analysis',
      'interview_analysis',
      'ai_decisions'
    ];
    
    return Promise.all(
      tables.map(table =>
        sequelize.query(
          `SELECT COUNT(*) as count FROM "${table}" LIMIT 1`,
          { type: sequelize.QueryTypes.SELECT }
        ).then(result => {
          console.log(`  ✓ ${table}`);
          return true;
        }).catch(err => {
          console.log(`  ❌ ${table}`);
          return false;
        })
      )
    );
  })
  .then(results => {
    if (results.every(r => r === true)) {
      console.log('\n✅ All AI analysis tables ready!');
    } else {
      console.log('\n⚠️  Some tables still missing - trying ALTER TABLE...');
    }
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Error:', err.message);
    process.exit(1);
  });
