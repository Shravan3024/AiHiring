/**
 * Interview Routes - Phase 5
 * AI-powered video interviews with sentiment analysis
 */

const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewPhase5.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// ==================== CANDIDATE ROUTES ====================

/**
 * Get Interview Config
 * GET /interview/config
 * Private: Candidate only
 */
router.get('/config', authMiddleware, interviewController.getInterviewConfig);

/**
 * Start Interview
 * GET /interview/application/:applicationId/start
 * Private: Candidate only
 */
router.post(
  '/application/:applicationId/start',
  authMiddleware,
  roleMiddleware(['CANDIDATE']),
  interviewController.startInterviewPhase5
);

/**
 * Get Interview Status
 * GET /interview/:sessionId/status
 * Private: Candidate only
 */
router.get(
  '/:sessionId/status',
  authMiddleware,
  roleMiddleware(['CANDIDATE']),
  interviewController.getInterviewStatusPhase5
);

/**
 * Submit Interview Response
 * POST /interview/:sessionId/response
 * Private: Candidate only
 * Body: { question_id, video_blob, transcription, response_duration_seconds, question_number }
 */
router.post(
  '/:sessionId/response',
  authMiddleware,
  roleMiddleware(['CANDIDATE']),
  upload.single("video_blob"),
  interviewController.submitResponsePhase5
);

// ==================== HR/ADMIN ROUTES ====================

/**
 * Schedule Interview
 * POST /interview/schedule/application/:applicationId
 * Private: HR/Admin only
 * Body: { scheduled_date, scheduled_time, interview_type }
 */
router.post(
  '/schedule/application/:applicationId',
  authMiddleware,
  roleMiddleware(['HR', 'ADMIN']),
  interviewController.scheduleInterviewPhase5
);

/**
 * Get Interview Results
 * GET /interview/application/:applicationId/results
 * Private: HR/Admin only
 */
router.get(
  '/application/:applicationId/results',
  authMiddleware,
  roleMiddleware(['HR', 'ADMIN']),
  interviewController.getInterviewResultsPhase5
);

/**
 * Get AI Interview Analysis (6-dimension scoring)
 * GET /interview/application/:applicationId/analysis
 * Private: HR, ADMIN, MD
 */
router.get(
  '/application/:applicationId/analysis',
  authMiddleware,
  roleMiddleware(['HR', 'ADMIN', 'MD']),
  interviewController.getInterviewAnalysis
);

module.exports = router;
