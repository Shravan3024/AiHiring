const {
  Application, Candidate, User,
  Notification, ApplicationStatusLog, NotificationQueue, AssessmentAttempt,
  InterviewSession, InterviewAnalysis, MalpracticeEvent, Job
} = require('../models');
const { Op } = require('sequelize');
const auditLogger = require('../services/auditLogger.service');
const { computeApplicationScore } = require('../utils/applicationStatus.utils');
const aiService = require('../services/ai.service');

// ── EXACT enum values (verified via pg_enum) ──────────────────────
const FINAL_STATES = ['SELECTED', 'REJECTED'];

class HRDecisionController {

  /**
   * POST /hr/decision/:applicationId
   */
  static async makeDecision(req, res) {
    const { applicationId } = req.params;
    const { decision, reason, comments } = req.body;
    const userId = req.user.id;

    try {
      if (!applicationId || applicationId === 'undefined') {
        return res.status(400).json({ success: false, message: 'applicationId is required' });
      }
      const VALID = ['APPROVED', 'REJECTED', 'ON_HOLD', 'REQUEST_RE_INTERVIEW', 'SEND_TO_ASSESSMENT', 'APPROVE_FOR_INTERVIEW', 'REQUEST_RE_ASSESSMENT'];
      if (!VALID.includes(decision)) {
        return res.status(400).json({ success: false, message: `Invalid decision. Must be one of: ${VALID.join(', ')}` });
      }
      const requiredReason = decision !== 'SEND_TO_ASSESSMENT';
      if (requiredReason && !reason?.trim()) {
        return res.status(400).json({ success: false, message: 'Reason is required' });
      }

      const application = await Application.findByPk(applicationId, {
        include: [{ model: Candidate, include: [{ model: User }] }]
      });
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      // Allow unlocking decisions even if currently in a final state
      const isReAction = ['REQUEST_RE_INTERVIEW', 'REQUEST_RE_ASSESSMENT', 'SEND_TO_ASSESSMENT', 'APPROVE_FOR_INTERVIEW'].includes(decision);
      if (FINAL_STATES.includes(application.status) && application.hr_decision && !isReAction) {
        return res.status(409).json({ success: false, message: 'Decision already finalised and locked' });
      }

      const prevStatus = application.status;

      const STATUS_MAP = {
        SEND_TO_ASSESSMENT:   'ASSESSMENT_UNLOCKED',
        APPROVE_FOR_INTERVIEW: 'INTERVIEW_UNLOCKED',
        REQUEST_RE_INTERVIEW: 'INTERVIEW_UNLOCKED',
        APPROVED:             'SELECTED',
        REJECTED:             'REJECTED',
        ON_HOLD:              'HR_REVIEW',
        REQUEST_RE_ASSESSMENT: 'ASSESSMENT_UNLOCKED',
      };

      const newStatus = STATUS_MAP[decision];
      if (!newStatus) {
        return res.status(400).json({ success: false, message: 'Unsupported decision type' });
      }

      application.status      = newStatus;
      application.hr_decision = decision;
      application.hr_notes    = `${reason}${comments ? ` | ${comments}` : ''}`;

      if (decision === 'REQUEST_RE_INTERVIEW') {
        application.interview_score = null;
        // Delete previous analysis to reset pros/cons
        try {
          await InterviewAnalysis.destroy({ where: { application_id: applicationId } });
          // Ensure new session can be created
          await InterviewSession.update({ status: 'CANCELLED' }, { where: { application_id: applicationId, status: { [Op.ne]: 'COMPLETED' } } });
           // Create a fresh session for the re-interview
           await InterviewSession.create({
             application_id: applicationId,
             status: 'SCHEDULED',
             interview_type: 'VIDEO',
             scheduled_at: new Date()
           });
        } catch (_) {}
      }

      if (decision === 'REQUEST_RE_ASSESSMENT') {
        application.technical_score = null;
        await AssessmentAttempt.update(
          { status: 'NOT_STARTED', score: null, answers: null, submitted_at: null },
          { where: { application_id: applicationId } }
        );
      }

      // Aggregate Score if moving to final
      if (decision === 'APPROVED' || decision === 'REJECTED') {
          application.overall_score = computeApplicationScore({
            resumeScore: application.resume_score,
            technicalScore: application.technical_score,
            interviewScore: application.interview_score,
            malpracticeWarnings: application.malpractice_warnings || 0
          });
      }

      await application.save();

      // Audit: HR decision
      await auditLogger.logHRDecision(req, {
        applicationId,
        decision,
        previousStatus: prevStatus,
        newStatus: application.status,
        reason,
      });

      // Log — non-fatal
      try {
        await ApplicationStatusLog.create({
          application_id: applicationId,
          previous_status: prevStatus,
          new_status: application.status,
          changed_by: userId,
          reason: `HR: ${decision} — ${reason}`,
        });
      } catch (_) {}

      // Notify — non-fatal
      const candidateId = application.Candidate?.id;
      if (candidateId) {
        const msgs = {
          APPROVED:             { type: 'OFFER_LETTER_READY', title: 'Great News!', msg: 'Congratulations! You have been selected. Your offer letter will be ready soon.' },
          REJECTED:             { type: 'REJECTION', title: 'Application Update', msg: 'Thank you for your time. While we were impressed, we have decided to move forward with other candidates.' },
          ON_HOLD:              { type: 'OTHER', title: 'Application Update', msg: 'Your application is currently on hold/under review.' },
          REQUEST_RE_INTERVIEW: { type: 'INTERVIEW_SCHEDULED', title: 'Interview Follow-up', msg: 'A re-interview has been requested. Please check your schedule.' },
          SEND_TO_ASSESSMENT:   { type: 'ASSESSMENT_AVAILABLE', title: 'Assessment Ready', msg: 'Your application has been approved for the technical assessment round.' },
          APPROVE_FOR_INTERVIEW: { type: 'INTERVIEW_AVAILABLE', title: 'Interview Ready', msg: 'Your application has been approved for the AI Interview round.' },
          REQUEST_RE_ASSESSMENT: { type: 'ASSESSMENT_AVAILABLE', title: 'Re-Assessment Requested', msg: 'HR has requested a technical re-assessment. Please check the portal.' },
        };
        const config = msgs[decision];
        try {
          await NotificationQueue.create({
            candidate_id: candidateId,
            application_id: application.id,
            notification_type: config?.type || 'OTHER',
            title: config?.title || 'Status Update',
            message: config?.msg || 'Your application status has been updated.',
            status: 'PENDING'
          });
        } catch (_) {}
      }

      return res.status(200).json({
        success: true,
        message: `Decision recorded: ${decision}`,
        data: { applicationId, previousStatus: prevStatus, newStatus: application.status, decision, ai_recommendation: decision === 'APPROVED' ? 'HIRE' : 'REVIEW' }
      });

    } catch (error) {
      // Audit failure log
      await auditLogger.log({
        actionType: "HR_DECISION",
        userId: String(req.user?.id ?? "UNKNOWN"),
        userRole: req.user?.role ?? "HR",
        entityType: "Application",
        entityId: String(applicationId),
        description: `HR decision FAILED for application #${applicationId}: ${error.message}`,
        ipAddress: auditLogger.resolveIP(req),
        userAgent: req.headers?.["user-agent"],
        status: "FAILURE",
      });
      console.error('Error making decision:', error);
      return res.status(500).json({ success: false, message: 'Error making decision' });
    }
  }

  /**
   * GET /hr/approvals/:applicationId
   */
  static async getPendingApprovals(req, res) {
    try {
      const { applicationId } = req.params;

      if (!applicationId || applicationId === 'undefined') {
        return res.status(400).json({ success: false, message: 'applicationId is required' });
      }

      const application = await Application.findByPk(applicationId, {
        include: [{ model: Candidate, include: [{ model: User }] }]
      });
      if (!application) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      return res.status(200).json({
        success: true,
        data: {
          applicationId,
          candidateName:  application.Candidate?.User?.name || 'N/A',
          currentStatus:  application.status,
          totalNeeded:    1,
          received:       application.hr_decision ? 1 : 0,
          isLocked:       FINAL_STATES.includes(application.status),
          allApprovals:   application.hr_decision ? [{
            reviewer:  'HR',
            decision:  application.hr_decision,
            reason:    application.hr_notes,
            timestamp: application.updatedAt,
            order:     1,
          }] : [],
        }
      });

    } catch (error) {
      console.error('Error fetching approvals:', error);
      return res.status(500).json({ success: false, message: 'Error fetching approvals' });
    }
  }

  /**
   * POST /hr/escalate/:applicationId
   */
  static async escalateDecision(req, res) {
    try {
      const { applicationId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      if (!applicationId || applicationId === 'undefined') {
        return res.status(400).json({ success: false, message: 'applicationId is required' });
      }

      const application = await Application.findByPk(applicationId);
      if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

      const prevStatus    = application.status;
      application.hr_notes = `ESCALATED by User#${userId}: ${reason}`;
      await application.save();

      // Audit: escalation
      await auditLogger.logApprovalFlow(req, {
        applicationId,
        stage: application.status,
        approvalDecision: "ESCALATED",
        hrUserId: userId,
      });

      try {
        await ApplicationStatusLog.create({
          application_id: applicationId, previous_status: prevStatus,
          new_status: application.status, changed_by: userId, reason: `Escalation: ${reason}`,
        });
      } catch (_) {}

      return res.status(200).json({ success: true, message: 'Escalated to senior HR', data: { applicationId } });

    } catch (error) {
      console.error('Error escalating:', error);
      return res.status(500).json({ success: false, message: 'Error escalating' });
    }
  }

  /**
   * POST /hr/request-reinterview/:applicationId
   */
  static async requestReInterview(req, res) {
    try {
      const { applicationId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      if (!applicationId || applicationId === 'undefined') {
        return res.status(400).json({ success: false, message: 'applicationId is required' });
      }

      const application = await Application.findByPk(applicationId, {
        include: [{ model: Candidate, include: [{ model: User }] }]
      });
      if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

      const prevStatus        = application.status;
      application.status      = 'INTERVIEW_UNLOCKED'; 
      application.hr_decision = 'REQUEST_RE_INTERVIEW';
      application.hr_notes    = reason;
      application.interview_score = null;
      await application.save();

      // Clear old data for a fresh start
      try {
        await InterviewAnalysis.destroy({ where: { application_id: applicationId } });
        await InterviewSession.update({ status: 'CANCELLED' }, { where: { application_id: applicationId, status: { [Op.ne]: 'COMPLETED' } } });
        await InterviewSession.create({
          application_id: applicationId,
          status: 'SCHEDULED',
          interview_type: 'VIDEO',
          scheduled_at: new Date()
        });
      } catch (e) {
        console.error("Cleanup error in re-interview request:", e);
      }

      try {
        await ApplicationStatusLog.create({
          application_id: applicationId, previous_status: prevStatus,
          new_status: application.status, changed_by: userId, reason: `Re-interview: ${reason}`,
        });
      } catch (_) {}

      const candidateId = application.Candidate?.id;
      if (candidateId) {
        try {
          await NotificationQueue.create({
            candidate_id: candidateId,
            application_id: application.id,
            notification_type: 'INTERVIEW_SCHEDULED',
            title: 'Re-Interview Requested',
            message: 'A re-interview has been requested for your application. Please check the portal for details.',
            status: 'PENDING'
          });
        } catch (_) {}
      }

      return res.status(200).json({ success: true, message: 'Re-interview requested', data: { applicationId, newStatus: application.status } });

    } catch (error) {
      console.error('Error requesting re-interview:', error);
      return res.status(500).json({ success: false, message: 'Error requesting re-interview' });
    }
  }

  /**
   * POST /hr/re-evaluate-assessment/:applicationId
   */
  static async reEvaluateAssessment(req, res) {
    try {
      const { applicationId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const application = await Application.findByPk(applicationId);
      if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

      const prevStatus = application.status;
      application.status = 'ASSESSMENT_UNLOCKED';
      application.technical_score = null;
      application.hr_decision = 'REQUEST_RE_ASSESSMENT';
      await application.save();

      await AssessmentAttempt.update(
        { status: 'NOT_STARTED', score: null, answers: null, submitted_at: null, metadata: null },
        { where: { application_id: applicationId } }
      );

      try {
        await ApplicationStatusLog.create({
          application_id: applicationId,
          previous_status: prevStatus,
          new_status: 'ASSESSMENT_UNLOCKED',
          changed_by: userId,
          reason: `Re-assessment requested: ${reason || 'N/A'}`
        });
      } catch (_) {}

      return res.status(200).json({ success: true, message: 'Assessment reset for re-evaluation' });
    } catch (error) {
       console.error('Error in reEvaluateAssessment:', error);
       return res.status(500).json({ success: false, message: 'Error resetting assessment' });
    }
  }

  /**
   * GET /hr/approval-rules
   */
  static async getApprovalRules(req, res) {
    try {
      const { HRApprovalRule } = require('../models');
      const rules = await HRApprovalRule.findAll({
        where: { isActive: true },
        order: [['stage', 'ASC']]
      });
      return res.status(200).json({ success: true, data: rules });
    } catch (error) {
      console.error('Error fetching approval rules:', error);
      return res.status(500).json({ success: false, message: 'Error fetching approval rules' });
    }
  }

  /**
   * POST /hr/applications/:applicationId/decide
   * Module 4: Integrated Decision Core
   */
  static async triggerAIDecision(req, res) {
    try {
      const { applicationId } = req.params;
      const application = await Application.findByPk(applicationId, {
        include: [{ model: AssessmentAttempt, where: { assessment_type: 'TECHNICAL' }, required: false }, { model: InterviewSession }, { model: Job }]
      });

      if (!application) return res.status(404).json({ error: "Application not found" });

      const malpracticeCount = await MalpracticeEvent.count({ where: { application_id: applicationId } });
      const integrityScore = Math.max(0, 100 - (malpracticeCount * 10));

      const aiResponse = await aiService.getFinalCandidateDecision({
        assessmentScore: application.technical_score || 0,
        interviewScore: application.interview_score || 0,
        integrityScore,
        behavioralScore: application.interview_score || 50
      });

      await application.update({
        final_decision: aiResponse.decision,
        role_recommendation: aiResponse.role_recommendation,
        fit_breakdown: aiResponse.fit_breakdown,
        ai_rationale: aiResponse.reasoning,
        success_probability: aiResponse.success_prediction_percentage / 100,
        overall_score: aiResponse.final_score,
        integrity_score: integrityScore
      });

      res.json({ success: true, decision: aiResponse });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /hr/applications/:applicationId/benchmark
   * Module 5: Performance Benchmarking
   */
  static async getBenchmarkData(req, res) {
    try {
      const { applicationId } = req.params;
      const application = await Application.findByPk(applicationId);
      const peers = await Application.findAll({ where: { job_id: application.job_id, status: 'SELECTED' }, limit: 5 });
      
      const peerAvg = peers.length > 0 ? peers.reduce((s, a) => s + a.overall_score, 0) / peers.length : 70;

      res.json({
        success: true,
        data: {
          candidate_score: application.overall_score,
          peer_average: Math.round(peerAvg),
          percentile: application.overall_score > peerAvg ? 85 : 45,
          recommendation: application.overall_score > peerAvg ? "Exceeds peer benchmark" : "Matches peer baseline"
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = HRDecisionController;
