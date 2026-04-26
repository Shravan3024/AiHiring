const express = require('express');
const { upload } = require('../middleware/upload.middleware');
const aiController = require('../controllers/ai.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

const router = express.Router();

// Health and metadata endpoints
router.get('/health', aiController.healthCheck);
router.get('/capabilities', aiController.getCapabilities);

// Resume endpoints
router.post(
  '/resume/parse',
  isAuthenticated,
  upload.single('file'),
  aiController.parseResumeWithAI
);
router.post('/resume/score', isAuthenticated, aiController.scoreResume);
router.post('/resume/summary', isAuthenticated, aiController.getResumeSummary);

// Assessment endpoints
router.post('/assessment/coding', isAuthenticated, aiController.analyzeCodingAssessment);
router.post('/assessment/mcq', isAuthenticated, aiController.analyzeMCQAssessment);
router.post('/assessment/design', isAuthenticated, aiController.analyzeSystemDesign);
router.post('/assessment/case-study', isAuthenticated, aiController.analyzeCaseStudy);
router.post('/assessment/report', isAuthenticated, aiController.generateAssessmentReport);

// Interview endpoints
router.post('/interview/analyze', isAuthenticated, aiController.analyzeInterview);
router.post('/interview/answer', isAuthenticated, aiController.analyzeInterviewAnswer);
router.post('/interview/performance-prediction', isAuthenticated, aiController.predictPerformance);
router.post('/interview/speaking-patterns', isAuthenticated, aiController.analyzeSpeakingPatterns);

// Candidate comparison and feedback
router.post('/candidates/compare', isAuthenticated, aiController.compareCandidates);
router.post('/feedback/generate', isAuthenticated, aiController.generateFeedback);
router.post('/chat', isAuthenticated, aiController.chatWithAI);

module.exports = router;
