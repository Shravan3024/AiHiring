const SCORE_WEIGHTS = {
  resume: 0.3,
  technical: 0.4,
  interview: 0.3,
};

const STATUS_GROUPS = {
  active: [
    'APPLIED',
    'RESUME_SUBMITTED',
    'RESUME_EVALUATED',
    'ASSESSMENT_UNLOCKED',
    'TECHNICAL_ROUND_PENDING',
    'TECHNICAL_ROUND_IN_PROGRESS',
    'TECHNICAL_ROUND_COMPLETED',
    'INTERVIEW_UNLOCKED',
    'INTERVIEW_SCHEDULED',
    'INTERVIEW_IN_PROGRESS',
    'INTERVIEW_COMPLETED',
    'RE_INTERVIEW_REQUESTED',
    'HR_REVIEW',
    'PROCEED_TO_HR',
    'RECOMMENDED_BY_AI',
    'SELECTED',
    'OFFERED',
  ],
  pendingReview: ['HR_REVIEW', 'PROCEED_TO_HR'],
  shortlisted: ['RECOMMENDED_BY_AI', 'SELECTED', 'OFFERED', 'HIRED'],
  rejected: ['REJECTED', 'AUTO_REJECTED', 'OFFER_REJECTED', 'REJECTED_BY_CANDIDATE'],
  pipeline: [
    'APPLIED',
    'RESUME_SUBMITTED',
    'RESUME_EVALUATED',
    'ASSESSMENT_UNLOCKED',
    'TECHNICAL_ROUND_PENDING',
    'TECHNICAL_ROUND_IN_PROGRESS',
    'TECHNICAL_ROUND_COMPLETED',
    'INTERVIEW_UNLOCKED',
    'INTERVIEW_SCHEDULED',
    'INTERVIEW_IN_PROGRESS',
    'INTERVIEW_COMPLETED',
    'RE_INTERVIEW_REQUESTED',
    'HR_REVIEW',
    'PROCEED_TO_HR',
    'RECOMMENDED_BY_AI',
    'SELECTED',
    'OFFERED',
  ],
  funnel: [
    { key: 'Applied', statuses: ['APPLIED', 'RESUME_SUBMITTED'] },
    { key: 'Resume Cleared', statuses: ['RESUME_EVALUATED', 'ASSESSMENT_UNLOCKED'] },
    { key: 'Technical Round', statuses: ['TECHNICAL_ROUND_PENDING', 'TECHNICAL_ROUND_IN_PROGRESS', 'TECHNICAL_ROUND_COMPLETED'] },
    { key: 'Interview', statuses: ['INTERVIEW_UNLOCKED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_IN_PROGRESS', 'INTERVIEW_COMPLETED', 'RE_INTERVIEW_REQUESTED'] },
    { key: 'HR Review', statuses: ['HR_REVIEW', 'PROCEED_TO_HR'] },
    { key: 'Selected', statuses: ['RECOMMENDED_BY_AI', 'SELECTED', 'OFFERED', 'HIRED'] },
  ],
};

function isValidScore(value) {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

function computeApplicationScore({
  overallScore,
  resumeScore,
  technicalScore,
  interviewScore,
  malpracticeWarnings = 0
}) {
  if (typeof overallScore === 'number' && !Number.isNaN(overallScore) && overallScore > 0) {
    return Math.round(overallScore);
  }

  const weightedParts = [
    ['resume', resumeScore],
    ['technical', technicalScore],
    ['interview', interviewScore],
  ].filter(([, score]) => isValidScore(score));

  if (weightedParts.length === 0) return 0;

  const weightTotal = weightedParts.reduce((sum, [key]) => sum + SCORE_WEIGHTS[key], 0);
  const weightedScore = weightedParts.reduce(
    (sum, [key, score]) => sum + (score * SCORE_WEIGHTS[key]),
    0
  );

  let finalScore = Math.round(weightedScore / weightTotal);

  // Apply integrity penalty: -5 points per warning, max -25
  const integrityPenalty = Math.min(malpracticeWarnings * 5, 25);
  finalScore = Math.max(0, finalScore - integrityPenalty);

  return finalScore;
}

function getFitBand(score) {
  if (score >= 80) return 'high_fit';
  if (score >= 60) return 'avg_fit';
  return 'low_fit';
}

module.exports = {
  STATUS_GROUPS,
  computeApplicationScore,
  getFitBand,
};
