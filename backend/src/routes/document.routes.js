const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/document.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/documents/offer/:applicationId
 * Generate offer letter
 * Authorization: HR, ADMIN
 */
router.post(
  '/offer/:applicationId',
  authorize(['HR', 'ADMIN']),
  DocumentController.generateOfferLetter
);

/**
 * POST /api/documents/assessment/:applicationId
 * Generate assessment report
 * Authorization: HR, ADMIN
 */
router.post(
  '/assessment/:applicationId',
  authorize(['HR', 'ADMIN']),
  DocumentController.generateAssessmentReport
);

/**
 * POST /api/documents/interview/:interviewId
 * Generate interview summary
 * Authorization: HR, ADMIN
 */
router.post(
  '/interview/:interviewId',
  authorize(['HR', 'ADMIN']),
  DocumentController.generateInterviewSummary
);

/**
 * POST /api/documents/send/:documentId
 * Send document to candidate
 * Authorization: HR, ADMIN
 */
router.post(
  '/send/:documentId',
  authorize(['HR', 'ADMIN']),
  DocumentController.sendDocument
);

/**
 * GET /api/documents/download/:documentId
 * Download document
 * Authorization: CANDIDATE, HR, ADMIN
 */
router.get(
  '/download/:documentId',
  DocumentController.downloadDocument
);

/**
 * GET /api/documents/:documentId
 * Get document details
 * Authorization: CANDIDATE, HR, ADMIN
 */
router.get(
  '/:documentId',
  DocumentController.getDocumentDetails
);

/**
 * GET /api/documents/application/:applicationId
 * Get all documents for application
 * Authorization: CANDIDATE, HR, ADMIN
 */
router.get(
  '/application/:applicationId',
  DocumentController.getApplicationDocuments
);

/**
 * POST /api/documents/sign/:documentId
 * Sign document (e-signature)
 * Authorization: CANDIDATE
 */
router.post(
  '/sign/:documentId',
  DocumentController.signDocument
);

/**
 * POST /api/documents/archive/:documentId
 * Archive document
 * Authorization: HR, ADMIN
 */
router.post(
  '/archive/:documentId',
  authorize(['HR', 'ADMIN']),
  DocumentController.archiveDocument
);

module.exports = router;
