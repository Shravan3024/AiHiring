const { sequelize, Application } = require('./src/models');

async function check() {
  try {
    const app = await Application.findByPk(59, {
      attributes: ['id', 'technical_score', 'interview_score', 'integrity_score', 'resume_score', 'overall_score', 'status']
    });
    
    console.log('Application #59:', JSON.stringify(app, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

check();
