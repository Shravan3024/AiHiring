/**
 * Global Error Handler Middleware
 * 
 * Must be registered LAST in the Express middleware chain (after all routes).
 * Catches any unhandled errors and returns a safe, generic response.
 * Full error details are logged server-side only.
 */

const logger = require("../utils/logger");

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, _next) => {
  // Log full error details server-side
  logger.error(`[UNHANDLED ERROR] ${req.method} ${req.originalUrl}`, {
    message: err.message,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    userId: req.user?.id,
    ip: req.ip,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // In production, never expose internal error details
  const isDev = process.env.NODE_ENV !== "production";

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500
      ? "An internal server error occurred. Please try again later."
      : err.message || "Something went wrong.",
    // Only include error details in development
    ...(isDev && { debug: err.message }),
  });
};

/**
 * 404 handler for unmatched routes.
 * Must be registered after all routes but before the global error handler.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { globalErrorHandler, notFoundHandler };
