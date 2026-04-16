const { AssessmentAnalysis, Application } = require('../src/models');

async function checkData() {
  try {
    const appId = 46;
    const analysis = await AssessmentAnalysis.findAll({ where: { application_id: appId } });
    console.log(`Found ${analysis.length} analysis records for application ${appId}`);
    analysis.forEach(a => {
      console.log(`- Type: ${a.assessment_type}, Score: ${a.overall_score}, Recommendation: ${a.recommendation}`);
    });
    
    const app = await Application.findByPk(appId);
    console.log(`Application Status: ${app.status}, Technical Score: ${app.technical_score}`);
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

checkData();
