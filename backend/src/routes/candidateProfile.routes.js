const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const CandidateProfileController = require("../controllers/candidateProfile.controller");

// 🔥 HR 360 Candidate Profile
router.get(
  "/profile/:applicationId",
  auth,
  CandidateProfileController.getCandidateProfile
);

// 🔥 HR Pipeline (Kanban)
router.get(
  "/pipeline",
  auth,
  CandidateProfileController.getPipelineCandidates
);

module.exports = router;