console.log("✅ assessment.routes.js loaded");
const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// ==================== CANDIDATE ROUTES ====================
router.get('/config', authMiddleware, assessmentController.getAssessmentConfig);

/**
 * START ASSESSMENT
 * GET /api/assessment/application/:applicationId/start
 */
router.get(
  '/application/:applicationId/start',
  authMiddleware,
  roleMiddleware(['CANDIDATE']),
  assessmentController.startAssessment
);

/**
 * SAVE ANSWER (AUTO SAVE)
 * POST /api/assessment/:attemptId/answer
 */
router.post(
  '/:attemptId/answer',
  authMiddleware,
  roleMiddleware(['CANDIDATE']),
  assessmentController.saveAnswer
);

/**
 * SUBMIT ASSESSMENT
 * POST /api/assessment/:attemptId/submit
 */
router.post(
  '/:attemptId/submit',
  authMiddleware,
  roleMiddleware(['CANDIDATE']),
  assessmentController.submitAssessment
);

/**
 * GET ASSESSMENT STATUS
 * GET /api/assessment/:attemptId/status
 */
router.get(
  '/:attemptId/status',
  authMiddleware,
  roleMiddleware(['CANDIDATE']),
  assessmentController.getAssessmentStatus
);

// TODO: logMalpractice method not yet implemented in assessment controller
// /**
//  * LOG MALPRACTICE
//  * POST /api/assessment/:attemptId/malpractice
//  */
// router.post(
//   '/:attemptId/malpractice',
//   authMiddleware,
//   roleMiddleware(['CANDIDATE']),
//   assessmentController.logMalpractice
// );

// ==================== HR/ADMIN ROUTES ====================

// TODO: reEvaluateAssessment method not yet implemented in assessment controller
// /**
//  * RE-EVALUATE ASSESSMENT (HR)
//  * POST /api/assessment/:attemptId/re-evaluate
//  */
// router.post(
//   '/:attemptId/re-evaluate',
//   authMiddleware,
//   roleMiddleware(['HR', 'ADMIN']),
//   assessmentController.reEvaluateAssessment
// );

module.exports = router;