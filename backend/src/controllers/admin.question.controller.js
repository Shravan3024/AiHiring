const { TechnicalQuestionBank } = require('../models');

exports.createTechnicalQuestion = async (req, res) => {
  try {
    const {
      jobRole,
      topic,
      difficulty,
      questionType,
      question,
      options,
      correct_answer,
      codeSnippet,
      expectedOutput,
      testCases,
      explanation,
      hints,
      keywords,
      estimatedTime,
      createdBy
    } = req.body;

    const allowedRoles = [
      'MANAGEMENT_TRAINEE_MARKETING',
      'ASSISTANT_MANAGER_MARKETING',
      'EXECUTIVE_MARKETING',
      'RUBBER_PROCESS_ENGINEER'
    ];

    if (!allowedRoles.includes(jobRole)) {
      return res.status(400).json({ error: 'Invalid jobRole, allowed roles only for this system.' });
    }

    if (!question || !questionType || !topic) {
      return res.status(400).json({ error: 'Question, questionType, and topic are required.' });
    }

    const newQuestion = await TechnicalQuestionBank.create({
      jobRole,
      topic,
      difficulty: difficulty || 'MEDIUM',
      questionType,
      question,
      options: options || [],
      correct_answer: correct_answer || null,
      codeSnippet: codeSnippet || null,
      expectedOutput: expectedOutput || null,
      testCases: testCases || [],
      explanation: explanation || null,
      hints: hints || [],
      keywords: keywords || [],
      estimatedTime: estimatedTime || 5,
      createdBy: createdBy || (req.user && req.user.email) || 'admin'
    });

    res.status(201).json({ message: 'Question created', question: newQuestion });
  } catch (error) {
    console.error('createTechnicalQuestion error', error);
    res.status(500).json({ error: 'Failed to create question', details: error.message });
  }
};

exports.getTechnicalQuestions = async (req, res) => {
  try {
    const questions = await TechnicalQuestionBank.findAll();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch questions', details: error.message });
  }
};

exports.deleteTechnicalQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const deleted = await TechnicalQuestionBank.destroy({ where: { questionId } });
    if (!deleted) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete question', details: error.message });
  }
};