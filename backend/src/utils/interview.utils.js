/**
 * Interview Analysis & Utilities - Phase 5
 * Sentiment analysis, scoring, keyword extraction
 */

// ==================== SENTIMENT ANALYSIS ====================

class SentimentAnalyzer {
  constructor() {
    this.positiveWords = [
      'excellent', 'great', 'amazing', 'wonderful', 'outstanding', 'fantastic',
      'impressive', 'love', 'passionate', 'enthusiastic', 'confident',
      'skilled', 'experienced', 'brilliant', 'innovative', 'creative'
    ];

    this.negativeWords = [
      'bad', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated',
      'confused', 'unsure', 'weak', 'difficult', 'problem', 'issue',
      'challenge', 'struggle', 'failed', 'mistake'
    ];

    this.fillerWords = [
      'um', 'uh', 'like', 'you know', 'basically', 'actually',
      'literally', 'so', 'just', 'kind of', 'sort of', 'i guess'
    ];
  }

  /**
   * Analyze sentiment of interview response (0-1 scale)
   */
  analyze(text) {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);

    let positiveScore = 0;
    let negativeScore = 0;

    words.forEach(word => {
      if (this.positiveWords.includes(word)) positiveScore++;
      if (this.negativeWords.includes(word)) negativeScore++;
    });

    // Calculate final sentiment (0-1)
    const totalScore = positiveScore + negativeScore;
    if (totalScore === 0) return 0.5; // Neutral

    const sentiment = positiveScore / (positiveScore + negativeScore);
    return Math.round(sentiment * 100) / 100;
  }

  /**
   * Get sentiment classification
   */
  getSentimentClass(score) {
    if (score >= 0.7) return 'VERY_POSITIVE';
    if (score >= 0.55) return 'POSITIVE';
    if (score >= 0.45) return 'NEUTRAL';
    if (score >= 0.3) return 'NEGATIVE';
    return 'VERY_NEGATIVE';
  }

  /**
   * Count filler words
   */
  countFillerWords(text) {
    let count = 0;
    const lowerText = text.toLowerCase();
    
    this.fillerWords.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'g');
      count += (lowerText.match(regex) || []).length;
    });

    return count;
  }

  /**
   * Filler word ratio (lower is better)
   */
  getFillerWordRatio(text) {
    const fillerCount = this.countFillerWords(text);
    const totalWords = text.split(/\s+/).length;
    return Math.round((fillerCount / totalWords) * 100) / 100;
  }
}

// ==================== CONFIDENCE SCORING ====================

class ConfidenceScorer {
  /**
   * Calculate confidence based on response characteristics
   */
  score(text, duration) {
    let confidence = 0.5; // Start at neutral

    // Duration confidence (longer = more confident)
    if (duration >= 30 && duration <= 180) {
      confidence += 0.2; // Optimal range
    } else if (duration >= 15 && duration <= 240) {
      confidence += 0.1; // Acceptable range
    } else {
      confidence -= 0.1; // Too short or too long
    }

    // Response completeness
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    const words = text.split(/\s+/).length;

    if (sentences >= 3) {
      confidence += 0.15; // Well-structured answer
    } else if (sentences >= 1) {
      confidence += 0.05;
    } else {
      confidence -= 0.1; // Too fragmented
    }

    // Word count confidence
    if (words >= 100) {
      confidence += 0.1;
    } else if (words >= 50) {
      confidence += 0.05;
    } else if (words < 20) {
      confidence -= 0.15;
    }

    // Specific/concrete examples
    if (this.hasConcreteExamples(text)) {
      confidence += 0.2;
    }

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  /**
   * Detect concrete examples or specifics in answer
   */
  hasConcreteExamples(text) {
    const patterns = [
      /implemented|built|created|developed|designed/gi,
      /\d+/g, // Numbers
      /project|system|application|website/gi,
      /reduced|improved|increased|optimized/gi
    ];

    return patterns.some(pattern => text.match(pattern));
  }
}

// ==================== CLARITY ANALYSIS ====================

class ClarityAnalyzer {
  /**
   * Analyze response clarity (0-1)
   */
  analyze(text) {
    let clarity = 0.5;

    // Sentence length analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const avgWordsPerSentence = text.split(/\s+/).length / sentences.length;

    // Ideal sentence: 12-18 words
    if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 18) {
      clarity += 0.2;
    } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) {
      clarity += 0.1;
    } else if (avgWordsPerSentence > 25) {
      clarity -= 0.1; // Too complex
    }

    // Vocabulary complexity (simple is better for clarity)
    const complexWords = this.countComplexWords(text);
    const complexRatio = complexWords / (text.split(/\s+/).length || 1);

    if (complexRatio < 0.15) {
      clarity += 0.15; // Simple, clear language
    } else if (complexRatio > 0.4) {
      clarity -= 0.1; // Too complex/academic
    }

    // Coherence (keywords related to question)
    if (this.hasTopicalCoherence(text)) {
      clarity += 0.15;
    }

    return Math.max(0.1, Math.min(0.95, clarity));
  }

  /**
   * Count words that are complex (>10 characters, technical terms)
   */
  countComplexWords(text) {
    const words = text.split(/\s+/);
    return words.filter(word => word.length > 10).length;
  }

  /**
   * Check if answer is topically coherent
   */
  hasTopicalCoherence(text) {
    // Keywords that indicate structured, coherent answers
    const coherenceMarkers = [
      /first|second|third|next|then|finally|in conclusion/gi,
      /because|therefore|thus|as a result|consequently/gi,
      /specifically|for example|for instance|such as/gi
    ];

    return coherenceMarkers.some(marker => text.match(marker));
  }
}

// ==================== RELEVANCE DETECTOR ====================

class RelevanceDetector {
  /**
   * Detect if response is relevant to question
   */
  analyze(response, questionContext) {
    // Extract key terms from question
    const questionTerms = this.extractKeyTerms(questionContext);
    const responseTerms = this.extractKeyTerms(response);

    // Calculate overlap
    const matchingTerms = questionTerms.filter(term => 
      responseTerms.some(rTerm => rTerm.includes(term) || term.includes(rTerm))
    );

    const relevance = matchingTerms.length / (questionTerms.length || 1);
    return Math.round(Math.min(1, relevance) * 100) / 100;
  }

  /**
   * Extract key terms from text
   */
  extractKeyTerms(text) {
    // Remove common words
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'is', 'are', 'was', 'were'
    ];

    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => {
        const cleaned = word.replace(/[^a-z0-9]/g, '');
        return cleaned.length > 4 && !stopWords.includes(cleaned);
      })
      .slice(0, 20); // Top 20 terms
  }
}

// ==================== KEYWORD EXTRACTION ====================

class KeywordExtractor {
  /**
   * Extract important keywords from response
   */
  extract(text, questionContext = '') {
    const allText = text + ' ' + questionContext;
    const words = allText.toLowerCase().split(/\s+/);

    // Technical keywords
    const technicalKeywords = [
      'api', 'database', 'microservices', 'kubernetes', 'docker', 'aws', 'cloud',
      'machine learning', 'ai', 'sql', 'nosql', 'react', 'node.js', 'python',
      'javascript', 'java', 'golang', 'scalability', 'performance', 'security',
      'optimization', 'architecture', 'design pattern', 'rest', 'graphql'
    ];

    // Soft skills keywords
    const softSkillsKeywords = [
      'leadership', 'communication', 'teamwork', 'collaboration', 'problem-solving',
      'creativity', 'innovation', 'accountability', 'responsibility', 'adaptability',
      'initiative', 'motivation', 'customer-focused', 'agile'
    ];

    const foundTechnical = this.findKeywords(allText, technicalKeywords);
    const foundSoft = this.findKeywords(allText, softSkillsKeywords);

    return {
      technical: foundTechnical,
      soft_skills: foundSoft,
      all: [...foundTechnical, ...foundSoft]
    };
  }

  /**
   * Find keywords in text
   */
  findKeywords(text, keywords) {
    const lowerText = text.toLowerCase();
    return keywords.filter(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return lowerText.match(regex);
    });
  }
}

// ==================== OVERALL SCORE CALCULATION ====================

class InterviewScorer {
  constructor() {
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.confidenceScorer = new ConfidenceScorer();
    this.clarityAnalyzer = new ClarityAnalyzer();
    this.relevanceDetector = new RelevanceDetector();
    this.keywordExtractor = new KeywordExtractor();
  }

  /**
   * Calculate comprehensive interview score
   */
  calculateScore(response, duration, questionContext) {
    const sentiment = this.sentimentAnalyzer.analyze(response);
    const confidence = this.confidenceScorer.score(response, duration);
    const clarity = this.clarityAnalyzer.analyze(response);
    const relevance = this.relevanceDetector.analyze(response, questionContext);

    // Weighted average
    const score = (
      sentiment * 0.20 +     // 20% - Positive sentiment
      confidence * 0.25 +    // 25% - Confidence level
      clarity * 0.25 +       // 25% - Clarity of response
      relevance * 0.30       // 30% - Relevance to question
    ) * 100;

    return Math.round(score);
  }

  /**
   * Get detailed analysis report
   */
  getDetailedReport(response, duration, questionContext) {
    const sentiment = this.sentimentAnalyzer.analyze(response);
    const sentimentClass = this.sentimentAnalyzer.getSentimentClass(sentiment);
    const confidence = this.confidenceScorer.score(response, duration);
    const clarity = this.clarityAnalyzer.analyze(response);
    const relevance = this.relevanceDetector.analyze(response, questionContext);
    const keywords = this.keywordExtractor.extract(response, questionContext);
    const fillerRatio = this.sentimentAnalyzer.getFillerWordRatio(response);

    return {
      overall_score: this.calculateScore(response, duration, questionContext),
      components: {
        sentiment: {
          score: Math.round(sentiment * 100),
          classification: sentimentClass
        },
        confidence: {
          score: Math.round(confidence * 100),
          level: confidence > 0.7 ? 'HIGH' : confidence > 0.5 ? 'MEDIUM' : 'LOW'
        },
        clarity: {
          score: Math.round(clarity * 100),
          level: clarity > 0.7 ? 'CLEAR' : clarity > 0.5 ? 'MODERATE' : 'UNCLEAR'
        },
        relevance: {
          score: Math.round(relevance * 100),
          on_topic: relevance > 0.6
        }
      },
      metrics: {
        duration_seconds: duration,
        word_count: response.split(/\s+/).length,
        sentence_count: response.split(/[.!?]+/).filter(s => s.trim()).length,
        filler_word_ratio: Math.round(fillerRatio * 100) / 100
      },
      keywords: keywords,
      strengths: this.getStrengths(sentiment, confidence, clarity, relevance),
      areas_for_improvement: this.getImprovementAreas(sentiment, confidence, clarity, relevance)
    };
  }

  /**
   * Identify response strengths
   */
  getStrengths(sentiment, confidence, clarity, relevance) {
    const strengths = [];

    if (sentiment > 0.65) strengths.push('Strong positive sentiment and enthusiasm');
    if (confidence > 0.75) strengths.push('High confidence in responses');
    if (clarity > 0.75) strengths.push('Clear and well-articulated answers');
    if (relevance > 0.8) strengths.push('Highly relevant and focused responses');

    return strengths.length > 0 ? strengths : ['Generally adequate responses'];
  }

  /**
   * Identify areas for improvement
   */
  getImprovementAreas(sentiment, confidence, clarity, relevance) {
    const improvements = [];

    if (sentiment < 0.5) improvements.push('Work on demonstrating more positive attitude and enthusiasm');
    if (confidence < 0.6) improvements.push('Build more confidence in technical knowledge');
    if (clarity < 0.6) improvements.push('Practice articulating ideas more clearly and concisely');
    if (relevance < 0.7) improvements.push('Focus on directly addressing the questions asked');

    return improvements.length > 0 ? improvements : ['Continue strong performance'];
  }
}

// ==================== EXPORTS ====================

module.exports = {
  SentimentAnalyzer,
  ConfidenceScorer,
  ClarityAnalyzer,
  RelevanceDetector,
  KeywordExtractor,
  InterviewScorer
};
