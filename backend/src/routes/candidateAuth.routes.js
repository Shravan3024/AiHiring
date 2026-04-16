const express = require("express");
const {
  candidateRegister,
  verifyOTP,
  resendOTP,
  candidateLogin,
  refreshToken,
  candidateLogout
} = require("../controllers/candidateAuth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @route   POST /auth/candidate/register
 * @desc    Register a new candidate with email & password
 * @access  Public
 */
router.post("/candidate/register", candidateRegister);

/**
 * @route   POST /auth/candidate/verify-otp
 * @desc    Verify OTP for email confirmation
 * @access  Public
 */
router.post("/candidate/verify-otp", verifyOTP);

/**
 * @route   POST /auth/candidate/resend-otp
 * @desc    Resend OTP to email
 * @access  Public
 */
router.post("/candidate/resend-otp", resendOTP);

/**
 * @route   POST /auth/candidate/login
 * @desc    Login candidate with email & password
 * @access  Public
 */
router.post("/candidate/login", candidateLogin);

/**
 * @route   POST /auth/refresh-token
 * @desc    Refresh access token
 * @access  Private
 */
router.post("/refresh-token", authMiddleware, refreshToken);

/**
 * @route   POST /auth/candidate/logout
 * @desc    Logout candidate
 * @access  Private
 */
router.post("/candidate/logout", authMiddleware, candidateLogout);

module.exports = router;
