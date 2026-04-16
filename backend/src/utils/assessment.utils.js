/**
 * Assessment Utilities
 * Scoring algorithms, anti-cheating detection, and analytics
 */

// ==================== SCORING ALGORITHMS ====================

/**
 * Calculate assessment score with multiple grading strategies
 */
class ScoringEngine {
  constructor() {
    this.TOTAL_POINTS = 100;
    this.POINTS_PER_QUESTION = 10;
  }

  /**
   * Simple: Correct/Total * 100
   */
  simpleScore(correctCount, totalQuestions) {
    return Math.round((correctCount / totalQuestions) * this.TOTAL_POINTS);
  }

  /**
   * Difficulty-weighted: More points for harder questions
   */
  difficultyWeightedScore(answers, questions) {
    const weights = {
      EASY: 1,
      MEDIUM: 1.5,
      HARD: 2
    };

    let totalWeight = 0;
    let earnedWeight = 0;

    questions.forEach(q => {
      const weight = weights[q.difficulty] || 1;
      const answer = answers[q.id];
      totalWeight += weight;

      if (answer?.selected_option === q.correct) {
        earnedWeight += weight;
      }
    });

    return Math.round((earnedWeight / totalWeight) * this.TOTAL_POINTS);
  }

  /**
   * Time-adjusted: Deduct points for slow answers
   */
  timeAdjustedScore(answers, questions, timeLimit) {
    let score = this.simpleScore(
      Object.values(answers).filter((a, idx) => {
        const q = questions[idx];
        return a?.selected_option === q?.correct;
      }).length,
      questions.length
    );

    // Deduct 5 points for each minute over average time
    const averageTimePerQuestion = timeLimit / questions.length;
    Object.values(answers).forEach(answer => {
      if (answer.time_spent > averageTimePerQuestion * 2) {
        score -= 5;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Consistency score: Award bonus for consistent correct answers
   */
  consistencyBonus(answers, questions) {
    const categoryScores = {};

    Object.entries(answers).forEach(([qId, answer]) => {
      const q = questions.find(q => q.id === parseInt(qId));
      if (!q) return;

      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { correct: 0, total: 0 };
      }
      categoryScores[q.category].total++;
      if (answer.selected_option === q.correct) {
        categoryScores[q.category].correct++;
      }
    });

    // Category with 100% accuracy gets bonus
    let bonus = 0;
    Object.values(categoryScores).forEach(score => {
      if (score.total > 0 && score.correct === score.total) {
        bonus += 5;
      }
    });

    return Math.min(10, bonus); // Max 10 point bonus
  }

  /**
   * Percentile ranking (based on historical data)
   */
  calculatePercentile(score, historicalScores) {
    const belowScore = historicalScores.filter(s => s < score).length;
    return Math.round((belowScore / historicalScores.length) * 100);
  }
}

// ==================== ANTI-CHEATING DETECTION ====================

class AntiCheatAnalyzer {
  /**
   * Calculate overall risk level
   */
  calculateRiskScore(antiCheatData) {
    let riskScore = 0;

    // Tab switches (0-20 points)
    if (antiCheatData.tab_switches > 0) {
      riskScore += Math.min(20, antiCheatData.tab_switches * 2);
    }

    // Copy attempts (0-25 points)
    if (antiCheatData.copy_attempts > 0) {
      riskScore += Math.min(25, antiCheatData.copy_attempts * 5);
    }

    // Paste attempts (0-25 points)
    if (antiCheatData.paste_attempts > 0) {
      riskScore += Math.min(25, antiCheatData.paste_attempts * 5);
    }

    // Fullscreen exits (0-15 points)
    if (antiCheatData.fullscreen_exits > 0) {
      riskScore += Math.min(15, antiCheatData.fullscreen_exits * 3);
    }

    // DevTools access (0-15 points)
    if (antiCheatData.devtools_opens > 0) {
      riskScore += Math.min(15, antiCheatData.devtools_opens * 10);
    }

    // Unusual activity pattern (0-20 points)
    if (antiCheatData.unusual_activity?.length > 0) {
      riskScore += Math.min(20, antiCheatData.unusual_activity.length * 5);
    }

    return Math.min(100, riskScore);
  }

  /**
   * Get risk level classification
   */
  getRiskLevel(riskScore) {
    if (riskScore >= 70) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Flag suspicious patterns
   */
  detectAnomalies(antiCheatData, answers, timeData) {
    const anomalies = [];

    // Multiple rapid tab switches
    if (antiCheatData.tab_switches > 10) {
      anomalies.push({
        type: 'EXCESSIVE_TAB_SWITCHING',
        severity: 'HIGH',
        message: 'Excessive tab switching detected'
      });
    }

    // Copy/paste during test
    if (antiCheatData.copy_attempts > 2 || antiCheatData.paste_attempts > 2) {
      anomalies.push({
        type: 'COPY_PASTE_USAGE',
        severity: 'HIGH',
        message: 'Copy/paste activity detected during assessment'
      });
    }

    // Fullscreen exits
    if (antiCheatData.fullscreen_exits > 3) {
      anomalies.push({
        type: 'FULLSCREEN_EXITS',
        severity: 'MEDIUM',
        message: 'Candidate exited fullscreen multiple times'
      });
    }

    // Very fast answers (suspicious)
    const fastAnswers = Object.values(answers).filter(a => a.time_spent < 3000).length;
    if (fastAnswers > answers.length * 0.5) {
      anomalies.push({
        type: 'SUSPICIOUSLY_FAST_ANSWERS',
        severity: 'MEDIUM',
        message: 'More than 50% of answers completed in less than 3 seconds'
      });
    }

    // Very slow answers (disengagement)
    const slowAnswers = Object.values(answers).filter(a => a.time_spent > 120000).length;
    if (slowAnswers > answers.length * 0.3) {
      anomalies.push({
        type: 'DISENGAGEMENT_PATTERN',
        severity: 'LOW',
        message: 'Extended time spent on answers suggests disengagement'
      });
    }

    // DevTools access
    if (antiCheatData.devtools_opens > 0) {
      anomalies.push({
        type: 'DEVELOPER_TOOLS_ACCESS',
        severity: 'HIGH',
        message: 'Developer tools were accessed during assessment'
      });
    }

    return anomalies;
  }

  /**
   * Check if assessment should be marked for review
   */
  shouldFlagForReview(antiCheatData, score, avgScore) {
    const riskScore = this.calculateRiskScore(antiCheatData);
    const riskLevel = this.getRiskLevel(riskScore);

    // High risk + high score = likely cheating
    if (riskLevel === 'HIGH' && score > avgScore + 30) {
      return {
        flag: true,
        reason: 'High risk score combined with significantly above-average performance',
        priority: 'HIGH'
      };
    }

    // Medium risk + high score = review
    if (riskLevel === 'MEDIUM' && score > avgScore + 20) {
      return {
        flag: true,
        reason: 'Medium risk score with above-average performance',
        priority: 'MEDIUM'
      };
    }

    // High risk alone
    if (riskLevel === 'HIGH') {
      return {
        flag: true,
        reason: 'High risk indicators detected',
        priority: 'MEDIUM'
      };
    }

    return { flag: false, reason: null, priority: null };
  }
}

// ==================== PERFORMANCE ANALYTICS ====================

class PerformanceAnalytics {
  /**
   * Calculate percentile ranking
   */
  static calculatePercentile(score, allScores) {
    const belowScore = allScores.filter(s => s < score).length;
    return Math.round((belowScore / allScores.length) * 100);
  }

  /**
   * Get score distribution stats
   */
  static getScoreStats(scores) {
    const sorted = [...scores].sort((a, b) => a - b);
    const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const stdev = Math.sqrt(
      sorted.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / sorted.length
    );

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: Math.round(mean),
      median: Math.round(median),
      stdev: Math.round(stdev),
      q1: sorted[Math.floor(sorted.length * 0.25)],
      q3: sorted[Math.floor(sorted.length * 0.75)]
    };
  }

  /**
   * Category-wise performance breakdown
   */
  static getCategoryAnalysis(categoryScores) {
    const analysis = {};
    for (const [category, score] of Object.entries(categoryScores)) {
      analysis[category] = {
        percentage: Math.round(score.percentage),
        correct: score.correct,
        total: score.total,
        strength: score.percentage >= 80 ? 'STRONG' : score.percentage >= 60 ? 'GOOD' : 'WEAK'
      };
    }
    return analysis;
  }

  /**
   * Difficulty analysis
   */
  static getDifficultyAnalysis(answers, questions) {
    const byDifficulty = { EASY: [], MEDIUM: [], HARD: [] };

    Object.entries(answers).forEach(([qId, answer]) => {
      const q = questions.find(q => q.id === parseInt(qId));
      if (q) {
        const isCorrect = answer.selected_option === q.correct;
        byDifficulty[q.difficulty].push(isCorrect ? 1 : 0);
      }
    });

    const analysis = {};
    for (const [difficulty, results] of Object.entries(byDifficulty)) {
      if (results.length > 0) {
        const accuracy = (results.reduce((a, b) => a + b, 0) / results.length) * 100;
        analysis[difficulty] = {
          accuracy: Math.round(accuracy),
          attempted: results.length
        };
      }
    }

    return analysis;
  }

  /**
   * Time management analysis
   */
  static getTimeAnalysis(answers, totalTimeMs) {
    const timesPerQuestion = Object.values(answers).map(a => a.time_spent || 0);
    const avgTime = timesPerQuestion.reduce((a, b) => a + b, 0) / timesPerQuestion.length;

    return {
      total_time_seconds: Math.round(totalTimeMs / 1000),
      avg_time_per_question_seconds: Math.round(avgTime / 1000),
      min_time_seconds: Math.round(Math.min(...timesPerQuestion) / 1000),
      max_time_seconds: Math.round(Math.max(...timesPerQuestion) / 1000),
      pacing: avgTime < 30000 ? 'FAST' : avgTime < 60000 ? 'NORMAL' : 'SLOW'
    };
  }
}

// ==================== SCORING RECOMMENDATIONS ====================

class ScoringRecommendation {
  /**
   * Generate comprehensive score report
   */
  static generateReport(attempt, allAttempts, questions) {
    const basicScore = Math.round(
      (attempt.correct_answers / questions.length) * 100
    );
    const allScores = allAttempts.map(a => a.score);
    const percentile = PerformanceAnalytics.calculatePercentile(basicScore, allScores);
    const stats = PerformanceAnalytics.getScoreStats(allScores);

    return {
      score: basicScore,
      percentile,
      stats,
      assessment: this.getScoreAssessment(basicScore, percentile, stats),
      recommendations: this.getRecommendations(basicScore, percentile)
    };
  }

  /**
   * Assessment text based on performance
   */
  static getScoreAssessment(score, percentile, stats) {
    if (score >= 90) {
      return 'Outstanding performance - Exceptional mastery of the subject';
    }
    if (score >= 75) {
      return 'Strong performance - Good understanding with room for improvement';
    }
    if (score >= 60) {
      return 'Satisfactory performance - Adequate knowledge of the subject';
    }
    if (score >= 45) {
      return 'Below average performance - Significant gaps in understanding';
    }
    return 'Poor performance - Comprehensive review of material recommended';
  }

  /**
   * Recommendations for candidate improvement
   */
  static getRecommendations(score, percentile) {
    const recommendations = [];

    if (score < 60) {
      recommendations.push('Review core concepts in weak categories');
      recommendations.push('Study fundamentals before retaking the assessment');
    }

    if (percentile < 25) {
      recommendations.push('Consider additional practice and study materials');
    }

    if (score >= 60 && score < 80) {
      recommendations.push('Focus on areas where you scored below 70%');
      recommendations.push('Practice with sample questions in weak areas');
    }

    if (score >= 80) {
      recommendations.push('Excellent work! Consider challenging yourself with advanced topics');
    }

    return recommendations;
  }

  /**
   * Predict passing probability (based on score trend)
   */
  static predictNextAttempt(attemptScores) {
    if (attemptScores.length < 2) return null;

    const trend = attemptScores[attemptScores.length - 1] - attemptScores[0];
    const avgImprovement = trend / (attemptScores.length - 1);

    return {
      trend: trend > 0 ? 'IMPROVING' : trend < 0 ? 'DECLINING' : 'STABLE',
      avg_improvement: Math.round(avgImprovement),
      predicted_next_score: Math.round(attemptScores[attemptScores.length - 1] + avgImprovement)
    };
  }
}

// ==================== EXPORTS ====================

module.exports = {
  ScoringEngine,
  AntiCheatAnalyzer,
  PerformanceAnalytics,
  ScoringRecommendation
};
