const { Application, InterviewSession } = require('./src/models');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
  try {
    const app = await Application.findByPk(46);
    if (!app) {
      console.log('Application 46 not found');
      return;
    }
    console.log('--- Application 46 ---');
    console.log('Status:', app.status);
    console.log('HR Decision:', app.hr_decision);
    console.log('Technical Score:', app.technical_score);
    console.log('Interview Score:', app.interview_score);

    const session = await InterviewSession.findOne({
      where: { application_id: 46 }
    });
    if (session) {
      console.log('--- Interview Session ---');
      console.log('Status:', session.status);
      console.log('Scheduled Date:', session.scheduled_date);
    } else {
      console.log('No interview session found for application 46');
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
