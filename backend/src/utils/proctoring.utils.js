/**
 * Phase 7: Proctoring Utilities
 * Behavioral analysis, anomaly detection, and integrity validation
 */

// ==================== BEHAVIORAL ANALYZER ====================

class BehavioralAnalyzer {
  constructor() {
    this.keyboardBaseline = {
      avgTypingSpeed: 0,
      avgPauseTime: 0,
      consistency: 0
    };

    this.mouseBaseline = {
      avgClickFrequency: 0,
      avgMovementSpeed: 0,
      pausePatterns: []
    };
  }

  /**
   * Initialize behavioral profile
   */
  initializeProfile(metadata) {
    return {
      sessionId: metadata.sessionId,
      candidateId: metadata.candidateId,
      startTime: metadata.startTime,
      keyboardProfile: null,
      mouseProfile: null,
      focusProfile: null,
      navigationProfile: null,
      riskLevel: 'LOW'
    };
  }

  /**
   * Analyze keyboard behavior for anomalies
   * Detects: copy/paste, scripted typing, unusual patterns
   */
  analyzeKeyboardBehavior(metrics) {
    const {
      keystrokes,
      pauseTimes,
      typingSpeed,
      copyPasteEvents,
      deletePatterns,
      totalKeyPresses
    } = metrics;

    const analysis = {
      suspiciousPattern: false,
      severity: 'LOW',
      message: 'Normal typing pattern',
      riskScore: 0,
      metrics: {}
    };

    // Check 1: Unusually fast typing speed
    if (typingSpeed > 200) {
      // WPM > 200 is superhuman for most people
      analysis.suspiciousPattern = true;
      analysis.severity = 'MEDIUM';
      analysis.message = 'Unusually fast typing speed detected';
      analysis.riskScore += 15;
    }

    // Check 2: Unusually slow typing with pauses
    if (typingSpeed < 20 && totalKeyPresses > 100) {
      // Suggesting copying from external source
      analysis.suspiciousPattern = true;
      analysis.severity = 'MEDIUM';
      analysis.message = 'Unusually slow typing with long pauses';
      analysis.riskScore += 12;
    }

    // Check 3: Copy/paste attempts
    if (copyPasteEvents > 2) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'HIGH';
      analysis.message = `${copyPasteEvents} copy/paste attempts detected`;
      analysis.riskScore += 20;
    }

    // Check 4: Excessive delete/backspace
    if (deletePatterns?.totalDeletes > totalKeyPresses * 0.4) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'MEDIUM';
      analysis.message = 'Excessive corrections and deletions';
      analysis.riskScore += 10;
    }

    // Check 5: Irregular pause patterns
    const pauseConsistency = this._calculateConsistency(pauseTimes);
    if (pauseConsistency < 0.3) {
      // Very inconsistent pauses suggest non-human input
      analysis.suspiciousPattern = true;
      analysis.severity = 'HIGH';
      analysis.message = 'Highly irregular typing pause patterns';
      analysis.riskScore += 18;
    }

    analysis.metrics = {
      typingSpeed,
      copyPasteCount: copyPasteEvents,
      pauseConsistency: pauseConsistency,
      keystrokeCount: totalKeyPresses
    };

    return analysis;
  }

  /**
   * Analyze mouse behavior
   * Detects: automated clicking, unusual movement patterns
   */
  analyzeMouseBehavior(metrics) {
    const {
      clicks,
      movements,
      avgClickFrequency,
      avgMovementSpeed,
      pauseBetweenClicks,
      rightClicks
    } = metrics;

    const analysis = {
      suspiciousPattern: false,
      severity: 'LOW',
      message: 'Normal mouse behavior',
      riskScore: 0,
      metrics: {}
    };

    // Check 1: Abnormal click frequency
    if (avgClickFrequency > 50) {
      // Superhuman clicking
      analysis.suspiciousPattern = true;
      analysis.severity = 'MEDIUM';
      analysis.message = 'Unusually high click frequency';
      analysis.riskScore += 15;
    }

    // Check 2: Straight-line movements only (robotic)
    const moveConsistency = this._calculateMovementConsistency(movements);
    if (moveConsistency > 0.9) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'HIGH';
      analysis.message = 'Robotic mouse movement patterns';
      analysis.riskScore += 20;
    }

    // Check 3: Instantaneous movements (teleporting)
    const instantMoves = movements?.filter(m => m.time < 10) || [];
    if (instantMoves.length > movements?.length * 0.2) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'HIGH';
      analysis.message = 'Impossibly fast mouse movements detected';
      analysis.riskScore += 22;
    }

    // Check 4: Right-click attempts (inspect element)
    if (rightClicks > 3) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'MEDIUM';
      analysis.message = `${rightClicks} right-click attempts detected`;
      analysis.riskScore += 16;
    }

    // Check 5: No pause between clicks (bot-like)
    const pauseAvg = pauseBetweenClicks?.average || 0;
    if (pauseAvg < 100 && clicks > 20) {
      // Less than 100ms between clicks
      analysis.suspiciousPattern = true;
      analysis.severity = 'HIGH';
      analysis.message = 'Unnatural pause patterns between clicks';
      analysis.riskScore += 18;
    }

    analysis.metrics = {
      clickFrequency: avgClickFrequency,
      movementSpeed: avgMovementSpeed,
      moveConsistency: moveConsistency,
      instantMoveCount: instantMoves.length,
      rightClickCount: rightClicks
    };

    return analysis;
  }

  /**
   * Analyze focus/attention patterns
   * Detects: tab switching, window blur events
   */
  analyzeFocusPattern(focusEvents) {
    const {
      blurEvents,
      focusLossCount,
      totalFocusTime,
      assessmentTime,
      outsideClickAttempts
    } = focusEvents;

    const analysis = {
      suspiciousPattern: false,
      severity: 'LOW',
      message: 'Normal focus pattern',
      riskScore: 0,
      metrics: {}
    };

    // Check 1: Frequent blur events
    if (blurEvents > 5) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'MEDIUM';
      analysis.message = `${blurEvents} window blur events detected`;
      analysis.riskScore += 12;
    }

    // Check 2: Low focus time percentage
    const focusPercentage = (totalFocusTime / assessmentTime) * 100;
    if (focusPercentage < 70) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'HIGH';
      analysis.message = `Focus on exam only ${focusPercentage.toFixed(1)}% of time`;
      analysis.riskScore += 20;
    }

    // Check 3: Tab switching attempts
    const tabSwitches = blurEvents;
    if (tabSwitches > 10) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'CRITICAL';
      analysis.message = `${tabSwitches} tab/window switches detected`;
      analysis.riskScore += 25;
    }

    // Check 4: Long absence from window
    if (focusLossCount > 3) {
      analysis.suspiciousPattern = true;
      analysis.severity = 'MEDIUM';
      analysis.message = 'Multiple extended periods away from exam';
      analysis.riskScore += 15;
    }

    analysis.metrics = {
      blurEventCount: blurEvents,
      focusPercentage: focusPercentage,
      focusLossCount: focusLossCount,
      outsideClickCount: outsideClickAttempts
    };

    return analysis;
  }

  /**
   * Analyze navigation patterns
   * Detects: unauthorized URLs, external resources
   */
  analyzeNavigationPattern(navigationEvents) {
    const blockedDomains = [
      'stackoverflow.com',
      'github.com',
      'youtube.com',
      'google.com',
      'chat.openai.com',
      'claude.ai',
      'wikipedia.org',
      'reddit.com'
    ];

    const unauthorizedNavigations = navigationEvents
      .filter(nav => {
        try {
          const url = new URL(nav.url);
          return blockedDomains.some(domain => url.hostname.includes(domain));
        } catch {
          return false;
        }
      });

    const analysis = {
      suspiciousNavigation: unauthorizedNavigations.length > 0,
      severity: unauthorizedNavigations.length > 0 ? 'CRITICAL' : 'LOW',
      message:
        unauthorizedNavigations.length > 0
          ? `Unauthorized resource access detected: ${unauthorizedNavigations.map(n => n.domain).join(', ')}`
          : 'Normal navigation',
      riskScore: unauthorizedNavigations.length * 15
    };

    return analysis;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate consistency of timing patterns
   * Returns 0-1, where 1 = perfectly consistent
   */
  _calculateConsistency(timings) {
    if (!timings || timings.length < 2) return 1;

    const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
    const variance =
      timings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / timings.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (0 = perfect consistency, 1 = high variance)
    return 1 - Math.min(stdDev / mean, 1);
  }

  /**
   * Calculate movement consistency (how linear/straight)
   */
  _calculateMovementConsistency(movements) {
    if (!movements || movements.length < 2) return 0;

    let straightLineCount = 0;
    const threshold = 10; // degrees

    for (let i = 1; i < movements.length - 1; i++) {
      const angle1 = Math.atan2(
        movements[i].y - movements[i - 1].y,
        movements[i].x - movements[i - 1].x
      );
      const angle2 = Math.atan2(
        movements[i + 1].y - movements[i].y,
        movements[i + 1].x - movements[i].x
      );

      const angleDiff = Math.abs(angle1 - angle2) * (180 / Math.PI);

      if (angleDiff < threshold) {
        straightLineCount++;
      }
    }

    return straightLineCount / movements.length;
  }
}

// ==================== ANOMALY DETECTOR ====================

class AnomalyDetector {
  constructor() {
    this.riskThresholds = {
      LOW: 10,
      MEDIUM: 25,
      HIGH: 50,
      CRITICAL: 75
    };
  }

  /**
   * Detect anomalies from event stream
   */
  detectAnomaly(eventType, eventData, session) {
    const anomalyMap = {
      'FULLSCREEN_EXIT': this._checkFullscreenExit(),
      'COPY_ATTEMPT': this._checkCopyAttempt(),
      'PRINT_ATTEMPT': this._checkPrintAttempt(),
      'DEVELOPER_TOOLS': this._checkDeveloperTools(),
      'EXTERNAL_DEVICE': this._checkExternalDevice(eventData),
      'NETWORK_CHANGE': this._checkNetworkChange(eventData),
      'MULTIPLE_FACES': this._checkMultipleFaces(eventData),
      'NO_FACE': this._checkNoFace(eventData),
      'UNUSUAL_LOCATION': this._checkUnusualLocation(eventData)
    };

    return anomalyMap[eventType] || null;
  }

  // ==================== ANOMALY CHECKS ====================

  _checkFullscreenExit() {
    return {
      type: 'FULLSCREEN_EXIT',
      severity: 'HIGH',
      riskScore: 20,
      message: 'Exited fullscreen mode',
      recommendation: 'Warning given to candidate'
    };
  }

  _checkCopyAttempt() {
    return {
      type: 'COPY_ATTEMPT',
      severity: 'HIGH',
      riskScore: 18,
      message: 'Copy operation detected',
      recommendation: 'Monitor for pattern'
    };
  }

  _checkPrintAttempt() {
    return {
      type: 'PRINT_ATTEMPT',
      severity: 'CRITICAL',
      riskScore: 30,
      message: 'Print operation detected - Exam questions exposure',
      recommendation: 'Immediate investigation'
    };
  }

  _checkDeveloperTools() {
    return {
      type: 'DEVELOPER_TOOLS',
      severity: 'CRITICAL',
      riskScore: 25,
      message: 'Developer tools opened',
      recommendation: 'Investigation required'
    };
  }

  _checkExternalDevice(eventData) {
    return {
      type: 'EXTERNAL_DEVICE',
      severity: 'HIGH',
      riskScore: 22,
      message: `External device detected: ${eventData?.deviceType || 'Unknown'}`,
      recommendation: 'Verify device is allowed'
    };
  }

  _checkNetworkChange(eventData) {
    return {
      type: 'NETWORK_CHANGE',
      severity: 'MEDIUM',
      riskScore: 12,
      message: 'Network connection changed during exam',
      recommendation: 'Log and monitor'
    };
  }

  _checkMultipleFaces(eventData) {
    return {
      type: 'MULTIPLE_FACES',
      severity: 'CRITICAL',
      riskScore: 35,
      message: `${eventData?.faceCount || 2} faces detected in frame`,
      recommendation: 'Possible impersonation - immediate review'
    };
  }

  _checkNoFace(eventData) {
    return {
      type: 'NO_FACE',
      severity: 'HIGH',
      riskScore: 20,
      message: 'Face not visible in video frame',
      recommendation: 'Request candidate to reposition camera'
    };
  }

  _checkUnusualLocation(eventData) {
    return {
      type: 'UNUSUAL_LOCATION',
      severity: 'MEDIUM',
      riskScore: 15,
      message: 'Background appears to have changed significantly',
      recommendation: 'Monitor for additional signs'
    };
  }
}

// ==================== INTEGRITY VALIDATOR ====================

class IntegrityValidator {
  constructor() {
    this.weights = {
      anomalyCount: 0.3,
      flagCount: 0.25,
      behavioralRisks: 0.25,
      mediaAlerts: 0.2
    };
  }

  /**
   * Calculate exact malpractice score based on user formula
   * formula = (tab_switch * 5) + (fullscreen_exit * 10) + (copy_attempt * 3)
   */
  calculateMalpracticeScore(session) {
    const tabSwitches = session.flags?.filter(f => f.type === 'WINDOW_BLUR' || f.type === 'TAB_SWITCH').length || 0;
    const fullscreenExits = session.flags?.filter(f => f.type === 'FULLSCREEN_EXIT').length || 0;
    const copyAttempts = session.flags?.filter(f => f.type === 'COPY_ATTEMPT' || f.type === 'COPY_PASTE').length || 0;

    const score = (tabSwitches * 5) + (fullscreenExits * 10) + (copyAttempts * 3);
    
    let classification = 'Safe';
    if (score >= 25) classification = 'High Risk';
    else if (score >= 10) classification = 'Suspicious';

    return { score, classification, details: { tabSwitches, fullscreenExits, copyAttempts } };
  }

  /**
   * Validate overall assessment integrity
   */
  validateAssessmentIntegrity(session) {
    const malpractice = this.calculateMalpracticeScore(session);
    const anomalyCount = session.anomalies?.length || 0;
    const mediaAlerts = session.audioDetections?.length || 0;

    // Integrity score (100 - malpractice_score - other penalties)
    let integrityScore = 100 - malpractice.score;
    integrityScore -= (anomalyCount * 5);
    integrityScore -= (mediaAlerts * 10);
    
    integrityScore = Math.max(0, integrityScore);

    let recommendedAction = 'ALLOW';
    if (malpractice.score >= 25 || integrityScore < 40) recommendedAction = 'REJECT';
    else if (malpractice.score >= 10 || integrityScore < 70) recommendedAction = 'REVIEW';

    return {
      integrityScore: Math.round(integrityScore),
      malpracticeScore: malpractice.score,
      malpracticeClassification: malpractice.classification,
      recommendedAction,
      violationDetails: {
        ...malpractice.details,
        anomalyCount,
        mediaAlerts
      }
    };
  }

  /**
   * Count behavioral risk incidents
   */
  _countBehavioralRisks(session) {
    let count = 0;

    if (session.keyboardMetrics?.suspiciousPattern) count += 2;
    if (session.mouseMetrics?.suspiciousPattern) count += 2;
    if (session.behavioralProfile?.riskLevel === 'HIGH') count += 1;

    return count;
  }

  /**
   * Extract critical violations
   */
  _getCriticalViolations(session) {
    return (session.flags || [])
      .filter(f => f.severity === 'CRITICAL')
      .map(f => ({
        type: f.type,
        message: f.message,
        timestamp: f.timestamp
      }));
  }

  /**
   * Extract medium risk items
   */
  _getMediumRiskItems(session) {
    return (session.anomalies || [])
      .filter(a => a.severity === 'MEDIUM')
      .map(a => ({
        type: a.type,
        message: a.message
      }));
  }

  /**
   * Extract low risk items
   */
  _getLowRiskItems(session) {
    return (session.anomalies || [])
      .filter(a => a.severity === 'LOW')
      .slice(0, 5); // Limit to first 5
  }
}

// ==================== EXPORTS ====================

module.exports = {
  BehavioralAnalyzer,
  AnomalyDetector,
  IntegrityValidator
};
