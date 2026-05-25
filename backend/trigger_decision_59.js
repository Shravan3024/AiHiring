const aiService = require('./src/services/ai.service');
const { sequelize, Application } = require('./src/models');

async function triggerDecision() {
  try {
    const application = await Application.findByPk(59);
    
    if (!application) {
      console.error('Application 59 not found');
      process.exit(1);
    }

    console.log('Current DB scores:', {
      technical_score: application.technical_score,
      interview_score: application.interview_score,
      integrity_score: application.integrity_score,
      resume_score: application.resume_score
    });

    // Manually call the decision logic with the DB scores
    const decision = await aiService.getFinalCandidateDecision({
      jobId: application.job_id,
      assessmentScore: application.technical_score || 0,
      interviewScore: application.interview_score || 0,
      integrityScore: application.integrity_score || 100,
      behavioralScore: application.behavioral_score || 50,
      resumeScore: application.resume_score || 0,
      jobTitle: 'Target Role',
      candidateName: 'Candidate'
    });

    console.log('\n✓ Decision Model Output:');
    console.log(JSON.stringify(decision, null, 2));

    // Update application with decision
    await application.update({
      final_decision: decision.decision || 'Borderline',
      role_recommendation: decision.role_recommendation || '',
      fit_breakdown: decision.fit_breakdown || {},
      ai_rationale: decision.reasoning || '',
      success_probability: decision.success_prediction_percentage ? decision.success_prediction_percentage / 100 : 0.5,
      overall_score: decision.final_score || 62
    });

    console.log('\n✓ Application #59 updated successfully');
    
  } catch (err) {
    console.error('Error:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    process.exit(0);
  }
}

triggerDecision();
