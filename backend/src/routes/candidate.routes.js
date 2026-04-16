const express = require("express");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { createCandidateProfile } = require("../controllers/candidate.controller");

const router = express.Router();

router.post(
  "/",
  auth,
  role(["CANDIDATE"]),
  createCandidateProfile
);

module.exports = router;
