const aiService = require('../services/ai.service');
const scoringService = require('../services/scoring.service');
const { 
  Resume, 
  ResumeAnalysis, 
  AssessmentAnalysis, 
  InterviewAnalysis, 
  AIDecision,
  Application,
  ApplicationStatusLog,
  Candidate,
  ManualJobMapping,
  Job
} = require('../models');
const logger = require('../utils/logger');

/**
 * ==================== RESUME OPERATIONS ====================
 */

/**
 * Parse resume with AI enhancement and JD matching
 */
exports.parseResumeWithAI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded',
        code: 'FILE_MISSING'
      });
    }

    const { applicationId, jobId } = req.body;
    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'applicationId is required',
        code: 'APP_ID_MISSING'
      });
    }

    logger.info(`Parsing resume for application ${applicationId}`);

    // Parse with AI service
    const parsedData = await aiService.parseResumeWithAI(req.file.path);
    
    // Generate resume summary
    const summary = await aiService.generateResumeSummary(parsedData);

    // Fetch Job Data for Fallback/Validation
    const job = jobId ? await Job.findByPk(jobId) : null;
    const jdText = job ? `${job.title} ${job.description} ${job.required_skills?.join(' ')}` : '';
    const resumeText = JSON.stringify(parsedData);
    
    // ML Validation Layer (Cosine Similarity)
    const cosineSimilarityScore = scoringService.calculateCosineSimilarity(jdText, resumeText);
    const hybridJDScore = Math.round((parsedData.overall_score * 0.6) + (cosineSimilarityScore * 40));

    // Store parsing result in database
    const resumeAnalysis = await ResumeAnalysis.create({
      application_id: applicationId,
      resume_id: parsedData.resume_id || null,
      contact_info: parsedData.contact_info,
      education: parsedData.education,
      experience: parsedData.experience,
      skills: parsedData.skills,
      certifications: parsedData.certifications,
      languages: parsedData.languages,
      ai_summary: summary.executive_summary,
      strengths: summary.key_strengths,
      weaknesses: summary.weaknesses || [],
      recommendations: summary.recommended_improvements || [],
      key_achievements: parsedData.key_achievements,
      overall_score: hybridJDScore,
      jd_match_score: 0, 
      total_years_experience: parsedData.total_years_experience,
      highest_qualification: parsedData.highest_qualification,
      ai_model_used: 'gemini-1.5-flash-hybrid'
    });

    // JD matching if jobId provided
    let jdScore = null;
    if (jobId) {
      jdScore = await aiService.scoreResume(parsedData, jobId);
      const finalJDScore = Math.round((jdScore.overall_fit_percentage * 0.6) + (cosineSimilarityScore * 40));
      await resumeAnalysis.update({
        jd_match_score: finalJDScore,
        jd_matched_skills: jdScore.matched_skills,
        jd_missing_skills: jdScore.missing_skills
      });
    }

    // Update application with resume score
    await Application.update(
      { 
        resume_score: resumeAnalysis.jd_match_score || resumeAnalysis.overall_score,
        status: 'RESUME_EVALUATED'
      },
      { where: { id: applicationId } }
    );

    // Log status change
    await ApplicationStatusLog.create({
      application_id: applicationId,
      previous_status: 'RESUME_SUBMITTED',
      new_status: 'RESUME_EVALUATED',
      changed_by: 'system',
      changed_by_role: 'system',
      is_ai_decision: true,
      reason: 'Resume parsed and scored using Hybrid AI+ML Engine',
      ai_score: resumeAnalysis.overall_score
    });

    return res.status(200).json({
      success: true,
      message: 'Resume parsed successfully with Hybrid AI analysis',
      data: {
        analysis_id: resumeAnalysis.id,
        resume_score: resumeAnalysis.overall_score,
        jd_match_score: resumeAnalysis.jd_match_score,
        summary: summary,
        cosine_similarity: cosineSimilarityScore
      }
    });

  } catch (error) {
    logger.warn(`AI Resume parsing failed for application ${req.body.applicationId}, triggering ML Fallback:`, error.message);
    
    try {
      const { applicationId, jobId } = req.body;
      const job = jobId ? await Job.findByPk(jobId) : null;
      const application = await Application.findByPk(applicationId);
      
      const jdText = job ? `${job.title} ${job.description} ${job.required_skills?.join(' ')}` : '';
      const candidateInfo = `${application?.skills?.join(' ')} ${application?.experience_years} years ${application?.education}`;
      
      const mlScore = Math.round(scoringService.calculateCosineSimilarity(jdText, candidateInfo) * 100);
      
      const resumeAnalysis = await ResumeAnalysis.create({
        application_id: applicationId,
        ai_summary: "Generated via ML Fallback (Cosine Similarity) due to AI unavailability.",
        overall_score: mlScore,
        jd_match_score: mlScore,
        strengths: ["Technical compatibility detected via ML profile mapping"],
        weaknesses: mlScore < 50 ? ["Partial keyword match with JD requirements"] : [],
        ai_model_used: 'ml-fallback-cosine'
      });

      await Application.update({ resume_score: mlScore, status: 'RESUME_EVALUATED' }, { where: { id: applicationId } });

      return res.status(200).json({
        success: true,
        message: 'Resume evaluated using robust ML fallback (AI service unavailable)',
        data: { analysis_id: resumeAnalysis.id, resume_score: mlScore, is_backup: true, method: 'ML_COSINE' }
      });
    } catch (manualError) {
      logger.error(`Critical Failure: Even ML fallback failed for app ${req.body.applicationId}:`, manualError);
      return res.status(500).json({ success: false, message: 'Total failure of evaluation system' });
    }
  }
};

/**
 * ==================== ASSESSMENT OPERATIONS ====================
 */

/**
 * Analyze coding solution
 */
exports.analyzeCodingAssessment = async (req, res) => {
  try {
    const { applicationId, code, problemDescription, testName } = req.body;

    if (!code || !problemDescription || !applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: applicationId, code, problemDescription',
        code: 'INVALID_INPUT'
      });
    }

    logger.info(`Analyzing coding solution for application ${applicationId}`);

    // Analyze with AI service
    const analysis = await aiService.analyzeCodingSolution(code, problemDescription);

    // Store assessment analysis
    const assessmentAnalysis = await AssessmentAnalysis.create({
      application_id: applicationId,
      assessment_type: 'coding',
      test_name: testName || 'Coding Challenge',
      candidate_response: { code, problemDescription },
      overall_score: analysis.overall_score,
      correctness_score: analysis.correctness_score,
      code_quality_score: analysis.code_quality_score,
      efficiency_score: analysis.efficiency_score,
      time_complexity: analysis.time_complexity,
      space_complexity: analysis.space_complexity,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      improvement_areas: analysis.optimization_suggestions,
      estimated_skill_level: analysis.skill_level,
      estimated_years_experience: analysis.estimated_experience_years,
      detailed_feedback: JSON.stringify(analysis),
      follow_up_questions: analysis.recommendations,
      ai_model_used: 'gemini-1.5-flash'
    });

    // Update application with technical score
    await Application.update(
      { technical_score: analysis.overall_score },
      { where: { id: applicationId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Coding solution analyzed successfully',
      data: {
        analysis_id: assessmentAnalysis.id,
        score: analysis.overall_score,
        feedback: {
          correctness: analysis.correctness_score,
          code_quality: analysis.code_quality_score,
          efficiency: analysis.efficiency_score,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          recommendations: analysis.recommendations
        },
        time_complexity: analysis.time_complexity,
        space_complexity: analysis.space_complexity,
        skill_level: analysis.skill_level
      }
    });

  } catch (error) {
    logger.warn(`Coding assessment analysis failed for app ${req.body.applicationId}, attempting manual backup:`, error.message);
    try {
      const { applicationId, testName } = req.body;
      const manualResult = manualScorer.scoreTechnical([{ answer: req.body.code, topic: testName || "Coding" }], {});
      
      const assessmentAnalysis = await AssessmentAnalysis.create({
        application_id: applicationId,
        assessment_type: 'coding',
        test_name: testName || 'Coding Challenge',
        overall_score: manualResult.score,
        strengths: manualResult.feedback || ["Technical commitment"],
        weaknesses: (manualResult.score < 50) ? ["Incomplete technical requirements"] : [],
        detailed_feedback: "AI service unavailable. Scored using keyword-based backup logic.",
        ai_model_used: 'manual-logic-backup'
      });

      await Application.update({ technical_score: manualResult.score }, { where: { id: applicationId } });

      return res.status(200).json({
        success: true,
        message: 'Coding solution evaluated using manual backup (AI service unavailable)',
        data: { analysis_id: assessmentAnalysis.id, score: manualResult.score, is_backup: true }
      });
    } catch (manualError) {
      logger.error(`Critical Failure: Manual backup also failed for coding app ${req.body.applicationId}:`, manualError);
      return res.status(500).json({ success: false, message: 'Technical evaluation module failure' });
    }
  }
};

/**
 * Analyze MCQ test responses
 */
exports.analyzeMCQAssessment = async (req, res) => {
  try {
    const { applicationId, questions, answers, testName } = req.body;

    if (!questions || !answers || !applicationId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: applicationId, questions, answers',
        code: 'INVALID_INPUT'
      });
    }

    logger.info(`Analyzing MCQ responses for application ${applicationId}`);

    // Analyze with AI service
    const analysis = await aiService.analyzeMCQTest(questions, answers);

    // Store assessment analysis
    const assessmentAnalysis = await AssessmentAnalysis.create({
      application_id: applicationId,
      assessment_type: 'mcq',
      test_name: testName || 'MCQ Test',
      total_questions: questions.length,
      candidate_response: { answers },
      overall_score: (analysis.score_percentage / 100) * 100,
      correctness_score: analysis.score_percentage,
      correct_answers: analysis.correct_answers,
      incorrect_answers: (questions.length - analysis.correct_answers),
      unattempted: 0,
      topic_scores: analysis.topics_strengths ? { strengths: analysis.topics_strengths } : {},
      strengths: analysis.topics_strengths || [],
      weaknesses: analysis.topics_weaknesses || [],
      improvement_areas: analysis.learning_recommendations || [],
      estimated_skill_level: analysis.estimated_skill_level,
      detailed_feedback: JSON.stringify(analysis),
      ai_model_used: 'gemini-1.5-flash'
    });

    // Update application with technical score
    await Application.update(
      { technical_score: analysis.score_percentage },
      { where: { id: applicationId } }
    );

    return res.status(200).json({
      success: true,
      message: 'MCQ assessment analyzed successfully',
      data: {
        analysis_id: assessmentAnalysis.id,
        score_percentage: analysis.score_percentage,
        correct_answers: analysis.correct_answers,
        total_questions: questions.length,
        performance_level: analysis.performance_level,
        topics_strengths: analysis.topics_strengths,
        topics_weaknesses: analysis.topics_weaknesses,
        skill_level: analysis.estimated_skill_level
      }
    });

  } catch (error) {
    logger.warn(`MCQ assessment analysis failed for app ${req.body.applicationId}, attempting manual backup:`, error.message);
    try {
      const { applicationId, questions, answers, testName } = req.body;
      
      // Basic percentage calc if AI fails for MCQ
      let correct = 0;
      questions.forEach((q, i) => { if (answers[i] === q.correct_answer) correct++; });
      const score = (correct / questions.length) * 100;

      const assessmentAnalysis = await AssessmentAnalysis.create({
        application_id: applicationId,
        assessment_type: 'mcq',
        test_name: testName || 'MCQ Test',
        overall_score: score,
        ai_model_used: 'manual-logic-backup'
      });

      await Application.update({ technical_score: score }, { where: { id: applicationId } });

      return res.status(200).json({
        success: true,
        message: 'MCQ evaluated using manual logic (AI service unavailable)',
        data: { analysis_id: assessmentAnalysis.id, score_percentage: score, is_backup: true }
      });
    } catch (manualError) {
      return res.status(500).json({ success: false, message: 'MCQ evaluation module failure' });
    }
  }
};

/**
 * ==================== INTERVIEW OPERATIONS ====================
 */

/**
 * Analyze interview session
 */
exports.analyzeInterview = async (req, res) => {
  try {
    const { applicationId, transcript, questions, interviewType } = req.body;

    if (!applicationId || !transcript) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: applicationId, transcript',
        code: 'INVALID_INPUT'
      });
    }

    logger.info(`Analyzing interview for application ${applicationId}`);

    // Analyze with AI service
    const analysis = await aiService.analyzeInterview(transcript, {
      type: interviewType || 'technical',
      questions
    });

    // Store interview analysis
    const interviewAnalysis = await InterviewAnalysis.create({
      application_id: applicationId,
      interview_type: interviewType || 'technical',
      transcript: transcript.substring(0, 5000), // Store first 5000 chars
      qa_pairs: analysis.qa_analyses || [],
      overall_score: analysis.overall_assessment?.overall_score || 0,
      technical_knowledge_score: analysis.overall_assessment?.overall_score * 0.3,
      problem_solving_score: analysis.overall_assessment?.overall_score * 0.25,
      communication_score: analysis.overall_assessment?.overall_score * 0.2,
      soft_skills_score: analysis.overall_assessment?.overall_score * 0.15,
      cultural_fit_score: analysis.overall_assessment?.overall_score * 0.1,
      answer_analyses: analysis.qa_analyses,
      strengths: analysis.overall_assessment?.key_takeaways || [],
      weaknesses: [],
      green_flags: analysis.green_flags || [],
      red_flags: analysis.red_flags || [],
      hire_recommendation: analysis.recommendation || 'maybe',
      next_round_ready: analysis.overall_assessment?.next_round_readiness || false,
      detailed_evaluation: JSON.stringify(analysis),
      ai_model_used: 'gemini-1.5-flash'
    });

    // Update application with interview score
    await Application.update(
      { interview_score: interviewAnalysis.overall_score },
      { where: { id: applicationId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Interview analyzed successfully',
      data: {
        analysis_id: interviewAnalysis.id,
        overall_score: interviewAnalysis.overall_score,
        hire_recommendation: analysis.recommendation,
        strengths: analysis.overall_assessment?.key_takeaways || [],
        red_flags: analysis.red_flags || [],
        green_flags: analysis.green_flags || [],
        next_round_ready: analysis.overall_assessment?.next_round_readiness
      }
    });

  } catch (error) {
    logger.warn(`Interview analysis failed for app ${req.body.applicationId}, attempting manual backup:`, error.message);
    try {
      const { applicationId, transcript, interviewType } = req.body;
      const manualResult = manualScorer.scoreInterview(transcript, {});

      const interviewAnalysis = await InterviewAnalysis.create({
        application_id: applicationId,
        interview_type: interviewType || 'technical',
        overall_score: manualResult.score,
        hire_recommendation: manualResult.recommendation,
        strengths: manualResult.pros || ["Strong communication"],
        weaknesses: manualResult.cons || [],
        detailed_evaluation: "AI service unavailable. Scored using sentiment-based backup logic.",
        ai_model_used: 'manual-logic-backup'
      });

      await Application.update({ interview_score: manualResult.score }, { where: { id: applicationId } });

      return res.status(200).json({
        success: true,
        message: 'Interview evaluated using manual logic (AI service unavailable)',
        data: { analysis_id: interviewAnalysis.id, overall_score: manualResult.score, is_backup: true }
      });
    } catch (manualError) {
      return res.status(500).json({ success: false, message: 'Interview evaluation module failure' });
    }
  }
};

/**
 * ==================== AUTO-REJECTION ENGINE ====================
 */

/**
 * Calculate final AI decision and execute auto-rejection
 */
exports.makeFinalAIDecision = async (req, res) => {
  try {
    const { applicationId, jobId } = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'applicationId is required',
        code: 'APP_ID_MISSING'
      });
    }

    logger.info(`Making final AI decision for application ${applicationId}`);

    // Get application with all scores
    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        code: 'APP_NOT_FOUND'
      });
    }

    // Get scores
    const resumeScore = application.resume_score || 0;
    const technicalScore = application.technical_score || 0;
    const interviewScore = application.interview_score || 0;

    // Weighted calculation (as per architecture)
    // resume: 0.3, technical: 0.4, interview: 0.3
    const finalScore = (
      (resumeScore * 0.3) +
      (technicalScore * 0.4) +
      (interviewScore * 0.3)
    );

    // Threshold for auto-rejection (configurable)
    const rejectionThreshold = parseFloat(process.env.REJECTION_THRESHOLD || 40);
    const proceedThreshold = parseFloat(process.env.PROCEED_THRESHOLD || 60);

    // Determine decision
    let aiDecision = 'PROCEED_TO_HR';
    let decisionReason = '';

    if (finalScore < rejectionThreshold) {
      aiDecision = 'AUTO_REJECTED';
      decisionReason = `Score ${finalScore.toFixed(2)} below rejection threshold of ${rejectionThreshold}`;
    } else if (finalScore >= proceedThreshold) {
      aiDecision = 'RECOMMENDED';
      decisionReason = `Score ${finalScore.toFixed(2)} above recommended threshold of ${proceedThreshold}`;
    } else {
      decisionReason = `Score ${finalScore.toFixed(2)} requires HR review`;
    }

    // Store AI decision
    const aiDecisionRecord = await AIDecision.create({
      application_id: applicationId,
      candidate_id: application.candidate_id,
      job_id: jobId || application.job_id,
      resume_score: resumeScore,
      resume_weight: 0.3,
      technical_assessment_score: technicalScore,
      technical_weight: 0.4,
      interview_score: interviewScore,
      interview_weight: 0.3,
      final_score: finalScore,
      score_threshold: rejectionThreshold,
      meets_minimum_requirements: finalScore >= rejectionThreshold,
      ai_decision: aiDecision,
      decision_reason: decisionReason,
      confidence_percentage: Math.min(Math.abs(finalScore - 50) + 50, 100),
      summary: generateDecisionSummary(application, finalScore, aiDecision),
      ai_model_used: 'gemini-1.5-flash'
    });

    // Update application status based on decision
    let newStatus = 'HR_REVIEW';
    if (aiDecision === 'AUTO_REJECTED') {
      newStatus = 'REJECTED';
    } else if (aiDecision === 'RECOMMENDED') {
      newStatus = 'HR_REVIEW';
    }

    await Application.update(
      { 
        status: newStatus,
        overall_score: finalScore
      },
      { where: { id: applicationId } }
    );

    // Log status change
    await ApplicationStatusLog.create({
      application_id: applicationId,
      previous_status: application.status,
      new_status: newStatus,
      changed_by: 'system',
      changed_by_role: 'system',
      is_ai_decision: true,
      ai_decision_id: aiDecisionRecord.id,
      reason: decisionReason,
      ai_score: finalScore
    });

    return res.status(200).json({
      success: true,
      message: 'Final AI decision made and applied',
      data: {
        decision_id: aiDecisionRecord.id,
        final_score: finalScore,
        ai_decision: aiDecision,
        new_status: newStatus,
        reason: decisionReason,
        score_breakdown: {
          resume_score: resumeScore,
          technical_score: technicalScore,
          interview_score: interviewScore
        },
        threshold: rejectionThreshold
      }
    });

  } catch (error) {
    logger.error(`Final AI decision error for application ${req.body.applicationId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error making final decision',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      code: 'DECISION_ERROR'
    });
  }
};

/**
 * ==================== UTILITY ENDPOINTS ====================
 */

/**
 * Get AI analysis for application (with RBAC filtering)
 */
exports.getAIAnalysis = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userRole = req.user?.role; // Set by auth middleware

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        message: 'applicationId is required',
        code: 'APP_ID_MISSING'
      });
    }

    // RBAC Check: Only HR, MD, and Admin can see full AI analysis
    const restrictedRoles = ['candidate'];
    if (restrictedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to AI analysis',
        code: 'ACCESS_DENIED'
      });
    }

    // Fetch all related analyses
    const resumeAnalysis = await ResumeAnalysis.findOne({
      where: { application_id: applicationId }
    });

    const assessmentAnalyses = await AssessmentAnalysis.findAll({
      where: { application_id: applicationId }
    });

    const interviewAnalysis = await InterviewAnalysis.findOne({
      where: { application_id: applicationId }
    });

    const aiDecision = await AIDecision.findOne({
      where: { application_id: applicationId }
    });

    return res.status(200).json({
      success: true,
      message: 'AI analysis retrieved successfully',
      data: {
        resume_analysis: resumeAnalysis,
        assessment_analyses: assessmentAnalyses,
        interview_analysis: interviewAnalysis,
        ai_decision: aiDecision
      }
    });

  } catch (error) {
    logger.error(`Get AI analysis error for application ${req.params.applicationId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving AI analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      code: 'FETCH_ERROR'
    });
  }
};

/**
 * Health check endpoint
 */
exports.healthCheck = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'AI Service operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'AI Service health check failed',
      error: error.message
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * ==================== ANALYTICS ENDPOINTS ====================
 */

/**
 * Get AI analytics data for dashboard
 * GET /api/ai/analytics?jobId=X&departmentId=Y&skillLevel=Z
 * Returns aggregated stats, score distribution, decision breakdown
 */
exports.getAIAnalytics = async (req, res) => {
  try {
    const { jobId, departmentId, skillLevel } = req.query;
    const userRole = req.user?.role;

    // RBAC Check: Only HR, MD, and Admin can see analytics
    const restrictedRoles = ['candidate'];
    if (restrictedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to analytics',
        code: 'ACCESS_DENIED'
      });
    }

    // Build query conditions
    const whereConditions = {};
    if (jobId) whereConditions.job_id = jobId;

    // Fetch AI decisions with pagination
    let decisions = await AIDecision.findAll({
      where: whereConditions,
      include: [
        {
          model: Application,
          include: [{ model: Candidate }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Filter by skill level if provided
    if (skillLevel) {
      decisions = decisions.filter(d => {
        const estimatedLevel = d.summary?.includes('junior') ? 'junior' :
                               d.summary?.includes('mid') ? 'mid_level' : 'senior';
        return estimatedLevel === skillLevel;
      });
    }

    // Calculate statistics
    const stats = {
      total_applications: decisions.length,
      recommended_count: decisions.filter(d => d.ai_decision === 'RECOMMENDED').length,
      rejected_count: decisions.filter(d => d.ai_decision === 'AUTO_REJECTED').length,
      proceeding_count: decisions.filter(d => d.ai_decision === 'PROCEED_TO_HR').length,
      average_final_score: decisions.length > 0 
        ? (decisions.reduce((sum, d) => sum + (d.final_score || 0), 0) / decisions.length).toFixed(2)
        : 0,
      average_resume_score: decisions.length > 0
        ? (decisions.reduce((sum, d) => sum + (d.resume_score || 0), 0) / decisions.length).toFixed(2)
        : 0,
      average_technical_score: decisions.length > 0
        ? (decisions.reduce((sum, d) => sum + (d.technical_assessment_score || 0), 0) / decisions.length).toFixed(2)
        : 0,
      average_interview_score: decisions.length > 0
        ? (decisions.reduce((sum, d) => sum + (d.interview_score || 0), 0) / decisions.length).toFixed(2)
        : 0
    };

    // Map candidates data
    const candidates = decisions.map(d => ({
      id: d.Application?.id,
      candidate_id: d.candidate_id,
      candidate_name: d.Application?.Candidate?.name || 'Unknown',
      candidate_email: d.Application?.Candidate?.email,
      job_id: d.job_id,
      resume_score: d.resume_score,
      technical_score: d.technical_assessment_score,
      interview_score: d.interview_score,
      final_score: d.final_score,
      ai_decision: d.ai_decision,
      confidence: d.confidence_percentage,
      created_at: d.createdAt
    }));

    // Score distribution (buckets: 0-20, 20-40, 40-60, 60-80, 80-100)
    const scoreDistribution = [
      { range: '0-20', count: decisions.filter(d => (d.final_score || 0) < 20).length },
      { range: '20-40', count: decisions.filter(d => (d.final_score || 0) >= 20 && (d.final_score || 0) < 40).length },
      { range: '40-60', count: decisions.filter(d => (d.final_score || 0) >= 40 && (d.final_score || 0) < 60).length },
      { range: '60-80', count: decisions.filter(d => (d.final_score || 0) >= 60 && (d.final_score || 0) < 80).length },
      { range: '80-100', count: decisions.filter(d => (d.final_score || 0) >= 80).length }
    ];

    // Decision breakdown
    const decisionBreakdown = [
      { decision: 'RECOMMENDED', count: stats.recommended_count, color: '#10b981' },
      { decision: 'PROCEED_TO_HR', count: stats.proceeding_count, color: '#f59e0b' },
      { decision: 'AUTO_REJECTED', count: stats.rejected_count, color: '#ef4444' }
    ];

    // Skill level distribution (estimated from scores)
    const skillLevelDistribution = [
      {
        level: 'senior',
        count: decisions.filter(d => (d.final_score || 0) >= 70).length
      },
      {
        level: 'mid_level',
        count: decisions.filter(d => (d.final_score || 0) >= 50 && (d.final_score || 0) < 70).length
      },
      {
        level: 'junior',
        count: decisions.filter(d => (d.final_score || 0) < 50).length
      }
    ];

    return res.status(200).json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: {
        stats,
        candidates,
        scoreDistribution,
        decisionBreakdown,
        skillLevelDistribution
      }
    });

  } catch (error) {
    logger.error('Analytics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      code: 'ANALYTICS_ERROR'
    });
  }
};

/**
 * Export analytics data to CSV
 * POST /api/ai/analytics/export
 */
exports.exportAIAnalytics = async (req, res) => {
  try {
    const { jobId, departmentId, skillLevel } = req.body;

    // Fetch data same as analytics endpoint
    const whereConditions = {};
    if (jobId) whereConditions.job_id = jobId;

    let decisions = await AIDecision.findAll({
      where: whereConditions,
      include: [
        {
          model: Application,
          include: [{ model: Candidate }]
        }
      ]
    });

    if (skillLevel) {
      decisions = decisions.filter(d => {
        const estimatedLevel = d.summary?.includes('junior') ? 'junior' :
                               d.summary?.includes('mid') ? 'mid_level' : 'senior';
        return estimatedLevel === skillLevel;
      });
    }

    // Build CSV content
    const headers = ['Candidate', 'Email', 'Job ID', 'Resume Score', 'Technical Score', 'Interview Score', 'Final Score', 'AI Decision', 'Status', 'Confidence %'];
    const rows = decisions.map(d => [
      d.Application?.Candidate?.name || 'Unknown',
      d.Application?.Candidate?.email || '',
      d.job_id,
      (d.resume_score || 0).toFixed(2),
      (d.technical_assessment_score || 0).toFixed(2),
      (d.interview_score || 0).toFixed(2),
      (d.final_score || 0).toFixed(2),
      d.ai_decision,
      d.Application?.status || 'PENDING',
      (d.confidence_percentage || 0).toFixed(1)
    ]);

    // Create CSV string
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Send as download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ai-analytics-${new Date().toISOString().split('T')[0]}.csv"`);
    return res.send(csv);

  } catch (error) {
    logger.error('Analytics export error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error exporting analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
};

/**
 * Re-evaluate an existing assessment (re-trigger AI or fallback)
 */
exports.reEvaluateAssessment = async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!applicationId) return res.status(400).json({ success: false, message: 'applicationId is required' });

    logger.info(`Manually re-evaluating assessment for app ${applicationId}`);

    // Try to find raw responses from the last attempt (usually stored in AssessmentAnalysis or a separate model)
    const analysis = await AssessmentAnalysis.findOne({ 
      where: { application_id: applicationId },
      order: [['createdAt', 'DESC']]
    });

    if (!analysis || !analysis.candidate_response) {
      return res.status(404).json({ success: false, message: 'No candidate response data found to re-evaluate' });
    }

    // Pass back to analysis handlers
    req.body.code = analysis.candidate_response.code || analysis.candidate_response.answers;
    req.body.problemDescription = analysis.candidate_response.problemDescription;
    req.body.questions = analysis.candidate_response.questions;
    req.body.answers = analysis.candidate_response.answers;

    if (analysis.assessment_type === 'coding') {
       return exports.analyzeCodingAssessment(req, res);
    } else {
       return exports.analyzeMCQAssessment(req, res);
    }

  } catch (error) {
    logger.error(`Re-evaluation error for app ${req.body.applicationId}:`, error);
    return res.status(500).json({ success: false, message: 'Re-evaluation failed' });
  }
};

function generateDecisionSummary(application, finalScore, decision) {
  const summaries = {
    'AUTO_REJECTED': `Candidate was automatically rejected based on insufficient score (${finalScore.toFixed(2)}/100). Does not meet minimum job requirements.`,
    'PROCEED_TO_HR': `Candidate score (${finalScore.toFixed(2)}/100) qualifies for HR review. Recommend discussion with hiring team.`,
    'RECOMMENDED': `Candidate strongly recommended for hire with score ${finalScore.toFixed(2)}/100. Exceeds job requirements.`
  };
  return summaries[decision] || 'Decision pending further review';
}

module.exports = exports;
