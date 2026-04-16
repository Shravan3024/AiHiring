/**
 * Edge Case Handler Service
 * Handles real-world failures: video corruption, internet loss, tab switch, time anomalies
 * Critical for ATS reliability
 */

const EdgeCaseHandler = {
  // 1. VIDEO/AUDIO CORRUPTION HANDLER
  handleMediaCorruption: async (assessmentId, mediaType) => {
    /*
    Real scenario: Video upload failed mid-interview
    Solution: Auto-fallback to transcript mode
    */
    const fallbackStrategies = {
      video_corrupted: {
        action: "FALLBACK_TO_AUDIO",
        description: "Use audio track if available",
        alt: "FALLBACK_TO_TEXT",
        message: "Video unavailable. Continuing with audio. Your audio will be transcribed.",
        timestamp: new Date(),
      },
      audio_corrupted: {
        action: "FALLBACK_TO_TEXT",
        description: "Candidate continues with text responses",
        message: "Audio/Video unavailable. Please provide text responses.",
        timestamp: new Date(),
      },
      upload_timeout: {
        action: "AUTO_RETRY",
        maxRetries: 3,
        retryDelay: 5000, // 5 seconds
        fallback: "MANUAL_UPLOAD",
        message: "Upload failed. Retrying... (Attempt {attempt}/3)",
      },
      all_media_failed: {
        action: "ESCALATE_TO_MANUAL",
        hrReview: true,
        flag: "INTERVIEW_INCOMPLETE",
        decision: "MANUAL_EVALUATION",
        message: "Technical issue detected. HR team will contact you for alternative arrangements.",
      },
    };

    return fallbackStrategies[mediaType] || fallbackStrategies.all_media_failed;
  },

  // 2. INTERNET LOSS HANDLER
  handleInternetLoss: async (assessmentId, lastSyncTime) => {
    /*
    Real scenario: Candidate's internet drops mid-MCQ test
    Solution: Auto-save, mark as "interrupted", allow resume within 5 minutes
    */
    return {
      action: "AUTO_SAVE_AND_PAUSE",
      timeAllowedToResume: 5 * 60 * 1000, // 5 minutes in milliseconds
      savedState: {
        lastSyncTime: lastSyncTime || new Date(),
        questionsAnswered: "cached_locally",
        progress: "auto_saved",
      },
      resumeWindow: {
        opens: new Date(),
        closes: new Date(Date.now() + 5 * 60 * 1000),
        message: "Your connection was lost. We've saved your progress. You have 5 minutes to reconnect.",
      },
      onResumeFailure: {
        action: "MARK_AS_INTERRUPTED",
        status: "INCOMPLETE",
        note: "Candidate did not resume within allowed window",
        hrAction: "MANUAL_REVIEW_REQUIRED",
      },
      monitoring: {
        trackNetworkQuality: true,
        warnAt: {
          latency_ms: 500,
          packetLoss_percent: 5,
        },
        disconnectThreshold: 3, // seconds
      },
    };
  },

  // 3. TAB SWITCH / WINDOW FOCUS DETECTION
  handleIntegrityViolation: async (violationType, frequency) => {
    /*
    Real scenario: Candidate switches tab during test (cheating detection)
    Solution: Flag for HR review, don't auto-disqualify
    */
    const violations = {
      tab_switch_single: {
        severity: "LOW",
        action: "LOG_AND_WARN",
        message: "Please keep this window in focus.",
        flag: false,
        hrNotification: false,
      },
      tab_switch_multiple: {
        severity: "MEDIUM",
        action: "LOG_AND_WARN",
        count: frequency,
        message: "Multiple focus losses detected. This will be noted.",
        flag: true,
        flagReason: "MULTIPLE_TAB_SWITCHES",
        hrNotification: true,
        hrMessage: `Candidate switched tabs ${frequency} times during assessment`,
      },
      window_minimize: {
        severity: "MEDIUM",
        action: "WARN",
        message: "This window should remain maximized.",
        flag: true,
        hrAction: "REVIEW",
      },
      external_screen_detected: {
        severity: "HIGH",
        action: "FLAG_FOR_REVIEW",
        message: "Screen sharing or external display detected.",
        flag: true,
        flagReason: "EXTERNAL_DISPLAY",
        hrAction: "MANUAL_INTERVIEW_RECOMMENDED",
      },
      camera_disabled: {
        severity: "HIGH",
        action: "STOP_AND_ESCALATE",
        message: "Camera is required. Please enable it to continue.",
        flag: true,
        requirement: "MANDATORY_CAMERA",
        hrAction: "ESCALATE_TO_HR",
      },
    };

    return violations[violationType] || violations.tab_switch_single;
  },

  // 4. TIME ANOMALY DETECTION
  handleTimeAnomaly: async (expectedDuration, actualDuration, submissionTime) => {
    /*
    Real scenario: Candidate submits 60-question test in 2 minutes (physically impossible)
    Solution: Flag for review, don't auto-disqualify
    */
    const timePerQuestion = actualDuration / 60; // assuming 60 questions
    const expectedTimePerQuestion = expectedDuration / 60;

    const anomalyCheck = {
      timePerQuestion,
      expectedTimePerQuestion,
      anomalyRatio: timePerQuestion / expectedTimePerQuestion,
    };

    if (anomalyCheck.anomalyRatio < 0.2) {
      // Too fast (20% of expected time)
      return {
        severity: "HIGH",
        action: "FLAG_FOR_REVIEW",
        issue: "SUSPICIOUSLY_FAST_COMPLETION",
        message: `Completed in ${actualDuration}s vs expected ${expectedDuration}s (${(anomalyCheck.anomalyRatio * 100).toFixed(0)}% of expected time)`,
        flag: true,
        flagReason: "TIME_ANOMALY_SUSPICIOUSLY_FAST",
        hrAction: "MANUAL_REVIEW",
        suggestion: "Consider re-interview or additional assessment",
      };
    } else if (anomalyCheck.anomalyRatio > 3) {
      // Too slow (3x expected time) - could be technical issues
      return {
        severity: "MEDIUM",
        action: "LOG_AND_FLAG",
        issue: "UNUSUALLY_SLOW_COMPLETION",
        message: `Took ${actualDuration}s vs expected ${expectedDuration}s (${(anomalyCheck.anomalyRatio * 100).toFixed(0)}% of expected time)`,
        flag: true,
        flagReason: "TIME_ANOMALY_SLOW",
        hrAction: "NOTE_CONTEXT",
        suggestion: "Check if technical issues occurred",
      };
    }

    return {
      severity: "LOW",
      action: "LOG_ONLY",
      message: `Within normal range: ${(anomalyCheck.anomalyRatio * 100).toFixed(0)}% of expected time`,
      flag: false,
    };
  },

  // 5. AI MODEL FAILURE HANDLER
  handleAIModelFailure: async (stageName, modelVersion) => {
    /*
    Real scenario: AI model crashes or returns inconsistent scores
    Solution: Fallback to manual HR review
    */
    return {
      action: "FALLBACK_TO_MANUAL",
      stage: stageName,
      failedModel: modelVersion,
      status: "ANALYSIS_PENDING",
      message: "Our analysis system is temporarily processing results. HR team will review manually.",
      fallbackProcess: {
        step1: "Mark candidate as 'PENDING_HR_REVIEW'",
        step2: "Notify HR of AI failure",
        step3: "HR makes decision based on raw assessment data",
        step4: "Log incident for AI team",
      },
      timeline: {
        waitTime: "Up to 24 hours",
        escalationTime: "If not completed in 24h, auto-escalate",
      },
      notification: {
        candidate: "Your results are being reviewed by our team. We'll notify you soon.",
        hr: "AI model failure detected. Manual review required.",
        admin: "AI model failure: {modelVersion} at stage {stageName}",
      },
    };
  },

  // 6. ASSESSMENT INCOMPLETE HANDLER
  handleIncompleteAssessment: async (
    assessmentId,
    completionPercent,
    reason
  ) => {
    /*
    Real scenario: Candidate closes test window midway through
    Solution: Mark incomplete, don't auto-reject
    */
    return {
      status: "INCOMPLETE",
      completionPercent,
      reason, // "user_closed", "timeout", "network_loss", "page_crash"
      action:
        completionPercent > 50
          ? "REVIEW_WITH_PARTIAL_DATA"
          : "REQUEST_RETAKE_OR_MANUAL_REVIEW",
      hrDecision:
        completionPercent > 50
          ? "Can evaluate on completed portion"
          : "Request retake or interview for assessment",
      allowRetake: true,
      retakeLimit: 2,
      message: {
        candidate:
          completionPercent > 50
            ? "Your incomplete submission was reviewed. We may request additional assessment."
            : "Your submission was incomplete. You may retake the assessment.",
        hr: `Assessment incomplete (${completionPercent}%). Reason: ${reason}. Recommend: ${
          completionPercent > 50 ? "Review partial data" : "Request retake"
        }`,
      },
    };
  },

  // 7. DUPLICATE SUBMISSION DETECTION
  handleDuplicateSubmission: async (candidateId, assessmentType) => {
    /*
    Real scenario: Candidate accidentally submits same answer twice
    Solution: Detect and prevent duplicate scoring
    */
    return {
      action: "DETECT_AND_DEDUPLICATE",
      detectionMethod: "HASH_COMPARISON",
      tolerance: 0.95, // 95% similarity = duplicate
      resolution: {
        ifDuplicate: "USE_FIRST_VALID_SUBMISSION",
        logDuplication: true,
        notifyCandidate: true,
        candidateMessage: "Duplicate submission detected and ignored. Using your earlier submission.",
      },
      tracking: {
        recordDuplicate: true,
        flag: false, // Don't flag as integrity issue
        reason: "TECHNICAL_DUPLICATE_NOT_CHEATING",
      },
    };
  },

  // 8. PROCTORING DATA LOSS
  handleProctorDataLoss: async (sessionId) => {
    /*
    Real scenario: Proctoring camera footage lost due to storage failure
    Solution: Fallback, don't lose assessment data, re-interview if needed
    */
    return {
      issue: "PROCTORING_FOOTAGE_UNAVAILABLE",
      assessmentData: "SAFE - Stored separately",
      action: "NOTIFY_HR",
      recommendation: {
        low_risk: "Accept assessment results, note absence of video",
        high_risk: "Request re-interview for high-stakes role",
        criterion: "Base on role importance and assessment score",
      },
      message: {
        candidate: "Video recording was not saved due to technical issue. Your answers are safe and will be reviewed.",
        hr: "Video footage lost for session {sessionId}. Assessment answers available. Recommend manual review of candidate.",
      },
    };
  },

  // 9. RESUME PARSING FAILURE
  handleResumeParsingFailure: async (resumeId, fileType) => {
    /*
    Real scenario: Resume OCR fails or PDF is image-only
    Solution: Mark for manual review, don't block progression
    */
    return {
      action: "FLAG_FOR_MANUAL_REVIEW",
      status: "PARSING_FAILED",
      reason: `Could not extract text from ${fileType}`,
      fallback: {
        step1: "Store original file",
        step2: "Flag for HR manual review",
        step3: "Send to QA team for OCR retry",
      },
      hrAction: {
        message: "Resume could not be auto-parsed. Please review manually.",
        process: "Download PDF, review, make manual notes in system",
        timeline: "Within 24 hours",
      },
      allowProgression: true,
      progressionNote: "Allow candidate to proceed while resume is being reviewed manually",
    };
  },

  // 10. SCORING MISMATCH DETECTION
  handleScoringMismatch: async (assessmentId, aiScore, manualScore) => {
    /*
    Real scenario: AI score (95) vs HR review (40) - major discrepancy
    Solution: Flag for investigation, don't use until resolved
    */
    const discrepancy = Math.abs(aiScore - manualScore);
    const discrepancyPercent = (discrepancy / Math.max(aiScore, manualScore)) * 100;

    if (discrepancyPercent > 30) {
      // >30% difference
      return {
        severity: "HIGH",
        action: "ESCALATE_AND_FREEZE",
        issue: "MAJOR_SCORE_DISCREPANCY",
        aiScore,
        manualScore,
        discrepancyPercent: discrepancyPercent.toFixed(2),
        frozenStatus: "PENDING_INVESTIGATION",
        investigationProcess: {
          step1: "AI team reviews scoring logic",
          step2: "HR manager reviews assessment data",
          step3: "Compare notes and reach consensus",
          step4: "Update score and close case",
        },
        timeline: "Within 48 hours",
        candidateNotification: "Your assessment is under review for accuracy. We'll finalize soon.",
      };
    }

    return {
      severity: "LOW",
      action: "LOG_VARIANCE",
      message: `Minor discrepancy (${discrepancyPercent.toFixed(2)}%). Using average score.`,
      finalScore: (aiScore + manualScore) / 2,
    };
  },
};

module.exports = EdgeCaseHandler;
