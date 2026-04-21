const { 
  Job, 
  ManualJobMapping, 
  TechnicalQuestionBank, 
  InterviewQuestionBank,
  ResumeAnalysis,
  AssessmentAnalysis,
  InterviewAnalysis
} = require('../models');
const logger = require('../utils/logger');
const stringSimilarity = require('string-similarity');

/**
 * Optimized Manual Scoring Service for Targeted Job Roles
 * Specifically tuned for:
 * - MANAGEMENT_TRAINEE_MARKETING
 * - ASSISTANT_MANAGER_MARKETING
 * - EXECUTIVE_MARKETING
 * - RUBBER_PROCESS_ENGINEER
 */
class ManualScoringService {
  
  constructor() {
    // Specialized dictionaries for the 4 core roles
    this.roleGlossary = {
      'MARKETING': [
        'seo', 'sem', 'content creation', 'branding', 'market research', 
        'social media', 'lead generation', 'crm', 'campaign management', 
        'analytics', 'b2b', 'b2c', 'digital marketing', 'advertising'
      ],
      'RUBBER': [
        'polymer', 'vulcanization', 'synthetic rubber', 'extrusion', 
        'compounding', 'astm', 'iso standards', 'quality control', 
        'product development', 'chemical engineering', 'manufacturing',
        'rheology', 'tensile testing', 'molding'
      ],
      'MANAGEMENT': [
        'leadership', 'strategy', 'operations', 'project management', 
        'team coordination', 'stakeholder management', 'problem solving',
        'agile', 'kpi', 'reporting', 'process optimization'
      ]
    };

    this.educationLevel = {
      'phd': 100, 'doctorate': 100,
      'master': 90, 'mtech': 90, 'mba': 90, 'msc': 85,
      'btech': 80, 'be': 80, 'bachelor': 75, 'bsc': 70, 'bca': 70,
      'diploma': 50
    };

    // Specific mapping for the four job roles
    this.definedRoles = {
      'MANAGEMENT_TRAINEE_MARKETING': {
        primaryKeywords: this.roleGlossary['MARKETING'].concat(this.roleGlossary['MANAGEMENT']),
        preferredEdu: ['MBA', 'B.Com', 'BBA'],
        vitalSkills: ['market research', 'communication', 'analytics']
      },
      'ASSISTANT_MANAGER_MARKETING': {
        primaryKeywords: this.roleGlossary['MARKETING'].concat(this.roleGlossary['MANAGEMENT']),
        preferredEdu: ['MBA', 'Masters'],
        vitalSkills: ['strategy', 'team lead', 'campaign management']
      },
      'EXECUTIVE_MARKETING': {
        primaryKeywords: this.roleGlossary['MARKETING'],
        preferredEdu: ['B.Com', 'BBA', 'Digital Marketing'],
        vitalSkills: ['seo', 'content', 'social media']
      },
      'RUBBER_PROCESS_ENGINEER': {
        primaryKeywords: this.roleGlossary['RUBBER'],
        preferredEdu: ['B.Tech', 'BE', 'Chemical Engineering', 'Mechanical'],
        vitalSkills: ['vulcanization', 'compounding', 'quality control']
      }
    };
  }

  /**
   * Resume Manual Scorer
   */
  async scoreResumeManual(applicationId, jobId, parsedResumeData) {
    try {
      const job = await Job.findByPk(jobId, {
        include: [{ model: ManualJobMapping, as: 'manualMapping' }]
      });
      if (!job) throw new Error('Job not found');

      const roleKey = this._getStandardizedRoleKey(job.title);
      let mapping = job.manualMapping;
      
      if (!mapping) {
        mapping = await this._autoGeneratePerfectMapping(job, roleKey);
      }

      const scores = this._calculateRoleSpecificScores(parsedResumeData, mapping, roleKey);
      const insights = this._generateDeepRoleInsights(parsedResumeData, mapping, roleKey, scores);

      return {
        overall_fit_percentage: scores.totalScore,
        skills_match_percentage: scores.skillsScore,
        experience_match_percentage: scores.experienceScore,
        education_match_percentage: scores.educationScore,
        matched_skills: scores.matchedSkills,
        missing_skills: scores.missingSkills,
        strengths: insights.pros,
        weaknesses: insights.cons,
        is_manual_backup: true,
        method: `ROBUST_MAPPING_${roleKey}`
      };
    } catch (error) {
      logger.error('Error in robust manual resume scoring:', error);
      throw error;
    }
  }

  /**
   * Assessment Manual Scorer
   */
  async scoreAssessmentManual(applicationId, assessmentData) {
    try {
      const { answers } = assessmentData;
      if (!answers || !Array.isArray(answers)) return null;

      let scoreSum = 0;
      let weightSum = 0;
      let detailedResults = [];

      for (const ans of answers) {
        const question = await TechnicalQuestionBank.findByPk(ans.questionId);
        if (!question) continue;

        const weight = question.difficulty === 'HARD' ? 1.5 : (question.difficulty === 'MEDIUM' ? 1.0 : 0.7);
        let qScore = 0;

        if (question.questionType === 'MCQ') {
          const normalize = (s) => (s || '').toLowerCase().replace(/^[a-d]\)\s*/, '').trim();
          qScore = normalize(ans.answer) === normalize(question.correct_answer) ? 100 : 0;
        } else {
          // Robust keyword and similarity check
          const kwMatch = this._calculateKeywordMatch(ans.answer, question.keywords || []);
          const sim = stringSimilarity.compareTwoStrings((ans.answer || '').toLowerCase(), (question.expectedAnswer || '').toLowerCase());
          qScore = (kwMatch * 0.8 + sim * 0.2) * 100;
        }

        scoreSum += qScore * weight;
        weightSum += weight;

        detailedResults.push({
          questionId: ans.questionId,
          topic: question.topic,
          score: qScore,
          isManual: true
        });
      }

      const overall = weightSum > 0 ? scoreSum / weightSum : 0;
      return {
        overall_score: overall,
        detailed_results: detailedResults,
        strengths: this._summarizeBench(detailedResults, 'high'),
        weaknesses: this._summarizeBench(detailedResults, 'low'),
        is_manual_backup: true
      };
    } catch (error) {
      logger.error('Error in robust assessment scoring:', error);
      throw error;
    }
  }

  /**
   * Interview Manual Scorer
   */
  async scoreInterviewManual(applicationId, interviewData) {
    try {
      const { qa_pairs } = interviewData;
      if (!qa_pairs || !Array.isArray(qa_pairs)) return null;

      let total = 0;
      let count = 0;
      let performanceInsights = [];

      for (const qa of qa_pairs) {
        const bank = await InterviewQuestionBank.findAll({ limit: 200 });
        const matches = stringSimilarity.findBestMatch(qa.question, bank.map(b => b.question));
        const best = bank[matches.bestMatchIndex];

        let qaScore = 50;
        if (matches.bestMatch.rating > 0.4) {
          const kwScore = this._calculateKeywordMatch(qa.answer, best.keywords || []);
          const sim = stringSimilarity.compareTwoStrings(qa.answer || '', best.expectedAnswer || '');
          const quality = this._gaugeResponseQuality(qa.answer);
          qaScore = (kwScore * 0.6 + sim * 0.3 + quality * 0.1) * 100;
        }

        total += qaScore;
        count++;
        performanceInsights.push({ category: best?.category, score: qaScore });
      }

      const final = count > 0 ? total / count : 0;
      return {
        overall_score: final,
        strengths: performanceInsights.filter(p => p.score >= 70).map(p => `Strong technical grip on ${p.category}`),
        weaknesses: performanceInsights.filter(p => p.score < 40).map(p => `Could improve ${p.category} depth`),
        hire_recommendation: final >= 70 ? 'Strong Hire' : (final >= 50 ? 'Recommended' : 'Requires Review'),
        is_manual_backup: true
      };
    } catch (error) {
      logger.error('Error in robust interview scoring:', error);
      throw error;
    }
  }

  // ================= PRIVATE ROBUST HELPERS =================

  _getStandardizedRoleKey(title) {
    const t = title.toLowerCase();
    if (t.includes('assistant manager')) return 'ASSISTANT_MANAGER_MARKETING';
    if (t.includes('management trainee')) return 'MANAGEMENT_TRAINEE_MARKETING';
    if (t.includes('executive') || t.includes('marketing')) return 'EXECUTIVE_MARKETING';
    if (t.includes('rubber')) return 'RUBBER_PROCESS_ENGINEER';
    return 'EXECUTIVE_MARKETING'; // Default fallback
  }

  async _autoGeneratePerfectMapping(job, roleKey) {
    const roleDef = this.definedRoles[roleKey];
    logger.info(`Generatring advanced default mapping for ${roleKey}`);

    return await ManualJobMapping.create({
      jobId: job.id,
      jobRole: roleKey,
      requiredSkills: (job.required_skills && job.required_skills.length > 0) ? job.required_skills : roleDef.vitalSkills,
      preferredSkills: roleDef.primaryKeywords.slice(0, 10),
      requiredEducation: roleDef.preferredEdu,
      minExperience: job.min_experience || 0,
      mappingKeywords: {
        role_standard: roleKey,
        target_industry: roleKey.includes('RUBBER') ? 'Industrial' : 'Marketing'
      }
    });
  }

  _calculateRoleSpecificScores(data, mapping, roleKey) {
    const roleDef = this.definedRoles[roleKey];
    const candidateSkills = this._normalizeSkills(data.skills);
    
    // 1. Skill Match with domain awareness
    let matched = [];
    let missing = [];
    const targetSet = new Set(mapping.requiredSkills.map(s => s.toLowerCase()));
    
    targetSet.forEach(req => {
      const found = candidateSkills.some(cs => cs.includes(req) || req.includes(cs));
      if (found) matched.push(req);
      else missing.push(req);
    });

    const skillsScore = targetSet.size > 0 ? (matched.length / targetSet.size) * 100 : 100;

    // 2. Experience Match
    const candExp = parseFloat(data.total_years_experience || 0);
    const minExp = parseFloat(mapping.minExperience || 0);
    let expScore = minExp === 0 ? 100 : Math.min((candExp / minExp) * 100, 100);

    // 3. Education Tiering matched to role priority
    const candEdu = (data.education || []).map(e => (e.degree || '').toLowerCase());
    let eduScore = 70; // Baseline
    roleDef.preferredEdu.forEach(pref => {
      if (candEdu.some(c => c.includes(pref.toLowerCase()))) eduScore = 100;
    });

    const weightedScore = (skillsScore * 0.5) + (expScore * 0.3) + (eduScore * 0.2);
    return { totalScore: weightedScore, skillsScore, experienceScore: expScore, educationScore: eduScore, matchedSkills: matched, missingSkills: missing };
  }

  _generateDeepRoleInsights(data, mapping, roleKey, scores) {
    const pros = [];
    const cons = [];
    
    if (scores.skillsScore >= 80) pros.push(`Highly aligned with ${roleKey} core competencies`);
    if (scores.educationScore === 100) pros.push(`Possesses ideal academic background for this position`);
    if (scores.experienceScore >= 80) pros.push(`Substantial relevant experience in ${roleKey.split('_').join(' ')}`);
    if (scores.skillsScore >= 60) pros.push(`Demonstrated proficiency in multiple key technical areas`);
    if (data.certifications && data.certifications.length > 0) pros.push(`Verified professional certifications enhance profile credibility`);

    if (scores.experienceScore < 60) cons.push(`Experience level is below threshold for ${roleKey}`);
    if (scores.skillsScore < 40) cons.push(`Significant skill gaps identified relative to ${roleKey} requirements`);
    if (scores.educationScore < 60) cons.push(`Educational background may not perfectly align with specialized requirements`);
    if (scores.skillsScore < 60) cons.push(`Technical depth in niche areas could be further developed`);
    if (scores.totalScore < 50) cons.push(`Overall profile matching score indicates need for fundamental training`);

    // Helper to pad list to 5 items
    const padTo5 = (items, fallbackItems) => {
        let result = [...items];
        let i = 0;
        while (result.length < 5 && i < fallbackItems.length) {
            if (!result.includes(fallbackItems[i])) {
                result.push(fallbackItems[i]);
            }
            i++;
        }
        // Last resort generic fallbacks
        const generic = [
            "Analytical approach and methodology",
            "Professional documentation standards",
            "Industry standard process awareness",
            "Commitment to professional development",
            "Communication within cross-functional teams"
        ];
        let j = 0;
        while (result.length < 5) {
            result.push(generic[j % generic.length]);
            j++;
        }
        return result.slice(0, 5);
    };

    const rolePros = this.definedRoles[roleKey]?.vitalSkills.map(s => `Potential for mastery in ${s}`) || [];
    const roleCons = ["Domain specific complexity assessment recommended", "Needs exposure to large scale projects", "Verify practical application of core skills"];

    return { 
        pros: padTo5(pros, rolePros), 
        cons: padTo5(cons, roleCons) 
    };
  }

  _calculateKeywordMatch(text, keywords) {
    if (!keywords || keywords.length === 0) return 0.5;
    const cleanText = (text || '').toLowerCase();
    const hits = keywords.filter(kw => cleanText.includes(kw.toLowerCase()));
    return hits.length / keywords.length;
  }

  _gaugeResponseQuality(text) {
    if (!text) return 0;
    const wordCount = text.split(/\s+/).length;
    return wordCount > 80 ? 1.0 : (wordCount > 40 ? 0.7 : 0.4);
  }

  _normalizeSkills(skillsObj) {
    if (!skillsObj) return [];
    if (Array.isArray(skillsObj)) return skillsObj.map(s => s.toLowerCase());
    return Object.values(skillsObj).flat().map(s => s.toLowerCase());
  }

  _summarizeBench(results, level) {
    if (level === 'high') return results.filter(r => r.score >= 80).map(r => `Strong performance in ${r.topic}`).slice(0, 5);
    return results.filter(r => r.score < 40).map(r => `Improvement needed in ${r.topic}`).slice(0, 5);
  }
}

module.exports = new ManualScoringService();
