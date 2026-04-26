const { InterviewSession, Application } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function check() {
  try {
    const apps = await Application.findAll({ limit: 5 });
    console.log("Apps found:", apps.map(a => a.id));
    
    const sessions = await InterviewSession.findAll({ limit: 5 });
    console.log("Sessions found:", sessions.map(s => ({ id: s.id, app_id: s.application_id, transcription: !!s.transcription })));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
