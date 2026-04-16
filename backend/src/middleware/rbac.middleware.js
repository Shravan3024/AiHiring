/**
 * RBAC (Role-Based Access Control) Authorization Middleware
 * Controls access to AI features based on user role
 */

const logger = require('../utils/logger');

/**
 * Role hierarchy and permissions
 */
const ROLE_PERMISSIONS = {
  candidate: {
    // Candidates can only submit, cannot see analysis
    'POST:/api/ai/resume/parse': true,
    'POST:/api/ai/assessment/*': true,
    'POST:/api/ai/interview/*': true,
    'GET:/api/ai/application/*/status': true,
    // Restricted
    'GET:/api/ai/analysis/*': false,
    'GET:/api/ai/decision/*': false,
  },
  hr: {
    // HR can see and review all analyses
    'GET:/api/ai/analysis/*': true,
    'GET:/api/ai/decision/*': true,
    'POST:/api/ai/decision/approve': true,
    'POST:/api/ai/decision/reject': true,
    'GET:/api/ai/candidates/ranked': true,
    'GET:/api/ai/candidates/compare': true,
  },
  md: {
    // MD (Managing Director) - Executive view only
    'GET:/api/ai/analytics/*': true,
    'GET:/api/ai/candidates/ranked': true,
    'GET:/api/ai/decision/summary': true,
    'POST:/api/ai/decision/approve-final': true,
  },
  admin: {
    // Admin has full access
    '*': true,
  },
};

/**
 * Main authorization middleware
 * @param {Array} allowedRoles - Roles allowed to access endpoint
 * @returns {Function} Express middleware
 */
const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // Get user from request (set by auth middleware)
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        });
      }

      // Check if role is allowed
      if (!allowedRoles.includes(user.role) && user.role !== 'admin') {
        logger.warn(
          `Access denied for user ${user.id} (${user.role}) to ${req.method} ${req.path}`
        );

        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          code: 'ACCESS_DENIED',
          required_role: allowedRoles,
          user_role: user.role,
        });
      }

      // Attach role to request for later use
      req.userRole = user.role;
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        code: 'AUTH_ERROR',
      });
    }
  };
};

/**
 * Candidate-restricted endpoint
 * Only candidates can access, others see limited data
 */
const candidateRestricted = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Mark as restricted endpoint
    req.isRestrictedEndpoint = true;
    req.restrictedToRole = 'candidate';

    next();
  } catch (error) {
    logger.error('Candidate restriction check failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Restriction check failed',
      code: 'RESTRICTION_ERROR',
    });
  }
};

/**
 * Data filtering based on role
 * Filters response data based on user role
 */
const filterDataByRole = (user, data) => {
  if (!user) return null;

  // If user is candidate, hide sensitive data
  if (user.role === 'candidate') {
    const filtered = { ...data };
    // Remove HR/MD only fields
    delete filtered.ai_score;
    delete filtered.hire_recommendation;
    delete filtered.red_flags;
    delete filtered.scoring_breakdown;
    return filtered;
  }

  // MD sees aggregated data only
  if (user.role === 'md') {
    return {
      overall_score: data.overall_score,
      hire_recommendation: data.hire_recommendation,
      ranked_position: data.ranked_position,
      percentile_rank: data.percentile_rank,
    };
  }

  // HR and Admin see full data
  return data;
};

/**
 * Audit logging middleware
 * Logs all AI-related operations for compliance
 */
const auditLog = (operation) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      const originalSend = res.send;

      // Override send to capture response
      res.send = function (data) {
        // Log the operation
        logAuditEvent({
          timestamp: new Date(),
          user_id: user?.id,
          user_role: user?.role,
          operation,
          method: req.method,
          path: req.path,
          application_id: req.body?.applicationId || req.params?.applicationId,
          status_code: res.statusCode,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.headers['user-agent'],
        });

        // Call original send
        res.send = originalSend;
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logger.error('Audit logging error:', error);
      next(); // Continue even if logging fails
    }
  };
};

/**
 * Log audit event to database or file
 */
const logAuditEvent = async (event) => {
  try {
    logger.info(`[AUDIT] ${event.operation} by ${event.user_role}:${event.user_id}`, {
      application_id: event.application_id,
      status: event.status_code,
    });

    // In production: save to database
    // const { AdminAuditLog } = require('../models');
    // await AdminAuditLog.create(event);
  } catch (error) {
    logger.error('Failed to log audit event:', error);
  }
};

module.exports = {
  authorize,
  candidateRestricted,
  filterDataByRole,
  auditLog,
  ROLE_PERMISSIONS,
};
