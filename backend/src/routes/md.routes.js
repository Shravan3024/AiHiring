const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  getMDApplications,
  mdDecision,
  getTopCandidates,
  getAnalytics
} = require("../controllers/md.controller");

// 📊 All applications with full data
router.get("/applications", auth, role(["MD", "ADMIN"]), getMDApplications);

// ✅ Final decision
router.post("/decision", auth, role(["MD", "ADMIN"]), mdDecision);

// 🏆 Top candidates
router.get("/top-candidates", auth, role(["MD", "ADMIN"]), getTopCandidates);

// 📈 Analytics (charts)
router.get("/analytics", auth, role(["MD", "ADMIN"]), getAnalytics);

module.exports = router;