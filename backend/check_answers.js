const { InterviewAnswer, InterviewSession } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function check() {
  try {
    const answers = await InterviewAnswer.findAll({ limit: 10 });
    console.log("Answers found:", answers.map(a => ({ id: a.id, session_id: a.interview_id, has_text: !!a.answer_text })));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
