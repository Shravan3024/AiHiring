const { InterviewSession } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function check() {
  try {
    const sessions = await InterviewSession.findAll({ limit: 10 });
    sessions.forEach(s => {
      console.log(`Session ${s.id} (App ${s.application_id}):`);
      console.log("  questions_asked:", !!s.questions_asked);
      if (s.questions_asked) {
        const count = Array.isArray(s.questions_asked) ? s.questions_asked.length : 0;
        console.log(`  Q count: ${count}`);
        if (count > 0) {
          console.log("  First Q response:", s.questions_asked[0].response_text ? "YES" : "NO");
        }
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
