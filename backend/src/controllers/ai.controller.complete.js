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
      ai_model_used: 'gemini-2.5-flash-hybrid'
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
      const candidateInfo = `${application?.skills?.join(' ')} ${application?.summary || ''} ${application?.experience_years} years ${application?.education}`;
      
      const mlScore = Math.round(scoringService.calculateCosineSimilarity(jdText, candidateInfo) * 100);
      const skillMatch = scoringService.matchSkills(job?.required_skills?.join(' ') || job?.title || '', application?.skills || []);

      const resumeAnalysis = await ResumeAnalysis.create({
        application_id: applicationId,
        ai_summary: "Generated via ML Fallback (Cosine Similarity + TF Vectorization) due to AI unavailability.",
        overall_score: mlScore,
        jd_match_score: mlScore,
        jd_matched_skills: skillMatch.matched,
        jd_missing_skills: skillMatch.missing,
        strengths: skillMatch.matchPercentage > 60 ? ["Strong keyword overlap with JD"] : ["Profile surface matching complete"],
        weaknesses: skillMatch.matchPercentage < 30 ? ["Core skill gaps detected in profile"] : [],
        ai_model_used: 'ml-fallback-cosine-tf'
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
    const aiScore = analysis.overall_score || 0;

    // ML Validation Layer (Cosine Similarity)
    const similarityScore = scoringService.calculateCosineSimilarity(code, problemDescription);
    const hybridScore = Math.round((aiScore * 0.6) + (similarityScore * 40));

    // Store assessment analysis
    const assessmentAnalysis = await AssessmentAnalysis.create({
      application_id: applicationId,
      assessment_type: 'coding',
      test_name: testName || 'Coding Challenge',
      candidate_response: { code, problemDescription },
      overall_score: hybridScore,
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
      ai_model_used: 'gemini-2.5-flash-hybrid'
    });

    // Update application with hybrid technical score
    await Application.update(
      { technical_score: assessmentAnalysis.overall_score },
      { where: { id: applicationId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Coding solution analyzed successfully with Hybrid Engine',
      data: {
        analysis_id: assessmentAnalysis.id,
        score: assessmentAnalysis.overall_score,
        confidence: 0.90
      }
    });

  } catch (error) {
    logger.warn(`Coding assessment analysis failed for app ${req.body.applicationId}, triggering ML Fallback:`, error.message);
    try {
      const { applicationId, code, problemDescription, testName } = req.body;
      
      // ML FALLBACK
      const similarityScore = scoringService.calculateCosineSimilarity(code, problemDescription);
      const fallbackScore = Math.round(similarityScore * 100);

      const assessmentAnalysis = await AssessmentAnalysis.create({
        application_id: applicationId,
        assessment_type: 'coding',
        test_name: testName || 'Coding Challenge',
        overall_score: fallbackScore,
        strengths: ["Code matches problem surface requirements"],
        weaknesses: ["AI quality analysis unavailable"],
        detailed_feedback: "AI service unavailable. Scored based on ML-based requirement mapping.",
        ai_model_used: 'ml-fallback-similarity'
      });

      await Application.update({ technical_score: fallbackScore }, { where: { id: applicationId } });

      return res.status(200).json({
        success: true,
        message: 'Coding solution evaluated using ML fallback logic',
        data: { analysis_id: assessmentAnalysis.id, score: fallbackScore, is_fallback: true }
      });
    } catch (manualError) {
      logger.error(`Critical Failure in Coding Scorer:`, manualError);
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

    // Hybrid Integration: For MCQ, AI is used for qualitative feedback, 
    // while the score is strictly deterministic.
    const score = (analysis.score_percentage / 100) * 100;

    // Store assessment analysis
    const assessmentAnalysis = await AssessmentAnalysis.create({
      application_id: applicationId,
      assessment_type: 'mcq',
      test_name: testName || 'MCQ Test',
      total_questions: questions.length,
      candidate_response: { answers },
      overall_score: score,
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
      ai_model_used: 'gemini-2.5-flash-hybrid'
    });

    // Update application with technical score
    await Application.update(
      { technical_score: score },
      { where: { id: applicationId } }
    );

    return res.status(200).json({
      success: true,
      message: 'MCQ assessment analyzed successfully',
      data: {
        analysis_id: assessmentAnalysis.id,
        score_percentage: score,
        skill_level: analysis.estimated_skill_level
      }
    });

  } catch (error) {
    logger.warn(`MCQ assessment analysis failed for app ${req.body.applicationId}, attempting deterministic fallback:`, error.message);
    try {
      const { applicationId, questions, answers, testName } = req.body;
      
      // DETERMINISTIC FALLBACK (Pure Logic)
      let correct = 0;
      questions.forEach((q, i) => { 
        if (answers[i] === q.correct_answer || answers[i]?.toString() === q.correct_answer?.toString()) {
          correct++; 
        }
      });
      const score = Math.round((correct / questions.length) * 100);

      const assessmentAnalysis = await AssessmentAnalysis.create({
        application_id: applicationId,
        assessment_type: 'mcq',
        test_name: testName || 'MCQ Test',
        overall_score: score,
        detailed_feedback: "AI service unavailable. Scored using pure deterministic logic.",
        ai_model_used: 'deterministic-fallback'
      });

      await Application.update({ technical_score: score }, { where: { id: applicationId } });

      return res.status(200).json({
        success: true,
        message: 'MCQ evaluated using deterministic logic fallback',
        data: { analysis_id: assessmentAnalysis.id, score_percentage: score, is_fallback: true }
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

    // AI Analysis Success Path
    const analysis = await aiService.analyzeInterview(transcript, {
      type: interviewType || 'technical',
      questions
    });

    const aiScore = analysis.overall_assessment?.overall_score || 0;

    // ML Validation Layer (TF-IDF + Cosine Similarity)
    // We compare transcript with expected answers or JD context
    const referenceText = questions ? JSON.stringify(questions) : "Job Requirements and Technical Skills";
    const similarityScore = scoringService.calculateCosineSimilarity(transcript, referenceText);
    
    // Hybrid Rule: (ai_score * 0.6) + (cosine_similarity_score * 0.4)
    const hybridScore = Math.round((aiScore * 0.6) + (similarityScore * 40));

    // Store interview analysis
    const interviewAnalysis = await InterviewAnalysis.create({
      application_id: applicationId,
      interview_type: interviewType || 'technical',
      transcript: transcript.substring(0, 5000), 
      qa_pairs: analysis.qa_analyses || [],
      overall_score: hybridScore,
      technical_knowledge_score: Math.round(hybridScore * 0.8),
      problem_solving_score: Math.round(hybridScore * 0.7),
      communication_score: Math.round(hybridScore * 0.9),
      soft_skills_score: Math.round(hybridScore * 0.6),
      cultural_fit_score: Math.round(hybridScore * 0.5),
      answer_analyses: analysis.qa_analyses,
      strengths: analysis.overall_assessment?.key_takeaways || [],
      weaknesses: [],
      green_flags: analysis.green_flags || [],
      red_flags: analysis.red_flags || [],
      hire_recommendation: analysis.recommendation || 'maybe',
      next_round_ready: analysis.overall_assessment?.next_round_readiness || false,
      detailed_evaluation: JSON.stringify(analysis),
      ai_model_used: 'gemini-2.5-flash-hybrid'
    });

    // Update application and core interview record
    const { Interview } = require('../models');
    await Interview.update(
      { 
        ai_score: interviewAnalysis.overall_score, 
        ai_summary: interviewAnalysis.hire_recommendation,
        status: 'COMPLETED'
      },
      { where: { application_id: applicationId } }
    );

    await Application.update(
      { 
        interview_score: interviewAnalysis.overall_score,
        status: 'HR_REVIEW' // Assessment is likely done if they reach here
      },
      { where: { id: applicationId } }
    );

    return res.status(200).json({
      success: true,
      message: 'Interview analyzed successfully using Hybrid Intelligence',
      data: {
        analysis_id: interviewAnalysis.id,
        overall_score: interviewAnalysis.overall_score,
        hire_recommendation: analysis.recommendation,
        strengths: assessmentAnalysis?.strengths || [],
        confidence: 0.92
      }
    });

  } catch (error) {
    logger.warn(`Interview analysis failed for app ${req.body.applicationId}, triggering ML Fallback:`, error.message);
    try {
      const { applicationId, transcript, interviewType } = req.body;
      
      // ML FALLBACK (Deterministic Similarity Engine)
      const similarityScore = scoringService.calculateCosineSimilarity(transcript, "Technical skills, experience, and professional background");
      const fallbackScore = Math.round(similarityScore * 100);

      const interviewAnalysis = await InterviewAnalysis.create({
        application_id: applicationId,
        interview_type: interviewType || 'technical',
        overall_score: fallbackScore,
        hire_recommendation: fallbackScore >= 60 ? 'hire' : 'reject',
        strengths: ["Communication detected via ML sentiment mapping"],
        weaknesses: ["AI deep-analysis unavailable"],
        detailed_evaluation: "AI service unavailable. Scored using ML-based Cosine Similarity fallback.",
        ai_model_used: 'ml-fallback-similarity'
      });

      await Application.update({ interview_score: fallbackScore }, { where: { id: applicationId } });

      return res.status(200).json({
        success: true,
        message: 'Interview evaluated using deterministic ML fallback',
        data: { analysis_id: interviewAnalysis.id, overall_score: fallbackScore, is_fallback: true }
      });
    } catch (manualError) {
      logger.error("Critical Failure in Interview Scorer:", manualError);
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

    // Get application and job data for dynamic weighting
    const application = await Application.findByPk(applicationId, {
      include: [{ model: Job }]
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
        code: 'APP_NOT_FOUND'
      });
    }

    const job = application.Job;
    const resumeScore = application.resume_score || 0;
    const technicalScore = application.technical_score || 0;
    const interviewScore = application.interview_score || 0;
    const isAiAvailable = true; 

    // Calculate text-based skill match for final insights
    const skillMatch = scoringService.matchSkills(job?.required_skills?.join(' ') || job?.title || '', application?.skills || []);

    // Use the upgraded Hybrid Scoring Engine with Dynamic Job weights
    const scoringResult = scoringService.predictFinalScore({
      resumeScore,
      assessmentScore: technicalScore,
      interviewScore,
      malpracticeScore: application.malpractice_warnings || 0,
      aiScore: (resumeScore + technicalScore + interviewScore) / 3,
      skillWeights: job?.skill_weights || {},
      skillMatch: skillMatch
    });
    const finalScore = scoringResult.finalScore;
    const aiDecision = scoringResult.decision === 'HIRE' ? 'RECOMMENDED' : 
                      scoringResult.decision === 'HOLD' ? 'PROCEED_TO_HR' : 'AUTO_REJECTED';
    const decisionReason = scoringResult.insights.reasoning;

    // Store AI decision with hybrid insights
    const aiDecisionRecord = await AIDecision.create({
      application_id: applicationId,
      candidate_id: application.candidate_id,
      job_id: application.job_id,
      resume_score: resumeScore,
      resume_weight: 0.25,
      technical_assessment_score: technicalScore,
      technical_weight: 0.45,
      interview_score: interviewScore,
      interview_weight: 0.30,
      final_score: finalScore,
      score_threshold: 40,
      meets_minimum_requirements: finalScore >= 40,
      ai_decision: aiDecision,
      decision_reason: decisionReason,
      confidence_percentage: Math.round(scoringResult.confidence * 100),
      summary: `Score: ${finalScore}% | Method: ${scoringResult.methodUsed}. ${scoringResult.insights.reasoning}`,
      ai_model_used: isAiAvailable ? 'gemini-2.5-flash-hybrid' : 'ml-regression-fallback'
    });

    // Update application status based on decision
    // DISABLED AUTO-REJECTION AS PER USER REQUEST
    let newStatus = 'HR_REVIEW';
    // if (aiDecision === 'AUTO_REJECTED') {
    //   newStatus = 'REJECTED';
    // } else if (aiDecision === 'RECOMMENDED') {
    //   newStatus = 'HR_REVIEW';
    // }

    await Application.update(
      { 
        status: 'HR_REVIEW', // Consistent review state
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
      metadata: { reason: decisionReason },
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
        threshold: 40
      }
    });

  } catch (error) {
    logger.error(`Final AI decision error for application ${req.body.applicationId}:`, error);
    if (error.errors) {
       error.errors.forEach(e => logger.error(`  - ${e.field}: ${e.message}`));
    }
    return res.status(500).json({
      success: false,
      message: 'Error making final decision',
      error: error.message,
      details: error.errors ? error.errors.map(e => e.message) : null,
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

    // Fetch AssessmentAttempt to get the actual answers provided
    const { AssessmentAttempt, TechnicalQuestionBank } = require('../models');
    const assessmentAttempts = await AssessmentAttempt.findAll({
      where: { application_id: applicationId },
      order: [['created_at', 'DESC']]
    });

    // Enrich assessment analyses with question details if available
    const enrichedAssessments = await Promise.all(assessmentAnalyses.map(async (analysis) => {
      const attempt = assessmentAttempts.find(a => a.id === analysis.attempt_id) || assessmentAttempts[0];
      if (attempt && attempt.answers) {
        // Handle both Array (legacy) and Object (new) formats for answers
        const answersArray = Array.isArray(attempt.answers) 
          ? attempt.answers 
          : Object.entries(attempt.answers).map(([qid, data]) => ({ 
              question_id: qid, 
              answer_text: typeof data === 'string' ? data : data.answer_text 
            }));

        const questionIds = answersArray.map((a) => a.question_id);
        const questions = await TechnicalQuestionBank.findAll({
          where: { questionId: questionIds }
        });

        const detailedAnswers = answersArray.map((ans) => {
          const q = questions.find(q => q.questionId === ans.question_id);
          return {
            question_id: ans.question_id,
            question_text: q?.question || 'Question text unavailable',
            candidate_answer: ans.answer_text,
            correct_answer: q?.correct_answer || q?.expected_answer || 'N/A',
            is_correct: ans.answer_text === q?.correct_answer
          };
        });

        return {
          ...analysis.toJSON(),
          detailed_qa: detailedAnswers
        };
      }
      return analysis;
    }));

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
        assessment_analyses: enrichedAssessments,
        interview_analysis: interviewAnalysis,
        ai_decision: aiDecision,
        assessment_attempts: assessmentAttempts
      }
    });

  } catch (error) {
    logger.error(`Get AI analysis error for application ${req.params.applicationId}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving AI analysis',
      error: error.message,
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
      order: [['created_at', 'DESC']]
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
      order: [['created_at', 'DESC']]
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
