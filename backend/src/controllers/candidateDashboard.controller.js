const {
  User,
  Candidate,
  Application,
  Job,
  ApplicationStatusLog,
  AssessmentAttempt,
  InterviewSession,
  NotificationQueue,
  Offer
} = require("../models");


/**
 * ==========================================
 * GET DASHBOARD OVERVIEW
 * ==========================================
 */
exports.getDashboardOverview = async (req, res) => {
  try {

    const candidate = await Candidate.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User }]
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const applications = await Application.findAll({
      where: { candidate_id: candidate.id },
      include: [
        { model: Job },
        { model: Offer, as: "offer" }
      ],
      order: [["created_at", "DESC"]],
      limit: 5
    });

    const stats = await Application.findAll({
      where: { candidate_id: candidate.id },
      attributes: ["status"],
      raw: true
    });

    const statusCounts = stats.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const unreadNotifications = await NotificationQueue.count({
      where: {
        candidate_id: candidate.id,
        status: "PENDING"
      }
    });

      res.json({
        candidate: {
          id: candidate.id,
          name: candidate.User?.name,
          email: candidate.User?.email,
          education: candidate.education,
          specialization: candidate.specialization,
          experience_years: candidate.experience_years,
          phone: candidate.phone,
          location: candidate.location,
          last_login_at: candidate.last_login_at,
          resume_path: candidate.resume_path,
          profile_image_path: candidate.profile_image_path,
          skills: candidate.skills,
          cgpa: candidate.cgpa,
          year_of_passout: candidate.year_of_passout,
          summary: candidate.summary || candidate.ai_summary,
          updated_at: candidate.updated_at
        },
        applications: applications.map(app => ({
          _id: String(app.id),
          id: app.id,
          jobId: app.Job ? { _id: String(app.Job.id), title: app.Job.title, department: app.Job.department } : null,
          job_title: app.Job?.title,
          status: app.status,
          stage: app.status,
          appliedAt: app.applied_at,
          applied_at: app.applied_at,
          offer: app.offer ? {
            _id: String(app.offer.id),
            id: app.offer.id,
            salary: app.offer.salary,
            position: app.offer.position_title,
            startDate: app.offer.joining_date,
            expiresAt: app.offer.expires_at,
            benefits: app.offer.benefits,
            details: app.offer.offer_letter_content,
            status: app.offer.status
          } : null
        })),
        dashboard: {
          total_applications: stats.length,
          status_counts: statusCounts,
          unread_notifications: unreadNotifications,
        },
        nextAction: await findLatestActiveAction(applications, candidate.id),
      });

  } catch (error) {
    console.error("Dashboard overview error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ==========================================
 * UPDATE CANDIDATE PROFILE
 * ==========================================
 */
exports.updateCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findOne({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const {
      education,
      specialization,
      experience_years,
      phone,
      location,
      skills,
      cgpa,
      year_of_passout,
      summary
    } = req.body;

    // Update only provided fields
    if (education !== undefined) candidate.education = education;
    if (specialization !== undefined) candidate.specialization = specialization;
    if (experience_years !== undefined) candidate.experience_years = experience_years;
    if (phone !== undefined) candidate.phone = phone;
    if (location !== undefined) candidate.location = location;
    if (skills !== undefined) candidate.skills = skills;
    if (cgpa !== undefined) candidate.cgpa = cgpa;
    if (year_of_passout !== undefined) candidate.year_of_passout = year_of_passout;
    if (summary !== undefined) candidate.summary = summary;

    await candidate.save();

    res.json({
      message: "Profile updated successfully",
      candidate: {
        id: candidate.id,
        education: candidate.education,
        specialization: candidate.specialization,
        experience_years: candidate.experience_years,
        phone: candidate.phone,
        location: candidate.location,
        skills: candidate.skills,
        cgpa: candidate.cgpa,
        year_of_passout: candidate.year_of_passout,
        summary: candidate.summary
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * ==========================================
 * GET APPLICATION DETAILS
 * ==========================================
 */
exports.getApplicationDetails = async (req, res) => {
  try {

    const { applicationId } = req.params;

    const candidate = await Candidate.findOne({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const application = await Application.findOne({
      where: {
        id: applicationId,
        candidate_id: candidate.id
      },
      include: [{ model: Job }]
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const assessment = await AssessmentAttempt.findOne({
      where: { application_id: applicationId }
    });

    const interview = await InterviewSession.findOne({
      where: { application_id: applicationId }
    });

    const offer = await Offer.findOne({
      where: { application_id: applicationId }
    });

    // 🔥 PRODUCTION TIMELINE FROM STATUS LOGS
    const statusLogs = await ApplicationStatusLog.findAll({
      where: { application_id: applicationId },
      order: [["created_at", "ASC"]]
    });

    const timeline = buildApplicationTimelineFromLogs(
      application,
      statusLogs,
      assessment,
      interview,
      offer
    );

    res.json({
      application,
      job: application.Job,
      assessment,
      interview,
      offer,
      timeline
    });

  } catch (error) {
    console.error("Application details error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * ==========================================
 * GET NEXT ACTION
 * ==========================================
 */
exports.getNextAction = async (req, res) => {
  try {

    const { applicationId } = req.params;

    const candidate = await Candidate.findOne({
      where: { user_id: req.user.id }
    });

    if (!candidate) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const application = await Application.findOne({
      where: {
        id: applicationId,
        candidate_id: candidate.id
      }
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    let nextAction = {
      action: null,
      title: null,
      description: null,
      button_label: null,
      button_route: null,
      is_available: false
    };

    switch (application.status) {

      case "APPLIED":
      case "SCREENING":
        nextAction = {
          action: "WAITING_RESUME_REVIEW",
          title: "Application Under Review",
          description: "Our hiring team is evaluating your profile.",
          is_available: false
        };
        break;

      case "ASSESSMENT_UNLOCKED":
      case "TECHNICAL_ROUND_PENDING":
      case "TECHNICAL_ROUND_IN_PROGRESS":
        nextAction = {
          action: "START_TECHNICAL_ASSESSMENT",
          title: application.status === "TECHNICAL_ROUND_IN_PROGRESS" ? "Assessment in Progress" : "Technical Assessment Available",
          description: application.status === "TECHNICAL_ROUND_IN_PROGRESS" ? "You have an active assessment session. Please continue to finish it." : "Please complete the technical assessment to proceed.",
          button_label: application.status === "TECHNICAL_ROUND_IN_PROGRESS" ? "Continue Assessment" : "Start Assessment",
          button_route: `/candidate/assessment/${applicationId}`,
          is_available: true
        };
        break;

      case "TECHNICAL_ROUND_COMPLETED":
      case "ASSESSMENT_COMPLETED":
      case "PROCEED_TO_HR":
      case "RECOMMENDED_BY_AI":
        nextAction = {
          action: "WAIT_FOR_INTERVIEW",
          title: "Assessment Phase Completed",
          description: "Your profile is being scheduled for an AI interview.",
          is_available: false
        };
        break;
      
      case "RE_INTERVIEW_REQUESTED":
      case "INTERVIEW_UNLOCKED":
      case "INTERVIEW_SCHEDULED":
        nextAction = {
          action: "JOIN_INTERVIEW",
          title: application.status === "RE_INTERVIEW_REQUESTED" ? "Re-Interview Requested" : "AI Interview Scheduled",
          description: application.status === "RE_INTERVIEW_REQUESTED" ? "HR has requested a re-interview. Please join when ready." : "Your AI interview is ready. Please join at your convenience.",
          button_label: "Join Interview",
          button_route: `/candidate/interview/${applicationId}`,
          is_available: true
        };
        break;

      case "INTERVIEW_COMPLETED":
        nextAction = {
          action: "FINAL_REVIEW",
          title: "Interview Completed",
          description: "Your AI interview is under final review. We will get back to you soon.",
          is_available: false
        };
        break;

      case "OFFERED":
      case "SELECTED":
        nextAction = {
          action: "VIEW_OFFER",
          title: "Offer Letter Available 🎉",
          description: "Congratulations! You have received a job offer. Please review it.",
          button_label: "View Offer",
          button_route: `/candidate/offer/${applicationId}`,
          is_available: true
        };
        break;

      case "HIRED":
        nextAction = {
          action: "ONBOARDING",
          title: "Hired!",
          description: "Welcome to Mask Polymers! Your onboarding will begin soon.",
          is_available: false
        };
        break;

      case "REJECTED":
      case "AUTO_REJECTED":
        nextAction = {
          action: "APPLICATION_CLOSED",
          title: "Application Closed",
          description: "Thank you for your time. Your profile is archived for future opportunities.",
          is_available: false
        };
        break;
    }

    res.json(nextAction);

  } catch (error) {
    console.error("Next action error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * ==========================================
 * PRODUCTION TIMELINE BUILDER
 * ==========================================
 */
function buildApplicationTimelineFromLogs(
  application,
  statusLogs,
  assessment,
  interview,
  offer
) {

  const timeline = [];

  // Always include initial application
  timeline.push({
    step: "APPLIED",
    label: "Application Submitted",
    completed: true,
    date: application.applied_at
  });

  // Add all status transitions
  statusLogs.forEach(log => {
    timeline.push({
      step: log.new_status,
      label: formatStatusLabel(log.new_status),
      completed: true,
      date: log.created_at,
      metadata: log.metadata
    });
  });

  return timeline;
}


/**
 * Format status into readable label
 */
function formatStatusLabel(status) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * PRODUCTION ACTION SEEKER
 */
async function findLatestActiveAction(applications, candidateId) {
  const activeApp = applications.find(app => 
    !["REJECTED", "AUTO_REJECTED", "HIRED", "APPLICATION_CLOSED"].includes(app.status)
  );

  if (!activeApp) return null;

  // Logic to determine what the user should do next
  switch (activeApp.status) {
    case "ASSESSMENT_UNLOCKED":
    case "TECHNICAL_ROUND_PENDING":
    case "TECHNICAL_ROUND_IN_PROGRESS":
      return {
        action: "START_TECHNICAL_ASSESSMENT",
        message: "Technical Assessment Available",
        button_label: "Continue Assessment",
        href: `/candidate/assessment/${activeApp.id}`
      };
    case "INTERVIEW_UNLOCKED":
    case "INTERVIEW_SCHEDULED":
      return {
        action: "JOIN_INTERVIEW",
        message: "AI Interview Ready",
        button_label: "Join Interview",
        href: `/candidate/interview/${activeApp.id}`
      };
    default:
      return null;
  }
}