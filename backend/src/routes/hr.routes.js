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
const ReportController = require("../controllers/report.controller");
const path = require("path");
const fs = require("fs");


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

router.get(
  "/dashboard/operational-core",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getOperationalCore
);

router.get(
  "/dashboard/top-candidates",
  auth,
  role(["HR", "ADMIN"]),
  HRDashboardController.getTopCandidates
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

router.get(
  "/report/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  ReportController.generateCandidateReport
);

router.get(
  "/report/interview/:applicationId",
  auth,
  role(["HR", "ADMIN"]),
  ReportController.generateInterviewReport
);

router.get(
  "/reports/executive/:applicationId",
  auth,
  role(["HR", "ADMIN", "MD"]),
  ReportController.generateExecutiveReport
);

router.post(
  "/applications/:applicationId/decide",
  auth,
  role(["HR", "ADMIN"]),
  HRDecisionController.triggerAIDecision
);

router.get(
  "/applications/:applicationId/benchmark",
  auth,
  role(["HR", "ADMIN", "MD"]),
  HRDecisionController.getBenchmarkData
);

// ✅ Removed: PUT /approval-rules/:ruleId
// HRDecisionController.updateApprovalRule was removed because HRApprovalRule
// model doesn't exist yet. Re-add this route when you create that model.

// ===============================
// RESUME VIEWER (HR/MD)
// ===============================

router.get(
  "/resume/:applicationId",
  auth,
  role(["HR", "ADMIN", "MD"]),
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { Application, Candidate } = require("../models");

      const application = await Application.findByPk(applicationId, {
        include: [{ model: Candidate, attributes: ["resume_path"] }]
      });

      if (!application || !application.Candidate?.resume_path) {
        return res.status(404).json({ success: false, message: "Resume not found for this candidate." });
      }

      const resumeRelPath = application.Candidate.resume_path; // e.g. /uploads/resumes/xyz.pdf
      const absolutePath = path.join(__dirname, "../../", resumeRelPath);

      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ success: false, message: "Resume file missing on server." });
      }

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="resume_${applicationId}.pdf"`);
      fs.createReadStream(absolutePath).pipe(res);
    } catch (error) {
      console.error("[Resume View] Error:", error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;