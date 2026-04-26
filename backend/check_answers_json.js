const { InterviewSession } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function check() {
  try {
    const sessions = await InterviewSession.findAll({ limit: 10 });
    sessions.forEach(s => {
      console.log(`Session ${s.id} (App ${s.application_id}): answers_provided:`, !!s.answers_provided);
      if (s.answers_provided) {
        console.log("Data snippet:", JSON.stringify(s.answers_provided).substring(0, 100));
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
