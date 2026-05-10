const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  getMDApplications,
  mdDecision,
  getTopCandidates,
  getAnalytics,
  getMDDecisions
} = require("../controllers/md.controller");

// 📊 All applications with full data (post-interview only)
router.get("/applications", auth, role(["MD", "ADMIN"]), getMDApplications);

// ✅ Final decision
router.post("/decision", auth, role(["MD", "ADMIN"]), mdDecision);

// 📋 MD decisions feed (for HR dashboard)
router.get("/decisions", auth, role(["MD", "ADMIN", "HR"]), getMDDecisions);

// 🏆 Top candidates
router.get("/top-candidates", auth, role(["MD", "ADMIN"]), getTopCandidates);

// 📈 Analytics (charts)
router.get("/analytics", auth, role(["MD", "ADMIN"]), getAnalytics);

module.exports = router;