/**
 * Phase 7: Proctoring Routes
 * Real-time exam monitoring endpoints
 */

const express = require('express');
const router = express.Router();
const ProctoringController = require('../controllers/proctoring.controller');
const authenticateToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

// ==================== PROCTORING ENDPOINTS ====================

/**
 * Start proctored assessment
 * POST /api/proctoring/start/:applicationId
 * Role: CANDIDATE
 */
router.post(
  '/start/:applicationId',
  authenticateToken,
  authorize(['CANDIDATE']),
  ProctoringController.startProctoredAssessment
);

/**
 * Log a general malpractice event
 * POST /api/proctoring/log-malpractice
 * Role: CANDIDATE
 */
router.post(
  '/log-malpractice',
  authenticateToken,
  authorize(['CANDIDATE']),
  ProctoringController.logMalpractice
);

/**
 * Track real-time events
 * POST /api/proctoring/events/:sessionId
 * Role: CANDIDATE
 */
router.post(
  '/events/:sessionId',
  authenticateToken,
  authorize(['CANDIDATE']),
  ProctoringController.trackEvent
);

/**
 * Monitor audio/video
 * POST /api/proctoring/monitor/:sessionId
 * Role: CANDIDATE
 */
router.post(
  '/monitor/:sessionId',
  authenticateToken,
  authorize(['CANDIDATE']),
  ProctoringController.monitorMedia
);

/**
 * Analyze behavioral patterns
 * POST /api/proctoring/behavior/:sessionId
 * Role: CANDIDATE
 */
router.post(
  '/behavior/:sessionId',
  authenticateToken,
  authorize(['CANDIDATE']),
  ProctoringController.analyzeBehavior
);

/**
 * End proctored assessment
 * POST /api/proctoring/end/:sessionId
 * Role: CANDIDATE
 */
router.post(
  '/end/:sessionId',
  authenticateToken,
  authorize(['CANDIDATE']),
  ProctoringController.endProctoredAssessment
);

/**
 * Get proctoring report
 * GET /api/proctoring/report/:sessionId
 * Role: HR, ADMIN
 */
router.get(
  '/report/:sessionId',
  authenticateToken,
  authorize(['HR', 'ADMIN']),
  ProctoringController.getProctoringReport
);

module.exports = router;
