const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  startInterview,
  pauseInterview,
  submitAnswer,
  completeInterview
} = require("../controllers/interview.controller");

router.post("/start/:id", auth, startInterview);
router.post("/pause/:id", auth, role(["HR"]), pauseInterview);
router.post("/answer", auth, submitAnswer);
router.post("/complete/:id", auth, completeInterview);

module.exports = router;