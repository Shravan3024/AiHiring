const { 
  Application,
  AssessmentAttempt, 
  TechnicalQuestionBank, 
  ApplicationStatusLog, 
  Job, 
  AssessmentAnalysis, 
  MalpracticeEvent 
} = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const aiService = require("../services/ai.service");
const scoringService = require('../services/scoring.service');
const logger = require("../utils/logger");

const ASSESSMENT_CONFIG = {
  DURATION_MINUTES: 60,
  TOTAL_QUESTIONS: 25,
  TECH_QUESTIONS: 20,
  BEHAVIORAL_QUESTIONS: 5,
  PASSING_SCORE: 60,
  TECH_WEIGHT: 0.8,
  BEHAVIOR_WEIGHT: 0.2
};

// ================= START ASSESSMENT =================
exports.startAssessment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { applicationId } = req.params;
    const candidateId = req.candidate.id;

    const application = await Application.findOne({
      where: { id: applicationId, candidate_id: candidateId },
      include: [{ model: Job }]
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Application not found' });
    }

    const job = application.Job;
    
    // Fetch randomized questions based on job_id
    const techQuestions = await TechnicalQuestionBank.findAll({
      attributes: ['questionId', 'question', 'options', 'difficulty', 'questionType', 'topic'],
      where: { 
        [Op.or]: [{ job_id: job.id }, { job_id: null }],
        questionType: 'MCQ',
        difficulty: { [Op.in]: ['MEDIUM', 'HARD'] },
        isActive: true
      },
      order: sequelize.literal('RANDOM()'),
      limit: ASSESSMENT_CONFIG.TECH_QUESTIONS,
      transaction
    });

    const behavioralQuestions = await TechnicalQuestionBank.findAll({
      attributes: ['questionId', 'question', 'options', 'difficulty', 'questionType', 'topic'],
      where: { 
        [Op.or]: [{ questionType: 'THEORY' }, { questionType: 'MCQ' }],
        topic: { [Op.iLike]: '%behavioral%' },
        isActive: true
      },
      order: sequelize.literal('RANDOM()'),
      limit: ASSESSMENT_CONFIG.BEHAVIORAL_QUESTIONS,
      transaction
    });

    const selectedQuestions = [...techQuestions, ...behavioralQuestions];
    
    if (selectedQuestions.length === 0) {
       selectedQuestions.push({
         questionId: 'placeholder_001',
         question: 'Please describe your core technical expertise and major projects (System Fallback Question)',
         options: [],
         questionType: 'THEORY',
         difficulty: 'MEDIUM',
         weight: 5
       });
       logger.error(`CRITICAL: Question bank empty for job ${job.id}. Using placeholder.`);
    }

    const questionIds = selectedQuestions.map(q => q.questionId || q.id);

    // Initialise or Fetch Attempt
    let attempt = await AssessmentAttempt.findOne({ 
      where: { application_id: applicationId },
      transaction 
    });
    
    if (attempt && attempt.status === 'SUBMITTED') {
      await transaction.rollback();
      return res.status(400).json({ error: 'Assessment already submitted' });
    }

    const commonUpdate = {
      status: 'IN_PROGRESS',
      started_at: new Date(),
      metadata: { 
        question_ids: questionIds,
        config: ASSESSMENT_CONFIG 
      },
      answers: {} 
    };

    if (attempt) {
       await attempt.update(commonUpdate, { transaction });
    } else {
       attempt = await AssessmentAttempt.create({
         ...commonUpdate,
         application_id: applicationId,
         assessment_type: 'TECHNICAL',
         ip_address: req.ip || req.connection?.remoteAddress,
         device_info: { userAgent: req.headers['user-agent'] }
       }, { transaction });
    }

    await application.update({ status: 'TECHNICAL_ROUND_IN_PROGRESS' }, { transaction });
    await ApplicationStatusLog.create({
      application_id: applicationId,
      previous_status: application.status,
      new_status: 'TECHNICAL_ROUND_IN_PROGRESS',
      changed_by: candidateId
    }, { transaction });

    await transaction.commit();

    res.json({
      success: true,
      attempt_id: attempt.id,
      duration: ASSESSMENT_CONFIG.DURATION_MINUTES,
      questions: selectedQuestions.map(q => ({
        id: q.questionId || q.id,
        question: q.question,
        options: q.options,
        category: q.questionType,
        difficulty: q.difficulty,
        weight: q.weight || 1
      }))
    });

  } catch (error) {
    if (transaction) await transaction.rollback();
    logger.error('Start assessment error:', error);
    res.status(500).json({ error: 'Failed to start assessment', details: error.message });
  }
};

// ================= SAVE ANSWER (AUTO SAVE) =================
exports.saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { question_id, answer_text } = req.body;

    const attempt = await AssessmentAttempt.findByPk(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const currentAnswers = attempt.answers || {};
    currentAnswers[question_id] = {
      answer_text: answer_text,
      timestamp: new Date()
    };

    // Use update to ensure JSON column is recognized as changed
    await AssessmentAttempt.update({ 
      answers: currentAnswers,
      updated_at: new Date()
    }, { 
      where: { id: attemptId }
    });

    res.json({ success: true, message: "State preserved" });
  } catch (error) {
    logger.error('Save answer error:', error);
    res.status(500).json({ error: 'Failed' });
  }
};

// ================= SUBMIT ASSESSMENT =================
exports.submitAssessment = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const candidateId = req.candidate.id;

    const attempt = await AssessmentAttempt.findByPk(attemptId, { 
      include: [{ model: Application, include: [Job] }] 
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') {
      return res.status(400).json({ error: 'Invalid attempt' });
    }

    const storedAnswers = attempt.answers || {};
    const questions = await TechnicalQuestionBank.findAll({ 
      attributes: ['questionId', 'question', 'options', 'difficulty', 'questionType', 'topic', 'correct_answer', 'weight'],
      where: { questionId: attempt.metadata.question_ids || [] } 
    });

    let technicalScore = 0;
    let behavioralScore = 0;
    let techTotalWeight = 0;
    let behaviorTotalWeight = 0;

    for (const q of questions) {
      const qId = q.questionId;
      const ansData = storedAnswers[qId];
      const answerText = ansData?.answer_text || "";
      
      let qMLScore = 0;
      let qAIScore = 0;

      // 1. ML Scoring
      if (q.correct_answer) {
        qMLScore = (answerText.trim() === q.correct_answer.trim()) ? 100 : 0;
      } else {
        qMLScore = Math.round(scoringService.calculateCosineSimilarity(answerText, q.question || "") * 100);
      }

      // 2. AI Scoring
      const isBehavioral = q.topic?.toLowerCase().includes('behavioral') || q.questionType === 'THEORY';
      
      try {
        if (isBehavioral || !q.correct_answer) {
          const aiRes = await aiService.analyzeAssessmentResponse({
              question: q.question,
              answer: answerText,
              category: isBehavioral ? 'BEHAVIORAL' : 'TECHNICAL'
          });
          qAIScore = aiRes.score || 0;
        } else {
          qAIScore = qMLScore;
        }
      } catch (e) {
        qAIScore = qMLScore;
      }

      const qFinalScore = Math.round((qAIScore * 0.7) + (qMLScore * 0.3));
      const qWeight = q.weight || 1;
      const weightedScore = (qFinalScore / 100) * qWeight;

      if (!isBehavioral) {
        technicalScore += weightedScore;
        techTotalWeight += qWeight;
      } else {
        behavioralScore += weightedScore;
        behaviorTotalWeight += qWeight;
      }
    }

    const finalTechScore = techTotalWeight > 0 ? (technicalScore / techTotalWeight) * 100 : 0;
    const finalBehaviorScore = behaviorTotalWeight > 0 ? (behavioralScore / behaviorTotalWeight) * 100 : 0;
    
    const aggregatedScore = (finalTechScore * ASSESSMENT_CONFIG.TECH_WEIGHT) + 
                             (finalBehaviorScore * ASSESSMENT_CONFIG.BEHAVIOR_WEIGHT);

    const malpracticePenalty = Math.min(attempt.malpractice_score || 0, 40);
    const finalScore = Math.max(0, Math.round(aggregatedScore - malpracticePenalty));

    await attempt.update({
      ai_score: Math.round(finalTechScore),
      ml_score: Math.round(finalBehaviorScore),
      final_score: finalScore,
      score: finalScore,
      status: 'EVALUATED'
    });

    const application = attempt.Application;
    const passed = finalScore >= ASSESSMENT_CONFIG.PASSING_SCORE;
    
    await application.update({
      technical_score: finalScore,
      status: passed ? 'TECHNICAL_ROUND_COMPLETED' : 'REJECTED'
    });

    await AssessmentAnalysis.create({
      application_id: application.id,
      overall_score: finalScore,
      assessment_type: 'TECHNICAL',
      test_name: `${application.Job?.title} Technical Assessment`,
      strengths: [`Technical accuracy: ${Math.round(finalTechScore)}%`],
      weaknesses: finalTechScore < 60 ? ["Domain concepts"] : [],
      detailed_feedback: `Final Evaluation: ${finalScore}%. (AI: ${Math.round(finalTechScore)}%, Behavioral: ${Math.round(finalBehaviorScore)}%). Penalty: ${malpracticePenalty}.`
    });

    res.json({ success: true, score: finalScore, passed });

  } catch (error) {
    logger.error('Submit error:', error);
    res.status(500).json({ error: 'Submission failed' });
  }
};

// ================= LOG MALPRACTICE =================
exports.logMalpractice = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { type, severity, metadata } = req.body;

    const attempt = await AssessmentAttempt.findByPk(attemptId);
    if (!attempt || attempt.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Invalid' });

    const penaltyMap = { 'TAB_SWITCH': 5, 'FULLSCREEN_EXIT': 10, 'COPY_ATTEMPT': 3, 'WINDOW_BLUR': 2 };
    const penalty = penaltyMap[type] || severity || 0;
    
    await attempt.update({
      malpractice_score: (attempt.malpractice_score || 0) + penalty,
      anti_cheating_data: [...(attempt.anti_cheating_data || []), { type, penalty, timestamp: new Date(), metadata }]
    });

    await MalpracticeEvent.create({
      application_id: attempt.application_id,
      type,
      severity: penalty,
      meta: metadata
    });

    res.json({ success: true, total: attempt.malpractice_score + penalty });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

exports.getAssessmentConfig = async (req, res) => res.json(ASSESSMENT_CONFIG);

exports.getAssessmentStatus = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await AssessmentAttempt.findByPk(attemptId);
    if (!attempt) return res.status(404).json({ error: 'Not found' });
    const expiry = new Date(attempt.started_at).getTime() + ASSESSMENT_CONFIG.DURATION_MINUTES * 60 * 1000;
    res.json({ status: attempt.status, time_remaining_ms: Math.max(0, expiry - Date.now()) });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};
