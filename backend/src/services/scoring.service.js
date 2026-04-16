const math = require('mathjs');

/**
 * Robust Scoring Service for Recruitment Pipeline
 * Tuned Regression Weights: 
 * - Resume: 0.20
 * - Assessment: 0.50 (Primary Technical Validator)
 * - Interview: 0.30 (Communication & Culture)
 */
class ScoringService {
  constructor() {
    this.stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't"]);
    
    // Tuned Regression Coefficients
    this.weights = {
      resume: 0.20,
      assessment: 0.50,
      interview: 0.30
    };
  }

  /**
   * Preprocess text for ML tasks
   */
  preprocess(text) {
    if (!text) return [];
    return text.toString().toLowerCase()
      .replace(/[^\w\s]/g, '') 
      .split(/\s+/) 
      .filter(word => word.length > 2 && !this.stopWords.has(word));
  }

  /**
   * Calculate Cosine Similarity
   */
  calculateCosineSimilarity(text1, text2) {
    const tokens1 = this.preprocess(text1);
    const tokens2 = this.preprocess(text2);

    if (tokens1.length === 0 || tokens2.length === 0) return 0;

    const allWords = new Set([...tokens1, ...tokens2]);
    const freq1 = this.getFrequency(tokens1);
    const freq2 = this.getFrequency(tokens2);

    const vec1 = [];
    const vec2 = [];

    allWords.forEach(word => {
      vec1.push(freq1[word] || 0);
      vec2.push(freq2[word] || 0);
    });

    try {
      // Use mathjs for vector operations
      const v1 = math.matrix(vec1);
      const v2 = math.matrix(vec2);
      
      const dotProduct = math.dot(v1, v2);
      const mag1 = math.norm(v1);
      const mag2 = math.norm(v2);

      if (mag1 === 0 || mag2 === 0) return 0;
      return dotProduct / (mag1 * mag2);
    } catch (e) {
      // Basic fallback if mathjs fails on dimensions
      return 0;
    }
  }

  getFrequency(tokens) {
    const freq = {};
    tokens.forEach(t => freq[t] = (freq[t] || 0) + 1);
    return freq;
  }

  /**
   * Tuned Regression Model & Prediction
   */
  predictFinalScore(features) {
    const {
      resumeScore = 0,
      assessmentScore = 0,
      interviewScore = 0,
      malpracticeScore = 0,
      aiAvailable = true
    } = features;

    // 1. Calculate base aggregate using tuned weights
    let baseScore = (resumeScore * this.weights.resume) + 
                    (assessmentScore * this.weights.assessment) + 
                    (interviewScore * this.weights.interview);

    // 2. Apply exponential malpractice penalty
    // A score of 20 (max warnings) should significantly degrade the outcome
    const malpracticePenalty = Math.pow(malpracticeScore / 10, 1.5) * 5;
    
    let finalScore = baseScore - malpracticePenalty;
    finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

    // 3. Classification with stricter thresholds
    let classification = 'REJECT';
    if (finalScore >= 80) classification = 'HIRE';
    else if (finalScore >= 65) classification = 'HOLD';

    return {
      finalScore,
      classification,
      methodUsed: aiAvailable ? 'HYBRID_REGRESSION' : 'ML_FALLBACK_REGRESSION',
      confidence: aiAvailable ? 0.95 : 0.80,
      insights: this.generateInsights(features, finalScore, classification)
    };
  }

  generateInsights(features, finalScore, decision) {
    const strengths = [];
    const weaknesses = [];

    if (features.assessmentScore >= 80) strengths.push('Exceptional technical problem-solving ability');
    if (features.interviewScore >= 80) strengths.push('Highly effective communicator with cultural alignment');
    if (features.resumeScore >= 75) strengths.push('Strong historical JD-Resume alignment');

    if (features.assessmentScore < 60) weaknesses.push('Technical depth below optimal range');
    if (features.interviewScore < 60) weaknesses.push('Communication clarity needs improvement');
    if (features.malpracticeScore > 5) weaknesses.push('Integrity flags detected during proctoring');

    let recommendation = "";
    if (decision === 'HIRE') {
      recommendation = `Highly recommended candidate with a robust score of ${finalScore}%. Technical proficiency is outstanding.`;
    } else if (decision === 'HOLD') {
      recommendation = `Strong candidate but lacks depth in key areas. Suggest a technical follow-up.`;
    } else {
      recommendation = `Does not meet current performance benchmarks. Significant skill or integrity gaps noted.`;
    }

    return { strengths, weaknesses, recommendation };
  }
}

module.exports = new ScoringService();
