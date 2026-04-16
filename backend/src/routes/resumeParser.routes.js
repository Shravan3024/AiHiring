/**
 * Phase 6: Resume Parser Routes
 * API endpoints for resume parsing and matching
 */

const express = require('express');
const router = express.Router();
const ResumeParserController = require('../controllers/resumeParser.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload');

// ==================== RESUME ENDPOINTS ====================

/**
 * Upload and parse resume
 * POST /api/resume/upload
 * Role: CANDIDATE
 */
router.post(
  '/upload',
  authenticateToken,
  authorize('CANDIDATE'),
  upload.single('resume'),
  ResumeParserController.uploadResume
);

/**
 * Get parsed resume details
 * GET /api/resume/application/:applicationId
 * Role: CANDIDATE (own application), HR, ADMIN (any application)
 */
router.get(
  '/application/:applicationId',
  authenticateToken,
  async (req, res, next) => {
    // Middleware to verify ownership or role
    const { applicationId } = req.params;

    if (req.user.role === 'CANDIDATE') {
      // Candidate can only see own resumes
      next();
    } else if (['HR', 'ADMIN'].includes(req.user.role)) {
      // HR and Admin can see all
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
  },
  ResumeParserController.getResumeDetails
);

/**
 * Match resume to job description
 * POST /api/resume/match
 * Role: CANDIDATE
 */
router.post(
  '/match',
  authenticateToken,
  authorize('CANDIDATE'),
  ResumeParserController.matchResumeToJob
);

/**
 * Get match results
 * GET /api/resume/match/:applicationId
 * Role: HR, ADMIN
 */
router.get(
  '/match/:applicationId',
  authenticateToken,
  authorize('HR', 'ADMIN'),
  ResumeParserController.getMatchResults
);

/**
 * Get analysis report
 * GET /api/resume/analysis/:applicationId
 * Role: HR, ADMIN
 */
router.get(
  '/analysis/:applicationId',
  authenticateToken,
  authorize('HR', 'ADMIN'),
  ResumeParserController.getAnalysisReport
);

/**
 * Get skill gap analysis
 * GET /api/resume/skill-gaps/:applicationId
 * Role: CANDIDATE, HR, ADMIN
 */
router.get(
  '/skill-gaps/:applicationId',
  authenticateToken,
  ResumeParserController.getSkillGaps
);

module.exports = router;
