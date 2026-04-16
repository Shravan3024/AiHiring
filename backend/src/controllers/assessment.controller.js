const { Application, AssessmentAttempt, TechnicalQuestionBank, ApplicationStatusLog, Job, AssessmentAnalysis } = require('../models');
const { sequelize, Sequelize } = require('../config/db');
const aiService = require("../services/ai.service");
const scoringService = require('../services/scoring.service');
const logger = require("../utils/logger");

const ASSESSMENT_CONFIG = {
  DURATION_MINUTES: 60,
  TOTAL_QUESTIONS: 20,
  TECH_QUESTIONS: 15,
  BEHAVIORAL_QUESTIONS: 5,
  PASSING_SCORE: 60
};

// ================= GET CONFIG =================
exports.getAssessmentConfig = async (req, res) => {
  res.json(ASSESSMENT_CONFIG);
};

// ================= START ASSESSMENT =================
exports.startAssessment = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const candidateId = req.candidate.id;

    const application = await Application.findOne({
      where: { id: applicationId, candidate_id: candidateId },
      include: [{ model: Job }]
    });

    if (!application) return res.status(404).json({ error: 'Application not found' });

    if (!['TECHNICAL_ROUND_PENDING', 'TECHNICAL_ROUND_IN_PROGRESS', 'APPLIED', 'ASSESSMENT_UNLOCKED'].includes(application.status)) {
      return res.status(400).json({ error: `Assessment not allowed. Current status: ${application.status}` });
    }

    let attempt = await AssessmentAttempt.findOne({ where: { application_id: applicationId } });
    if (attempt && attempt.status === 'SUBMITTED') return res.status(400).json({ error: 'Assessment already submitted' });

    if (attempt) await attempt.destroy();

    const job = application.Job;
    const { Op } = require('sequelize');
    
    // 1. Fetch Technical Questions
    let techQuestions = await TechnicalQuestionBank.findAll({
      where: { 
        [Op.or]: [{ jobId: job.id }, { jobRole: job.title }],
        questionType: { [Op.ne]: 'BEHAVIORAL' }
      },
      order: sequelize.literal('RANDOM()'),
      limit: ASSESSMENT_CONFIG.TECH_QUESTIONS
    });

    // Fallback if no specific questions found
    if (techQuestions.length < ASSESSMENT_CONFIG.TECH_QUESTIONS) {
      const moreTech = await TechnicalQuestionBank.findAll({
        where: { 
          questionType: { [Op.ne]: 'BEHAVIORAL' },
          questionId: { [Op.notIn]: techQuestions.map(q => q.questionId) }
        },
        order: sequelize.literal('RANDOM()'),
        limit: ASSESSMENT_CONFIG.TECH_QUESTIONS - techQuestions.length
      });
      techQuestions = [...techQuestions, ...moreTech];
    }

    // 2. Fetch Behavioral Questions
    const behavioralQuestions = await TechnicalQuestionBank.findAll({
      where: { questionType: 'BEHAVIORAL' },
      order: sequelize.literal('RANDOM()'),
      limit: ASSESSMENT_CONFIG.BEHAVIORAL_QUESTIONS
    });

    const questions = [...techQuestions, ...behavioralQuestions];
    if (questions.length === 0) return res.status(400).json({ error: 'No questions available. Contact administrator.' });

    const questionIds = questions.map(q => q.questionId);

    attempt = await AssessmentAttempt.create({
      application_id: applicationId,
      assessment_type: 'TECHNICAL',
      status: 'IN_PROGRESS',
      started_at: new Date(),
      answers: {},
      metadata: { question_ids: questionIds }
    });

    await application.update({ status: 'TECHNICAL_ROUND_IN_PROGRESS' });
    await ApplicationStatusLog.create({
      application_id: applicationId,
      previous_status: application.status,
      new_status: 'TECHNICAL_ROUND_IN_PROGRESS',
      changed_by: candidateId
    });

    res.json(formatAssessmentResponse(attempt, questions));
  } catch (error) {
    logger.error('Start assessment error:', error);
    res.status(500).json({ error: 'Failed to start assessment', details: error.message });
  }
};

// ================= SAVE ANSWER =================
exports.saveAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { question_id, selected_option } = req.body;
    const candidateId = req.candidate.id;

    const attempt = await AssessmentAttempt.findByPk(attemptId, {
      include: { model: Application, where: { candidate_id: candidateId } }
    });

    if (!attempt || attempt.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Invalid attempt' });

    // Time validation
    const expiryTime = new Date(attempt.started_at).getTime() + ASSESSMENT_CONFIG.DURATION_MINUTES * 60 * 1000;
    if (Date.now() > expiryTime) {
      await attempt.update({ status: 'SUBMITTED' });
      return res.status(400).json({ error: 'Time expired' });
    }

    const answers = attempt.answers || {};
    answers[question_id] = selected_option;
    await attempt.update({ answers });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save answer' });
  }
};

// ================= SUBMIT ASSESSMENT =================
exports.submitAssessment = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const candidateId = req.candidate.id;

    const attempt = await AssessmentAttempt.findByPk(attemptId, { include: [{ model: Application }] });
    if (!attempt || attempt.status !== 'IN_PROGRESS') return res.status(400).json({ error: 'Invalid attempt' });

    const questions = await TechnicalQuestionBank.findAll({
      where: { questionId: attempt.metadata?.question_ids || [] }
    });

    let totalCosineScore = 0;
    const questionAnswerPairs = [];

    questions.forEach(q => {
      const candidateAnswer = attempt.answers?.[q.questionId] || '';
      const expectedAnswer = q.correct_answer || q.model_answer || '';
      let qCosine = (q.questionType === 'MCQ') ? (candidateAnswer === expectedAnswer ? 1 : 0) : scoringService.calculateCosineSimilarity(candidateAnswer, expectedAnswer);
      
      totalCosineScore += qCosine;
      questionAnswerPairs.push({
        question_id: q.questionId,
        question_text: q.question,
        candidate_answer: candidateAnswer,
        expected_answer: expectedAnswer,
        cosine_similarity: qCosine
      });
    });

    const mlOverallScore = Math.round((totalCosineScore / questions.length) * 100);
    let aiAnalysis = null;
    let finalScore = mlOverallScore;

    try {
      aiAnalysis = await aiService.analyzeAssessmentResponse({ questions: questionAnswerPairs, assessment_type: 'technical' });
      finalScore = Math.round((aiAnalysis.overall_score * 0.6) + (mlOverallScore * 0.4));
    } catch (aiError) {
      logger.warn(`Assessment AI analysis failed: ${aiError.message}`);
    }

    const passStatus = finalScore >= ASSESSMENT_CONFIG.PASSING_SCORE;
    await attempt.update({ status: 'SUBMITTED', score: finalScore, percentage: finalScore, submitted_at: new Date() });

    const application = attempt.Application;
    const newStatus = passStatus ? 'TECHNICAL_ROUND_COMPLETED' : 'REJECTED';
    await application.update({ 
      status: newStatus, 
      technical_score: finalScore,
      updated_at: new Date()
    });

    // Fix for bloated AssessmentAnalysis model requirements
    await AssessmentAnalysis.create({
      application_id: application.id,
      assessment_type: 'technical', // ENUM in model is lowercase "coding", "mcq", etc. Let's use technical (added to enum via migration)
      test_name: 'Technical Core Assessment', // Required by model
      overall_score: finalScore,
      strengths: aiAnalysis?.strengths || ["Technical keyword proficiency"],
      weaknesses: aiAnalysis?.weaknesses || [],
      detailed_feedback: aiAnalysis?.recommendation || (passStatus ? 'Recommended for next round' : 'Needs improvement'),
      analyzed_at: new Date()
    });

    res.json({ success: true, score: finalScore, passed: passStatus, method: aiAnalysis ? 'AI_HYBRID' : 'ML_FALLBACK' });
  } catch (error) {
    logger.error('Submit assessment error:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
};

// ================= GET STATUS =================
exports.getAssessmentStatus = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const candidateId = req.candidate.id;

    const attempt = await AssessmentAttempt.findByPk(attemptId, {
      include: { model: Application, where: { candidate_id: candidateId } }
    });
    if (!attempt) return res.status(404).json({ error: 'Not found' });

    const expiryTime = new Date(attempt.started_at).getTime() + ASSESSMENT_CONFIG.DURATION_MINUTES * 60 * 1000;
    if (Date.now() > expiryTime && attempt.status === 'IN_PROGRESS') {
      await attempt.update({ status: 'SUBMITTED', submitted_at: new Date() });
    }

    res.json({ status: attempt.status, score: attempt.score, time_remaining_ms: Math.max(0, expiryTime - Date.now()) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
};

// ================= RESPONSE FORMATTER =================
function formatAssessmentResponse(attempt, questions) {
  return {
    attempt_id: attempt.id,
    duration_minutes: ASSESSMENT_CONFIG.DURATION_MINUTES,
    expires_at: new Date(new Date(attempt.started_at).getTime() + ASSESSMENT_CONFIG.DURATION_MINUTES * 60 * 1000),
    questions: questions.map(q => ({
      id: q.questionId,
      question: q.question,
      options: q.options || [],
      codeSnippet: q.codeSnippet,
      category: q.topic || q.category,
      difficulty: q.difficulty,
      questionType: q.questionType
    })),
    started_at: attempt.started_at
  };
}
