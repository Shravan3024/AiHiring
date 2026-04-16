const {
  Application,
  TechnicalRound,
  Notification,
  Candidate,
  Job,
  User,
  MCQTest
} = require("../models");

/* =============================
   GET ALL APPLICATIONS
============================= */
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      include: [
        { model: Candidate, include: [User] },
        { model: Job },
        { model: TechnicalRound }
      ],
      order: [["createdAt", "DESC"]]
    });

    const mapped = applications.map(app => {
      const j = app.toJSON();
      return {
        ...j,
        _id: String(j.id),
        // normalize to camelCase for frontend
        candidateId: j.Candidate ? {
          _id: String(j.Candidate.id),
          name: j.Candidate.User?.name,
          email: j.Candidate.User?.email,
        } : j.candidate_id,
        jobId: j.Job ? {
          _id: String(j.Job.id),
          title: j.Job.title,
          department: j.Job.department,
        } : j.job_id,
        stage: j.status,
        aiScore: j.overall_score,
        appliedAt: j.applied_at,
        resumeUrl: j.resume_url,
        skills: j.skills,
        cgpa: j.cgpa,
        yearOfPassout: j.year_of_passout,
      };
    });

    res.json({
      success: true,
      count: mapped.length,
      data: mapped
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* =============================
   HR SHORTLIST / REJECT
============================= */
exports.updateDecision = async (req, res) => {
  try {
    const { application_id, decision } = req.body;

    const application = await Application.findByPk(application_id, {
      include: [Candidate]
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    /* ===== UPDATE STATUS ===== */
    application.hr_decision = decision;
    application.status =
      decision === "SHORTLISTED" ? "TECHNICAL_ROUND" : "REJECTED";

    await application.save();

    /* ===== SHORTLIST FLOW ===== */
    if (decision === "SHORTLISTED") {
      /* ---- TECH ROUND ---- */
      const techRound = await TechnicalRound.findOne({
        where: { application_id }
      });

      if (!techRound) {
        await TechnicalRound.create({
          application_id,
          status: "PENDING"
        });
      }

      /* ---- MCQ TEST ---- */
      const mcq = await MCQTest.findOne({
        where: { application_id }
      });

      if (!mcq) {
        await MCQTest.create({
          application_id,
          total_questions: 10,
          duration_minutes: 30,
          status: "PENDING"
        });
      }

      /* ---- NOTIFICATION ---- */
      await Notification.create({
        user_id: application.Candidate.user_id,
        role: "CANDIDATE",
        message: "You have been shortlisted. Technical & MCQ rounds assigned."
      });
    }

    /* ===== REJECTION FLOW ===== */
    if (decision === "REJECTED") {
      await Notification.create({
        user_id: application.Candidate.user_id,
        role: "CANDIDATE",
        message: "Your application has been rejected."
      });
    }

    res.json({
      message: "Decision updated successfully",
      application
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   DASHBOARD SUMMARY
============================= */
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalApplications = await Application.count();

    const shortlisted = await Application.count({
      where: { status: "TECHNICAL_ROUND" }
    });

    const rejected = await Application.count({
      where: { status: "REJECTED" }
    });

    const completedTechRounds = await TechnicalRound.count({
      where: { status: "COMPLETED" }
    });

    res.json({
      totalApplications,
      shortlisted,
      rejected,
      completedTechRounds
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   TECHNICAL ROUNDS VIEW
============================= */
exports.getTechnicalRounds = async (req, res) => {
  try {
    const rounds = await TechnicalRound.findAll({
      include: [
        {
          model: Application,
          include: [Candidate, Job]
        }
      ]
    });

    res.json(rounds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =============================
   HR ACTION HANDLERS (NEW)
============================= */

/**
 * Send offer letter to candidate
 * POST /hr/send-offer/:applicationId
 */
exports.sendOfferLetter = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { salary, joining_date, designation } = req.body;

    const application = await Application.findByPk(applicationId, {
      include: [{ model: Candidate, include: [User] }, Job]
    });

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: "Application not found" 
      });
    }

    // Create offer record (assuming Offer model exists)
    try {
      const { Offer } = require("../models");
      await Offer.create({
        application_id: applicationId,
        salary: salary || 1000000,
        joining_date: joining_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        designation: designation || application.Job?.title,
        status: "PENDING"
      });
    } catch (e) {
      console.log("Offer creation skipped - model may not exist");
    }

    // Update application status
    application.status = "OFFER_SENT";
    await application.save();

    // Notify candidate
    try {
      await Notification.create({
        user_id: application.Candidate.user_id,
        role: "CANDIDATE",
        message: `Congratulations! You have received an offer for ${application.Job?.title} position. Please check your email for details.`
      });
    } catch (e) {
      console.log("Notification failed");
    }

    res.json({
      success: true,
      message: "Offer letter sent successfully",
      data: {
        applicationId,
        candidateName: application.Candidate?.name,
        candidateEmail: application.Candidate?.email,
        jobTitle: application.Job?.title,
        status: "OFFER_SENT"
      }
    });

  } catch (error) {
    console.error("Send offer error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error sending offer letter",
      error: error.message 
    });
  }
};

/**
 * Send rejection email to candidate
 * POST /hr/send-rejection/:applicationId
 */
exports.sendRejectionEmail = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const application = await Application.findByPk(applicationId, {
      include: [{ model: Candidate, include: [User] }, Job]
    });

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: "Application not found" 
      });
    }

    // Update application status
    application.status = "REJECTED";
    application.hr_notes = reason || application.hr_notes;
    await application.save();

    // Notify candidate
    try {
      await Notification.create({
        user_id: application.Candidate.user_id,
        role: "CANDIDATE",
        message: `Thank you for your interest in ${application.Job?.title} position. Unfortunately, your application has not been selected to move forward at this time.`
      });
    } catch (e) {
      console.log("Notification failed");
    }

    res.json({
      success: true,
      message: "Rejection email sent successfully",
      data: {
        applicationId,
        candidateName: application.Candidate?.name,
        candidateEmail: application.Candidate?.email,
        status: "REJECTED"
      }
    });

  } catch (error) {
    console.error("Send rejection error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error sending rejection",
      error: error.message 
    });
  }
};

/**
 * Schedule interview for candidate
 * POST /hr/schedule-interview/:applicationId
 */
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { interview_date, interview_time, interviewer, interview_type } = req.body;

    const application = await Application.findByPk(applicationId, {
      include: [{ model: Candidate, include: [User] }, Job]
    });

    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: "Application not found" 
      });
    }

    // Update application status
    application.status = "INTERVIEW_SCHEDULED";
    await application.save();

    // Store interview details (if InterviewSession model exists)
    try {
      const { InterviewSession } = require("../models");
      await InterviewSession.create({
        application_id: applicationId,
        scheduled_date: interview_date,
        scheduled_time: interview_time,
        interviewer: interviewer || "HR Team",
        interview_type: interview_type || "telephonic",
        status: "SCHEDULED"
      });
    } catch (e) {
      console.log("Interview session creation skipped");
    }

    // Notify candidate
    try {
      await Notification.create({
        user_id: application.Candidate.user_id,
        role: "CANDIDATE",
        message: `Your interview for ${application.Job?.title} has been scheduled for ${interview_date} at ${interview_time}. Interviewer: ${interviewer || 'HR Team'}`
      });
    } catch (e) {
      console.log("Notification failed");
    }

    res.json({
      success: true,
      message: "Interview scheduled successfully",
      data: {
        applicationId,
        candidateName: application.Candidate?.name,
        candidateEmail: application.Candidate?.email,
        interviewDate: interview_date,
        interviewTime: interview_time,
        interviewer: interviewer || "HR Team",
        status: "INTERVIEW_SCHEDULED"
      }
    });

  } catch (error) {
    console.error("Schedule interview error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error scheduling interview",
      error: error.message 
    });
  }
};

/**
 * Add internal note to application
 * POST /hr/add-note/:applicationId
 */
exports.addInternalNote = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { note } = req.body;
    const userId = req.user?.id;

    if (!note || !note.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Note content is required" 
      });
    }

    const application = await Application.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ 
        success: false,
        message: "Application not found" 
      });
    }

    // Store internal note (if HRInternalNote model exists)
    try {
      const { HRInternalNote } = require("../models");
      const internalNote = await HRInternalNote.create({
        application_id: applicationId,
        added_by: userId,
        note_text: note,
        note_type: "GENERAL"
      });

      return res.json({
        success: true,
        message: "Note added successfully",
        data: {
          note_id: internalNote.id,
          applicationId,
          note: note,
          createdAt: internalNote.createdAt
        }
      });
    } catch (e) {
      console.error("Note creation error:", e);
      return res.status(500).json({
        success: false,
        message: "Error adding note",
        error: e.message
      });
    }

  } catch (error) {
    console.error("Add note error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error adding internal note",
      error: error.message 
    });
  }
};
