const { NotificationQueue, Notification, Candidate } = require("../models");
const { sendNotificationEmail } = require("../services/email.service");


/**
 * GET HR NOTIFICATIONS (Old system)
 */
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { role: "HR" },
      order: [["createdAt", "DESC"]]
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * CREATE CANDIDATE NOTIFICATION
 */
exports.createCandidateNotification = async (req, res) => {
  try {
    const { candidate_id, application_id, notification_type, title, message, action_url, send_email } = req.body;

    if (!candidate_id || !notification_type || !title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = await NotificationQueue.create({
      candidate_id,
      application_id,
      notification_type,
      title,
      message,
      action_url,
      sent_via_email: false
    });

    // Send email if requested
    if (send_email) {
      const candidate = await Candidate.findByPk(candidate_id, {
        include: ["User"]
      });

      if (candidate?.User?.email) {
        await sendNotificationEmail(
          candidate.User.email,
          title,
          message,
          action_url
        );
        
        await notification.update({ sent_via_email: true, sent_at: new Date() });
      }
    }

    res.status(201).json(notification);
  } catch (error) {
    console.error("Create notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET CANDIDATE NOTIFICATIONS
 */
exports.getCandidateNotifications = async (req, res) => {
  try {
    const candidateId = req.candidate?.id;
    const { status, limit = 20, offset = 0 } = req.query;

    if (!candidateId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const where = { candidate_id: candidateId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await NotificationQueue.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      notifications: rows
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * GET UNREAD NOTIFICATIONS COUNT
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const candidateId = req.candidate?.id;

    if (!candidateId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const unreadCount = await NotificationQueue.count({
      where: {
        candidate_id: candidateId,
        status: "PENDING"
      }
    });

    res.json({ unread_count: unreadCount });
  } catch (error) {
    console.error("Unread count error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * MARK NOTIFICATION AS READ
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const candidateId = req.candidate?.id;

    if (!candidateId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await NotificationQueue.findOne({
      where: { id: notificationId, candidate_id: candidateId }
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.update({
      status: "READ",
      read_at: new Date()
    });

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * MARK ALL NOTIFICATIONS AS READ
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const candidateId = req.candidate?.id;

    if (!candidateId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await NotificationQueue.update(
      { status: "READ", read_at: new Date() },
      { where: { candidate_id: candidateId, status: "PENDING" } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * DELETE NOTIFICATION
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const candidateId = req.candidate?.id;

    if (!candidateId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notification = await NotificationQueue.findOne({
      where: { id: notificationId, candidate_id: candidateId }
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.destroy();
    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * SEND BULK NOTIFICATIONS (HR/Admin)
 */
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { candidate_ids, notification_type, title, message, action_url, send_email } = req.body;

    if (!candidate_ids || candidate_ids.length === 0) {
      return res.status(400).json({ message: "Candidate IDs required" });
    }

    const notifications = [];

    for (const candidateId of candidate_ids) {
      const notification = await NotificationQueue.create({
        candidate_id: candidateId,
        notification_type,
        title,
        message,
        action_url,
        sent_via_email: false
      });

      if (send_email) {
        const candidate = await Candidate.findByPk(candidateId, {
          include: ["User"]
        });

        if (candidate?.User?.email) {
          await sendNotificationEmail(
            candidate.User.email,
            title,
            message,
            action_url
          );

          await notification.update({ sent_via_email: true, sent_at: new Date() });
        }
      }

      notifications.push(notification);
    }

    res.status(201).json({
      message: `${notifications.length} notifications created`,
      notifications
    });
  } catch (error) {
    console.error("Bulk notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



/**
 * NOTIFICATION TEMPLATES
 */
exports.notificationTemplates = {
  APPLICATION_RECEIVED: (candidateId, jobTitle) => ({
    candidate_id: candidateId,
    notification_type: "APPLICATION_RECEIVED",
    title: "Application Received",
    message: `Your application for ${jobTitle} has been received. We'll evaluate your resume and get back to you shortly.`
  }),

  RESUME_EVALUATED: (candidateId, jobTitle, score) => ({
    candidate_id: candidateId,
    notification_type: "RESUME_EVALUATED",
    title: "Resume Evaluation Complete",
    message: `Your resume for ${jobTitle} has been evaluated. You have qualified for the next round!`
  }),

  ASSESSMENT_AVAILABLE: (candidateId, jobTitle) => ({
    candidate_id: candidateId,
    notification_type: "ASSESSMENT_AVAILABLE",
    title: "Technical Assessment Available",
    message: `The technical assessment for ${jobTitle} is now available. Please complete it within 48 hours.`
  }),

  ASSESSMENT_COMPLETED: (candidateId) => ({
    candidate_id: candidateId,
    notification_type: "ASSESSMENT_COMPLETED",
    title: "Assessment Submitted Successfully",
    message: "Your technical assessment has been submitted and is under evaluation."
  }),

  INTERVIEW_SCHEDULED: (candidateId, jobTitle, interviewDate) => ({
    candidate_id: candidateId,
    notification_type: "INTERVIEW_SCHEDULED",
    title: "Interview Scheduled",
    message: `Your AI interview for ${jobTitle} is scheduled on ${new Date(interviewDate).toLocaleString()}`
  }),

  INTERVIEW_COMPLETED: (candidateId) => ({
    candidate_id: candidateId,
    notification_type: "INTERVIEW_COMPLETED",
    title: "Interview Completed",
    message: "Your AI interview has been completed and submitted for evaluation."
  }),

  OFFER_LETTER_READY: (candidateId, company) => ({
    candidate_id: candidateId,
    notification_type: "OFFER_LETTER_READY",
    title: "Offer Letter Ready",
    message: `Congratulations! Your offer letter from ${company} is ready. Please review and accept it.`
  }),

  REJECTION: (candidateId, jobTitle) => ({
    candidate_id: candidateId,
    notification_type: "REJECTION",
    title: "Application Status Update",
    message: `Thank you for giving us the opportunity to review your profile for the ${jobTitle} position. While we were impressed with your background, we have decided to move forward with other candidates at this time. We have archived your profile for future opportunities that match your skills. We wish you the very best in your career pursuits.`
  })
};
