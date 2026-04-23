/**
 * Proxy for the centralized email service to maintain compatibility
 * while ensuring consistent environment variable usage.
 */
const emailService = require("../services/email.service");

module.exports = {
  sendOTPEmail: emailService.sendOTPEmail,
  sendEmail: emailService.sendNotificationEmail, // Mapping generic sendEmail to sendNotificationEmail
  sendOfferLetterEmail: emailService.sendOfferLetterEmail,
  sendRejectionEmail: emailService.sendRejectionEmail,
  sendRecommendationEmail: emailService.sendRecommendationEmail
};