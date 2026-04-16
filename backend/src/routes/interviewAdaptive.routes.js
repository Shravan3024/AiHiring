const express = require('express');
const router = express.Router();
const adaptiveController = require('../controllers/interviewAdaptive.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// Candidate: Initialize and Start
router.get(
  '/application/:applicationId/start-adaptive',
  auth,
  role(['CANDIDATE']),
  adaptiveController.startAdaptiveInterview
);

// Candidate: Submit specific answer and get next adaptive question
router.post(
  '/application/:applicationId/answer-and-next',
  auth,
  role(['CANDIDATE']),
  adaptiveController.submitResponseAndGetNext
);

module.exports = router;
