const { sequelize, Application } = require('./src/models');

async function generateDecisionDeterministic() {
  try {
    const application = await Application.findByPk(59);
    
    if (!application) {
      console.error('Application 59 not found');
      process.exit(1);
    }

    // Get the scores from DB
    const assessmentScore = application.technical_score || 0;
    const interviewScore = application.interview_score || 0;
    const resumeScore = application.resume_score || 0;
    const integrityScore = application.integrity_score || 100;
    const behavioralScore = application.behavioral_score || 50;

    console.log('📊 Input Scores:');
    console.log(`  Assessment: ${assessmentScore}`);
    console.log(`  Interview: ${interviewScore}`);
    console.log(`  Resume: ${resumeScore}`);
    console.log(`  Integrity: ${integrityScore}`);
    console.log(`  Behavioral: ${behavioralScore}\n`);

    // Weights (from ai.service)
    const weights = {
      assessment: 0.35,
      interview: 0.35,
      resume: 0.10,
      integrity: 0.10,
      behavioral: 0.10
    };

    // Calculate final score
    const finalScore = Math.round(
      (assessmentScore * weights.assessment) +
      (interviewScore * weights.interview) +
      (integrityScore * weights.integrity) +
      (behavioralScore * weights.behavioral) +
      ((resumeScore || 0) * weights.resume)
    );

    console.log('🎯 Weighted Calculation:');
    console.log(`  (${assessmentScore} × 0.35) + (${interviewScore} × 0.35) + (${integrityScore} × 0.10) + (${behavioralScore} × 0.10) + (${resumeScore} × 0.10)`);
    console.log(`  = ${finalScore}/100\n`);

    // Fit dimensions
    const technicalFit = Math.round((assessmentScore * 0.7) + (interviewScore * 0.3));
    const commFit = Math.round((interviewScore * 0.6) + (behavioralScore * 0.4));
    const leadershipFit = Math.round((behavioralScore * 0.5) + (interviewScore * 0.3) + (assessmentScore * 0.2));
    const domainFit = Math.round((assessmentScore * 0.6) + ((resumeScore || 0) * 0.4));
    const culturalFit = Math.round((behavioralScore * 0.6) + (integrityScore * 0.4));

    console.log('📈 Fit Dimensions:');
    console.log(`  Technical Fit: ${technicalFit}`);
    console.log(`  Communication Fit: ${commFit}`);
    console.log(`  Leadership Fit: ${leadershipFit}`);
    console.log(`  Domain Expertise: ${domainFit}`);
    console.log(`  Cultural Fit: ${culturalFit}\n`);

    // Decision logic
    let decision = 'Borderline';
    if (finalScore >= 75) decision = 'Strong Hire';
    else if (finalScore >= 60) decision = 'Hire';
    else if (finalScore >= 45) decision = 'Borderline';
    else decision = 'Reject';

    console.log(`✅ Decision: ${decision} (Score: ${finalScore}/100)\n`);

    // Save to DB
    await application.update({
      final_decision: decision,
      role_recommendation: `Based on computed metrics (Score: ${finalScore}/100), candidate shows ${decision === 'Strong Hire' || decision === 'Hire' ? 'sufficient' : 'insufficient'} alignment for the target role.`,
      fit_breakdown: {
        technical: technicalFit,
        communication: commFit,
        leadership: leadershipFit,
        domain_expertise: domainFit,
        cultural_fit: culturalFit
      },
      ai_rationale: `Deterministic scoring applied. Assessment: ${assessmentScore}%, Interview: ${interviewScore}%, Integrity: ${integrityScore}%. Weighted final: ${finalScore}/100.`,
      success_probability: finalScore / 100,
      overall_score: finalScore
    });

    console.log('✓ Application #59 updated successfully in database');
    console.log('✓ Refresh the browser to see the updated decision model');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

generateDecisionDeterministic();
