const { MCQQuestion, TechnicalQuestionBank } = require('../models');

// ================= MCQ QUESTIONS =================

exports.createMCQQuestion = async (req, res) => {
  try {
    const {
      job_id,
      category,
      question,
      options,
      correct_answer,
      difficulty,
      weight,
      is_active
    } = req.body;

    if (!question || !options) {
      return res.status(400).json({ error: 'Question and options are required.' });
    }

    const newQuestion = await MCQQuestion.create({
      job_id: job_id || null,
      category: category || 'TECHNICAL',
      question,
      options: options || [],
      correct_answer: correct_answer || null,
      difficulty: difficulty || 'MEDIUM',
      weight: weight || 1,
      is_active: is_active !== undefined ? is_active : true
    });

    res.status(201).json({ message: 'MCQ Question created', question: newQuestion });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create MCQ question', details: error.message });
  }
};

exports.getMCQQuestions = async (req, res) => {
  try {
    const { job_id } = req.query;
    const where = {};
    if (job_id) where.job_id = job_id;

    const questions = await MCQQuestion.findAll({ where });
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch MCQ questions' });
  }
};

exports.deleteMCQQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await MCQQuestion.destroy({ where: { id } });
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

// ================= TECHNICAL QUESTIONS (LEGACY/THEORY) =================

exports.createTechnicalQuestion = async (req, res) => {
  try {
    const {
      jobRole, topic, difficulty, questionType,
      question, options, correct_answer, createdBy, weight
    } = req.body;

    const newQuestion = await TechnicalQuestionBank.create({
      jobRole,
      topic,
      difficulty: difficulty || 'MEDIUM',
      questionType,
      question,
      options: options || [],
      correct_answer: correct_answer || null,
      weight: weight || 1,
      createdBy: createdBy || 'admin'
    });

    res.status(201).json({ message: 'Question created', question: newQuestion });
  } catch (error) {
    res.status(500).json({ error: 'Failed', details: error.message });
  }
};

exports.getTechnicalQuestions = async (req, res) => {
  try {
    const questions = await TechnicalQuestionBank.findAll();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};

exports.deleteTechnicalQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    await TechnicalQuestionBank.destroy({ where: { questionId } });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed' });
  }
};