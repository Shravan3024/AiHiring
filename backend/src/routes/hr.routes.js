const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  getAllApplications,
  updateDecision,
  getDashboardSummary,
  sendOfferLetter,
  sendRejectionEmail,
  scheduleInterview,
  addInternalNote
} = require("../controllers/hr.controller");

const HRDashboardController = require("../controllers/hrDashboard.controller");
const CandidateProfileController = require("../controllers/candidateProfile.controller");
const HRDecisionController = require("../controllers/hrDecision.controller");
const { getNotifications } = require("../controllers/notification.controller");


// ===============================
// LEGACY ROUTES (STABLE)
// ===============================

router.get(
  "/applications",
  auth,
  role(["HR", "ADMIN"]),
  getAllApplications
);

router.post(
  "/decision",
  auth,
  role(["HR", "ADMIN"]),
  updateDecision
);

router.get(
  "/dashboard",
  auth,
  role(["HR", "ADMIN"]),
  getDashboardSummary
);

router.get(
  "/notifications",
  auth,
  role(["HR"]),
  getNotifications
);


// ===============================
// HR DASHBOARD ROUTES
// ===============================

router.get(
  "/dashboard/kpi",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getKPICards
);

router.get(
  "/dashboard/funnel",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getHiringFunnel
);

router.get(
  "/dashboard/distribution",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getStatusDistribution
);

router.get(
  "/dashboard/skills-heatmap",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getSkillGap            // ✅ was: getSkillGapHeatmap (didn't exist)
);

router.get(
  "/dashboard/pending-actions",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getPendingActions
);

router.get(
  "/dashboard/ai-vs-hr",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getAIvsHRComparison
);

router.get(
  "/dashboard/overview",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getDashboardOverview
);

router.get(
  "/dashboard/time-to-hire",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getTimeToHirePerRole
);

router.get(
  "/dashboard/rejection-reasons",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getRejectionReasons
);


// ===============================
// CANDIDATE 360 PROFILE
// ===============================

router.get(
  "/applications/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  CandidateProfileController.getCandidateProfile
);

router.get(
  "/pipeline",
  auth,
  role(["HR", "ADMIN"]),
  CandidateProfileController.getPipelineCandidates
);


// ===============================
// HR DECISION ROUTES
// ===============================

router.post(
  "/decision/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  HRDecisionController.makeDecision
);

router.get(
  "/approvals/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  HRDecisionController.getPendingApprovals
);

router.post(
  "/escalate/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  HRDecisionController.escalateDecision
);

router.post(
  "/request-reinterview/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  HRDecisionController.requestReInterview
);

router.post(
  "/re-evaluate-assessment/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  HRDecisionController.reEvaluateAssessment
);

router.get(
  "/approval-rules",
  auth,
  role(["HR", "ADMIN"]),
  HRDecisionController.getApprovalRules
);

router.put(
  "/applications/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { status } = req.body;

      const application = await Application.findByPk(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      application.status = status;
      await application.save();

      return res.json({
        success: true,
        message: "Stage updated successfully"
      });

    } catch (error) {
      console.error("Update stage error:", error);
      return res.status(500).json({ message: error.message });
    }
  }
);

// ===============================
// HR ACTION HANDLERS (NEW)
// ===============================

router.post(
  "/send-offer/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  sendOfferLetter
);

router.post(
  "/send-rejection/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  sendRejectionEmail
);

router.post(
  "/schedule-interview/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  scheduleInterview
);

router.post(
  "/add-note/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  addInternalNote
);

// ✅ Removed: PUT /approval-rules/:ruleId
// HRDecisionController.updateApprovalRule was removed because HRApprovalRule
// model doesn't exist yet. Re-add this route when you create that model.

module.exports = router;