require('dotenv').config();
const db = require('./src/config/db');
const { sequelize } = db;

async function checkTables() {
  const tables = [
    'Applications', 'Candidates', 'Jobs', 
    'resume_analysis', 'assessment_analysis', 'interview_analysis', 
    'InterviewSessions', 'AssessmentAttempts', 
    'InterviewQuestionBanks', 'TechnicalQuestionBanks', 'Users'
  ];
  
  console.log('\n=== DATABASE TABLE STATUS ===');
  for (const t of tables) {
    try {
      const [res] = await sequelize.query(`SELECT COUNT(*) as cnt FROM "${t}"`);
      console.log(`${t}: ${res[0].cnt} rows`);
    } catch(e) {
      console.log(`${t}: ERROR - ${e.message.substring(0, 100)}`);
    }
  }
  
  // Check InterviewSessions with details
  try {
    const [sessions] = await sequelize.query(`
      SELECT id, application_id, status, 
             jsonb_array_length(questions_asked::jsonb) as q_count,
             (SELECT COUNT(*) FROM jsonb_array_elements(questions_asked::jsonb) j 
              WHERE j->>'response_text' IS NOT NULL AND j->>'response_text' != '') as answered
      FROM "InterviewSessions" 
      LIMIT 5
    `);
    console.log('\n=== INTERVIEW SESSIONS DETAIL ===');
    sessions.forEach(s => console.log(`  Session ${s.id} (App ${s.application_id}): status=${s.status}, questions=${s.q_count}, answered=${s.answered}`));
  } catch(e) {
    console.log('InterviewSessions detail error:', e.message.substring(0, 100));
  }
  
  process.exit(0);
}

checkTables().catch(e => { console.error(e); process.exit(1); });
