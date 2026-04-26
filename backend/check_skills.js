const { Job, Candidate } = require('./src/models');
const { Op } = require('sequelize');

async function checkJobSkills() {
  const jobs = await Job.findAll({ attributes: ['title', 'required_skills'] });
  console.log('JOBS AND SKILLS:');
  jobs.forEach(j => {
    console.log(`- ${j.title}: ${JSON.stringify(j.required_skills)}`);
  });

  const candidates = await Candidate.findAll({ attributes: ['skills'], limit: 5 });
  console.log('CANDIDATE SKILLS:');
  candidates.forEach(c => {
    console.log(`- ${JSON.stringify(c.skills)}`);
  });
  process.exit(0);
}

checkJobSkills();
