const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const { logEvent } = require("../controllers/malpractice.controller");

const role = require("../middleware/role.middleware");
const { getMalpracticeSummary } = require("../controllers/malpractice.controller");

router.post("/log", auth, logEvent);
router.get(
  "/summary/:application_id",
  auth,
  role(["HR", "ADMIN"]),
  getMalpracticeSummary
);

module.exports = router;
