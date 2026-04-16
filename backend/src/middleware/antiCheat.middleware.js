/**
 * Anti-Cheating Middleware
 * Detects and prevents cheating attempts during assessments
 */

const { CandidateSession, AssessmentAttempt } = require('../models');
const crypto = require('crypto');

// ==================== SESSION VALIDATION ====================

/**
 * Validate single active session per candidate
 * Prevents multiple simultaneous assessment attempts
 */
const singleSessionValidator = async (req, res, next) => {
  try {
    const candidateId = req.candidate.id;

    // Check for existing active sessions
    const activeSessions = await CandidateSession.findAll({
      where: {
        candidate_id: candidateId,
        is_active: true
      }
    });

    if (activeSessions.length > 1) {
      // Multiple sessions detected - deactivate all but newest
      const sortedSessions = activeSessions.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      for (let i = 1; i < sortedSessions.length; i++) {
        await sortedSessions[i].update({ is_active: false });
      }
    }

    // Store session info in request for later use
    req.activeSession = activeSessions[0];
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ error: 'Session validation failed' });
  }
};

// ==================== DEVICE FINGERPRINTING ====================

/**
 * Generate device fingerprint to detect multi-device attempts
 */
const generateDeviceFingerprint = (req) => {
  const userAgent = req.headers['user-agent'];
  const acceptLanguage = req.headers['accept-language'];
  const ipAddress = req.ip;

  const fingerprintString = `${userAgent}${acceptLanguage}${ipAddress}`;
  return crypto
    .createHash('sha256')
    .update(fingerprintString)
    .digest('hex');
};

/**
 * Validate device consistency during assessment
 */
const deviceConsistencyValidator = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const candidateId = req.candidate.id;
    const currentFingerprint = generateDeviceFingerprint(req);

    // Get existing assessment attempt
    const attempt = await AssessmentAttempt.findOne({
      where: {
        application_id: applicationId
      }
    });

    if (attempt && attempt.device_info?.fingerprint) {
      const storedFingerprint = attempt.device_info.fingerprint;

      if (storedFingerprint !== currentFingerprint) {
        // Device mismatch detected
        console.warn(`Device mismatch for candidate ${candidateId} in application ${applicationId}`);
        
        return res.status(403).json({
          error: 'Device mismatch detected. You must use the same device for the entire assessment.',
          current_device: currentFingerprint,
          registered_device: storedFingerprint
        });
      }
    }

    // Store fingerprint for this request
    req.deviceFingerprint = currentFingerprint;
    next();
  } catch (error) {
    console.error('Device consistency validation error:', error);
    res.status(500).json({ error: 'Device validation failed' });
  }
};

// ==================== IP ADDRESS VALIDATION ====================

/**
 * Detect IP address changes during assessment
 */
const ipValidator = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const currentIP = req.ip;

    // Get existing assessment attempt
    const attempt = await AssessmentAttempt.findOne({
      where: {
        application_id: applicationId
      }
    });

    if (attempt && attempt.ip_address && attempt.ip_address !== currentIP) {
      // IP change detected - log but may allow (e.g., mobile network switch)
      console.warn(
        `IP address change detected for application ${applicationId}. From: ${attempt.ip_address} To: ${currentIP}`
      );

      // Update anti-cheating data
      if (!attempt.anti_cheating_data) {
        attempt.anti_cheating_data = {};
      }
      attempt.anti_cheating_data.ip_changes = (attempt.anti_cheating_data.ip_changes || 0) + 1;
      attempt.anti_cheating_data.ip_change_log = attempt.anti_cheating_data.ip_change_log || [];
      attempt.anti_cheating_data.ip_change_log.push({
        from: attempt.ip_address,
        to: currentIP,
        timestamp: new Date()
      });

      await attempt.save();

      // If more than 2 IP changes, flag as suspicious
      if (attempt.anti_cheating_data.ip_changes > 2) {
        return res.status(403).json({
          error: 'Multiple IP address changes detected. Assessment flagged for review.',
          ip_changes: attempt.anti_cheating_data.ip_changes
        });
      }
    }

    req.currentIP = currentIP;
    next();
  } catch (error) {
    console.error('IP validation error:', error);
    res.status(500).json({ error: 'IP validation failed' });
  }
};

// ==================== TIME VALIDATION ====================

/**
 * Prevent time manipulation
 * Validates server-side time vs client-side time
 */
const timeValidator = async (req, res, next) => {
  try {
    const { applicationId, attemptId } = req.params;
    const { client_time } = req.body;

    // Get attempt to check elapsed time
    const attempt = await AssessmentAttempt.findByPk(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    // Calculate server-side elapsed time
    const serverElapsed = Date.now() - attempt.started_at.getTime();

    // If client time exists, verify it's roughly equal to server time
    if (client_time) {
      const timeDifference = Math.abs(serverElapsed - client_time);
      const allowedDifference = 5000; // 5 second tolerance

      if (timeDifference > allowedDifference) {
        console.warn(
          `Time discrepancy detected. Server: ${serverElapsed}ms, Client: ${client_time}ms`
        );
        
        // Log but don't block - could be network latency
        if (!attempt.anti_cheating_data) {
          attempt.anti_cheating_data = {};
        }
        attempt.anti_cheating_data.time_discrepancies =
          (attempt.anti_cheating_data.time_discrepancies || 0) + 1;
        await attempt.save();
      }
    }

    // Enforce time limit
    const ASSESSMENT_DURATION = 30 * 60 * 1000; // 30 minutes
    if (serverElapsed > ASSESSMENT_DURATION) {
      return res.status(400).json({
        error: 'Assessment time limit exceeded. Submission auto-blocked.'
      });
    }

    req.serverElapsed = serverElapsed;
    next();
  } catch (error) {
    console.error('Time validation error:', error);
    res.status(500).json({ error: 'Time validation failed' });
  }
};

// ==================== REQUEST RATE LIMITING ====================

/**
 * Rate limit answer submissions to prevent rapid-fire guessing
 */
const answerRateLimit = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const attempt = await AssessmentAttempt.findByPk(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    // Check time between submissions
    const lastActivity = attempt.last_activity || attempt.started_at;
    const timeSinceLastAnswer = Date.now() - new Date(lastActivity).getTime();
    const MIN_TIME_BETWEEN_ANSWERS = 1000; // 1 second

    if (timeSinceLastAnswer < MIN_TIME_BETWEEN_ANSWERS) {
      return res.status(429).json({
        error: 'Answer submission too rapid. Please slow down.',
        retry_after_ms: MIN_TIME_BETWEEN_ANSWERS - timeSinceLastAnswer
      });
    }

    // Count submissions in last minute
    const answers = attempt.answers || {};
    const recentAnswers = Object.entries(answers).filter(([_, answer]) => {
      const answerTime = new Date(answer.answered_at || answer.timestamp);
      return Date.now() - answerTime.getTime() < 60000;
    }).length;

    if (recentAnswers > 15) {
      // More than 15 answers in 1 minute = suspicious
      console.warn(`Rapid answer submission detected for attempt ${attemptId}`);
      
      if (!attempt.anti_cheating_data) {
        attempt.anti_cheating_data = {};
      }
      attempt.anti_cheating_data.rapid_submissions =
        (attempt.anti_cheating_data.rapid_submissions || 0) + 1;
      await attempt.save();

      if (attempt.anti_cheating_data.rapid_submissions > 3) {
        return res.status(403).json({
          error: 'Assessment flagged due to suspicious answer pattern.'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Rate limit error:', error);
    res.status(500).json({ error: 'Rate limiting failed' });
  }
};

// ==================== WINDOW/TAB DETECTION ====================

/**
 * Validate that assessment is in active window (server-side placeholder)
 * Real detection happens on client-side via visibilitychange event
 */
const windowFocusValidator = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { tab_switches, devtools_opens } = req.body;

    const attempt = await AssessmentAttempt.findByPk(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    // Accept report of tab switches from client
    if (tab_switches !== undefined) {
      if (!attempt.anti_cheating_data) {
        attempt.anti_cheating_data = {};
      }
      attempt.anti_cheating_data.tab_switches = tab_switches;
    }

    if (devtools_opens !== undefined) {
      if (!attempt.anti_cheating_data) {
        attempt.anti_cheating_data = {};
      }
      attempt.anti_cheating_data.devtools_opens = devtools_opens;
    }

    await attempt.save();
    next();
  } catch (error) {
    console.error('Window focus validation error:', error);
    res.status(500).json({ error: 'Window focus validation failed' });
  }
};

// ==================== UNUSUAL ACTIVITY DETECTION ====================

/**
 * Detect unusual activity patterns
 */
const unusualActivityDetector = async (req, res, next) => {
  try {
    const { applicationId, attemptId } = req.params;
    const { answers, anti_cheating_event } = req.body;

    const attempt = await AssessmentAttempt.findByPk(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: 'Assessment attempt not found' });
    }

    // Initialize anti-cheating data if needed
    if (!attempt.anti_cheating_data) {
      attempt.anti_cheating_data = {
        tab_switches: 0,
        copy_attempts: 0,
        paste_attempts: 0,
        fullscreen_exits: 0,
        devtools_opens: 0,
        unusual_activity: []
      };
    }

    // Pattern 1: Too many events in short time
    const recentEvents = (attempt.anti_cheating_data.unusual_activity || []).filter(e => {
      return Date.now() - new Date(e.timestamp).getTime() < 60000;
    });

    if (recentEvents.length > 10) {
      attempt.anti_cheating_data.unusual_activity.push({
        type: 'BURST_OF_EVENTS',
        count: recentEvents.length,
        timestamp: new Date()
      });
    }

    // Pattern 2: Copy/Paste in sequence
    if (
      anti_cheating_event?.type === 'PASTE_ATTEMPT' &&
      attempt.anti_cheating_data.copy_attempts > 0
    ) {
      attempt.anti_cheating_data.unusual_activity.push({
        type: 'COPY_PASTE_SEQUENCE',
        timestamp: new Date()
      });
    }

    // Pattern 3: Multiple fullscreen exits with short answers
    if (
      anti_cheating_event?.type === 'FULLSCREEN_EXIT' &&
      attempt.anti_cheating_data.fullscreen_exits > 2
    ) {
      attempt.anti_cheating_data.unusual_activity.push({
        type: 'REPEATED_FULLSCREEN_EXITS',
        count: attempt.anti_cheating_data.fullscreen_exits,
        timestamp: new Date()
      });
    }

    // Save updated data
    await attempt.save();

    // Check if too many unusual activities
    if ((attempt.anti_cheating_data.unusual_activity || []).length > 5) {
      return res.status(403).json({
        error: 'Assessment flagged due to unusual activity patterns.',
        unusual_activities_count: attempt.anti_cheating_data.unusual_activity.length
      });
    }

    next();
  } catch (error) {
    console.error('Unusual activity detection error:', error);
    res.status(500).json({ error: 'Activity detection failed' });
  }
};

// ==================== COMPREHENSIVE ANTI-CHEAT MIDDLEWARE ====================

/**
 * Combined anti-cheating middleware
 * Use this to wrap all assessment endpoints
 */
const assessmentSecurityMiddleware = [
  singleSessionValidator,
  deviceConsistencyValidator,
  ipValidator,
  timeValidator,
  answerRateLimit,
  windowFocusValidator,
  unusualActivityDetector
];

// ==================== LOGGING & MONITORING ====================

/**
 * Log all assessment activity for compliance
 */
const assessmentActivityLogger = async (req, res, next) => {
  try {
    const { applicationId, attemptId } = req.params;
    const candidateId = req.candidate.id;

    // Log request
    const logEntry = {
      timestamp: new Date(),
      candidate_id: candidateId,
      application_id: applicationId,
      attempt_id: attemptId,
      endpoint: req.path,
      method: req.method,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      device_fingerprint: generateDeviceFingerprint(req)
    };

    console.log(`[ASSESSMENT_ACTIVITY] ${JSON.stringify(logEntry)}`);

    // Store in activity log (could write to database)
    if (attemptId) {
      const attempt = await AssessmentAttempt.findByPk(attemptId);
      if (attempt) {
        if (!attempt.anti_cheating_data) {
          attempt.anti_cheating_data = {};
        }
        if (!attempt.anti_cheating_data.activity_log) {
          attempt.anti_cheating_data.activity_log = [];
        }
        attempt.anti_cheating_data.activity_log.push(logEntry);
        await attempt.save();
      }
    }

    next();
  } catch (error) {
    console.error('Activity logging error:', error);
    next(); // Don't block on logging error
  }
};

// ==================== EXPORTS ====================

module.exports = {
  singleSessionValidator,
  generateDeviceFingerprint,
  deviceConsistencyValidator,
  ipValidator,
  timeValidator,
  answerRateLimit,
  windowFocusValidator,
  unusualActivityDetector,
  assessmentSecurityMiddleware,
  assessmentActivityLogger
};
