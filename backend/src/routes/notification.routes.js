const express = require("express");
const {
  getNotifications,
  createCandidateNotification,
  getCandidateNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendBulkNotifications
} = require("../controllers/notification.controller");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const router = express.Router();

/**
 * @route   GET /notifications/candidate/my
 */
router.get(
  "/candidate/my",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  getCandidateNotifications
);

/**
 * @route   GET /notifications/candidate/unread
 */
router.get(
  "/candidate/unread",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  getUnreadCount
);

/**
 * @route   PUT /notifications/:notificationId/read
 */
router.put(
  "/:notificationId/read",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  markAsRead
);

/**
 * @route   PUT /notifications/read-all
 */
router.put(
  "/read-all",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  markAllAsRead
);

/**
 * @route   DELETE /notifications/:notificationId
 */
router.delete(
  "/:notificationId",
  authMiddleware,
  roleMiddleware(["CANDIDATE"]),
  deleteNotification
);

/**
 * @route   POST /notifications/create
 */
router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR"]),
  createCandidateNotification
);

/**
 * @route   POST /notifications/bulk
 */
router.post(
  "/bulk",
  authMiddleware,
  roleMiddleware(["ADMIN", "HR"]),
  sendBulkNotifications
);

/**
 * @route   GET /notifications/hr
 */
router.get(
  "/hr",
  authMiddleware,
  roleMiddleware(["HR"]),
  getNotifications
);

module.exports = router;
