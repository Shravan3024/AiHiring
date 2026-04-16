const express = require("express");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  applyJob,
  getMyApplications
} = require("../controllers/application.controller");

const router = express.Router();

// ✅ Apply for a job — POST /api/applications  (frontend) or /api/applications/apply (legacy)
router.post(
  "/",
  auth,
  role(["CANDIDATE"]),
  applyJob
);
router.post(
  "/apply",
  auth,
  role(["CANDIDATE"]),
  applyJob
);

// ✅ Get all applications of logged-in candidate
router.get(
  "/my",
  auth,
  role(["CANDIDATE"]),
  getMyApplications
);

module.exports = router;