const sequelize = require('../src/config/db');

sequelize.authenticate()
  .then(() => {
    console.log('✓ Database connected\n');
    
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
          console.log(`✓ Table "${table}" exists (${result[0].count} records)`);
          return true;
        }).catch(err => {
          console.log(`❌ Table "${table}" not found or error: ${err.message.split('\n')[0]}`);
          return false;
        })
      )
    );
  })
  .then(results => {
    const allExist = results.every(r => r === true);
    console.log('\n' + (allExist ? '✅ ALL TABLES READY' : '⚠️  SOME TABLES MISSING'));
    process.exit(allExist ? 0 : 1);
  })
  .catch(err => {
    console.log('❌ Database Error:', err.message);
    process.exit(1);
  });
