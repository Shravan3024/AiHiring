const jwt = require("jsonwebtoken");

// Fail fast if secrets are not configured — never fall back to hardcoded values
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
  console.error("❌ FATAL: JWT_SECRET environment variable is not set. Exiting.");
  process.exit(1);
}

/**
 * Generate Access Token (short-lived)
 */
exports.generateToken = (payload, expiresIn = "12h") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Generate Refresh Token (long-lived)
 */
exports.generateRefreshToken = (payload, expiresIn = "7d") => {
  return jwt.sign(payload, JWT_REFRESH_SECRET || JWT_SECRET, { expiresIn });
};

/**
 * Verify Token
 */
exports.verifyToken = (token, secret = JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * Decode Token (without verification)
 */
exports.decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
