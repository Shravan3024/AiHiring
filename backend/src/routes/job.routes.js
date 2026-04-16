const express = require("express");
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
  createJob,
  getActiveJobs,
  updateJobStatus
} = require("../controllers/job.controller");

const router = express.Router();

// HR/Admin only
router.post(
  "/",
  auth,
  role(["HR", "ADMIN"]),
  createJob
);
router.patch("/:id/status", auth, role(["ADMIN"]), updateJobStatus);

// Public - no auth required for browsing jobs
router.get("/", getActiveJobs);

module.exports = router;
