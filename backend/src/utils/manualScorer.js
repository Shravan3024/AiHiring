/**
 * Manual Scoring Engine
 * Acts as a backup when AI services are unavailable
 * Uses keyword mapping and semantic matching logic
 */

const logger = require('./logger');

/**
 * Normalizes text for better matching
 */
const normalize = (text) => {
  if (!text) return "";
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
};

const KEYWORD_GROUPS = {
  technical: ["javascript", "python", "react", "node", "aws", "docker", "kubernetes", "sql", "performance", "scaling", "architecture", "security", "git", "ci/cd", "agile", "rest api", "testing", "algorithms", "data structures"],
  soft_skills: ["leadership", "communication", "teamwork", "problem solving", "analytical", "management", "mentoring", "presentation", "writing", "collaboration"],
  experience: ["senior", "lead", "architect", "manager", "director", "expert", "specialist", "principal"]
};

/**
 * Scores a resume based on ManualJobMapping or generic JD match
 */
exports.scoreResume = (parsedData, mapping = {}) => {
  try {
    let score = 0;
    const pros = [];
    const cons = [];
    
    const candidateSkills = (parsedData.skills?.technical || []).concat(parsedData.skills?.tools || []).map(s => normalize(s));
    const resumeText = normalize(JSON.stringify(parsedData));

    // 1. Required Skills (40%) - If mapping is missing, use technical keyword frequency
    const required = mapping.requiredSkills || KEYWORD_GROUPS.technical.slice(0, 5);
    let matchedCount = 0;
    required.forEach(skill => {
      const normSkill = normalize(skill);
      if (candidateSkills.some(s => s.includes(normSkill)) || resumeText.includes(normSkill)) {
        matchedCount++;
        pros.push(`Matched core skill: ${skill}`);
      } else {
        cons.push(`Unverified requirement: ${skill}`);
      }
    });
    score += (matchedCount / Math.max(required.length, 1)) * 40;

    // 2. Experience (30%)
    const expYears = parsedData.total_years_experience || 0;
    const minExp = mapping.minExperience || 2;
    if (expYears >= minExp) {
      score += 30;
      pros.push(`Experience (${expYears}y) meets benchmark (${minExp}y)`);
    } else {
      score += (expYears / Math.max(minExp, 1)) * 30;
      cons.push(`Minimal experience depth identified`);
    }

    // 3. NLP Insight / Key Term Frequency (30%)
    let nlpHits = 0;
    KEYWORD_GROUPS.technical.forEach(kw => { if (resumeText.includes(kw)) nlpHits++; });
    KEYWORD_GROUPS.soft_skills.forEach(kw => { if (resumeText.includes(kw)) nlpHits++; });
    
    const nlpScore = Math.min((nlpHits / 10) * 30, 30);
    score += nlpScore;
    if (nlpHits > 5) pros.push("Rich professional vocabulary used in profile");

    return {
      score: Math.min(Math.round(score), 100),
      pros: pros.slice(0, 5),
      cons: cons.slice(0, 5),
      method: "SYSTEM_MAPPING_NLP_BACKUP"
    };
  } catch (error) {
    logger.error("Manual resume scoring error:", error);
    return { score: 50, pros: ["System evaluation backup"], cons: [], method: "FALLBACK_DEFAULT" };
  }
};

/**
 * Scores technical assessment answers
 */
exports.scoreTechnical = (responses, mappingKeywords = {}) => {
  try {
    let totalScore = 0;
    const feedback = [];
    
    responses.forEach(resp => {
      const candidateAns = normalize(resp.answer);
      // Fallback for keywords if missing
      const expectedKeywords = mappingKeywords[resp.questionId] || KEYWORD_GROUPS.technical;
      
      let matchCount = 0;
      expectedKeywords.forEach(kw => {
        if (candidateAns.includes(normalize(kw))) matchCount++;
      });

      const qScore = expectedKeywords.length > 0 ? (matchCount / Math.min(expectedKeywords.length, 10)) * 100 : 50;
      totalScore += Math.min(qScore, 100);
      
      if (qScore > 60) feedback.push(`Detected technical relevance in ${resp.topic || 'responses'}`);
    });

    const finalScore = responses.length > 0 ? totalScore / responses.length : 0;

    return {
      score: Math.round(finalScore),
      feedback: feedback.slice(0, 5),
      method: "NLP_KEYWORD_TECHNICAL_BACKUP"
    };
  } catch (error) {
    logger.error("Manual technical scoring error:", error);
    return { score: 50, feedback: ["Baseline technical scoring"], method: "FALLBACK_DEFAULT" };
  }
};

/**
 * Scores interview transcripts with sentiment & clarity mapping
 */
exports.scoreInterview = (transcript, mapping = {}) => {
  try {
    const normTranscript = normalize(transcript);
    if (!normTranscript) return { score: 0, recommendation: "review", method: "EMPTY_TRANSCRIPT" };

    let pos = 0;
    let neg = 0;
    let prof = 0;
    
    const positive = ["understand", "experience", "implemented", "successful", "solution", "learned", "team", "managed", "delivered"];
    const negative = ["confused", "forgot", "stuck", "failure", "don't know", "unable", "difficult", "unsure"];
    const professional = ["agile", "stakeholders", "production", "optimization", "collaboration", "architecture", "requirements"];

    positive.forEach(kw => { if (normTranscript.includes(kw)) pos++; });
    negative.forEach(kw => { if (normTranscript.includes(kw)) neg++; });
    professional.forEach(kw => { if (normTranscript.includes(kw)) prof++; });

    const sentimentScore = Math.min(Math.max((pos - neg + prof) * 8 + 40, 0), 100);

    return {
      score: sentimentScore,
      recommendation: sentimentScore > 75 ? "strong_yes" : (sentimentScore > 45 ? "maybe" : "no"),
      pros: pos > 3 ? ["Positive professional sentiment detected", "Clear articulation of past work"] : ["Basic communication observed"],
      cons: neg > 2 ? ["Significant hesitation or gaps in knowledge"] : [],
      method: "SENTIMENT_NLP_BACKUP"
    };
  } catch (error) {
    return { score: 50, recommendation: "maybe", method: "FALLBACK_DEFAULT" };
  }
};
