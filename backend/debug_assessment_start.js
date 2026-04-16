const { Application, Job, TechnicalQuestionBank, AssessmentAttempt, sequelize } = require('./src/models');
(async () => {
  try {
    const app = await Application.findByPk(29);
    console.log('Application(29):', app ? app.toJSON() : null);
    if (!app) return;

    const job = await Job.findByPk(app.job_id);
    console.log('Job:', job ? job.toJSON() : null);

    const title=(job?.title || '').toLowerCase();
    const questionRole =
      title.includes('management trainee') ? 'MANAGEMENT_TRAINEE_MARKETING' :
      title.includes('assistant manager') ? 'ASSISTANT_MANAGER_MARKETING' :
      (title.includes('executive') || title.includes('marketing')) ? 'EXECUTIVE_MARKETING' :
      title.includes('rubber') ? 'RUBBER_PROCESS_ENGINEER' :
      (title.includes('senior ai') || title.includes('ai engineer')) ? 'SENIOR_AI_ENGINEER' :
      (title.includes('full stack') || title.includes('developer')) ? 'FULL_STACK_DEVELOPER' :
      title.includes('data scientist') ? 'DATA_SCIENTIST' :
      (title.includes('qa') || title.includes('quality')) ? 'QA_ENGINEER' :
      title.includes('devops') ? 'DEVOPS_ENGINEER' : null;

    console.log('questionRole:', questionRole);

    if (questionRole) {
      const qcount = await TechnicalQuestionBank.count({ where: { jobRole: questionRole } });
      console.log('qcount', qcount);
    }

    const attempt = await AssessmentAttempt.findOne({ where: { application_id: 29 } });
    console.log('attempt:', attempt ? attempt.toJSON() : null);

  } catch (error) {
    console.error('error:', error);
  } finally {
    await sequelize.close();
  }
})();