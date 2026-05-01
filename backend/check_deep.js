require('dotenv').config();
const db = require('./src/config/db');
const { sequelize } = db;

async function deepCheck() {
  // Check actual table names
  const [tables] = await sequelize.query(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' ORDER BY tablename
  `);
  console.log('=== ALL TABLES ===');
  tables.forEach(t => console.log(' -', t.tablename));

  // Check questions_asked in completed sessions (SQLite compatible)
  const [sessions] = await sequelize.query(`
    SELECT id, application_id, status, questions_asked
    FROM "InterviewSessions" 
    WHERE status IN ('COMPLETED', 'SUBMITTED')
    LIMIT 3
  `);
  
  console.log('\n=== COMPLETED SESSION QUESTIONS DETAIL ===');
  for (const s of sessions) {
    let qa = s.questions_asked;
    if (typeof qa === 'string') { try { qa = JSON.parse(qa); } catch(e) { qa = []; } }
    if (!Array.isArray(qa)) qa = [];
    
    console.log(`Session ${s.id} (App ${s.application_id}): ${qa.length} questions`);
    if (qa.length > 0) {
      const first = qa[0];
      console.log('  Keys:', Object.keys(first).join(', '));
      console.log('  question_text:', first.question_text || first.question || 'MISSING');
      console.log('  response_text:', first.response_text ? '"' + first.response_text.substring(0,80) + '"' : 'EMPTY/NULL');
      console.log('  expectedAnswer:', first.expectedAnswer ? first.expectedAnswer.substring(0,60) : 'N/A');
    }
  }

  // Check resume analysis
  const [resumeA] = await sequelize.query(`
    SELECT application_id, overall_score, jd_match_score, 
           total_years_experience, highest_qualification, strengths
    FROM resume_analysis LIMIT 3
  `);
  console.log('\n=== RESUME ANALYSIS SAMPLE ===');
  resumeA.forEach(r => {
    console.log(`App ${r.application_id}: score=${r.overall_score}, jd_match=${r.jd_match_score}, exp=${r.total_years_experience}y, qual="${r.highest_qualification}"`);
    let str = r.strengths;
    if (typeof str === 'string') { try { str = JSON.parse(str); } catch(e) {} }
    console.log('  Strengths:', JSON.stringify(str).substring(0, 120));
  });

  // Check Jobs 
  const [jobs] = await sequelize.query(`SELECT id, title, department, required_skills FROM "Jobs"`);
  console.log('\n=== JOBS ===');
  jobs.forEach(j => {
    let skills = j.required_skills;
    if (typeof skills === 'string') { try { skills = JSON.parse(skills); } catch(e) {} }
    console.log(`  Job ${j.id}: "${j.title}" (${j.department}) - Skills: ${JSON.stringify(skills).substring(0,100)}`);
  });

  // Check assessment_analysis
  const [assmA] = await sequelize.query(`
    SELECT application_id, assessment_type, overall_score, strengths, weaknesses, detailed_feedback
    FROM assessment_analysis LIMIT 3
  `);
  console.log('\n=== ASSESSMENT ANALYSIS SAMPLE ===');
  assmA.forEach(a => {
    console.log(`App ${a.application_id} (${a.assessment_type}): score=${a.overall_score}`);
    let str = a.strengths;
    if (typeof str === 'string') { try { str = JSON.parse(str); } catch(e) {} }
    console.log('  Strengths:', JSON.stringify(str).substring(0, 100));
    console.log('  Feedback:', (a.detailed_feedback || '').substring(0, 100));
  });

  process.exit(0);
}

deepCheck().catch(e => { console.error(e.message); process.exit(1); });
