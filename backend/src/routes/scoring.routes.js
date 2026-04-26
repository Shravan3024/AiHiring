const express = require('express');
const router = express.Router();
const scoringService = require('../services/scoring.service');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

/**
 * standalone Scoring APIs
 */

// POST /api/score/resume
router.post('/resume', auth, (req, res) => {
  const { resume_text, jd_text } = req.body;
  const score = scoringService.calculateCosineSimilarity(resume_text, jd_text);
  res.json({ success: true, score: Math.round(score * 100), method: 'ML_COSINE' });
});

// POST /api/score/assessment
router.post('/assessment', auth, (req, res) => {
  const { candidate_answer, expected_answer } = req.body;
  const score = scoringService.calculateCosineSimilarity(candidate_answer, expected_answer);
  res.json({ success: true, score: Math.round(score * 100), method: 'ML_COSINE' });
});

// POST /api/score/final
router.post('/final', auth, async (req, res) => {
  const features = req.body; // { aiScore, resumeScore, assessmentScore, interviewScore, malpracticeScore }
  const result = await scoringService.predictFinalScore(features);
  res.json({ success: true, data: result });
});

module.exports = router;
