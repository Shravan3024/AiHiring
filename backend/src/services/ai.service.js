const axios = require('axios');
const FormData = require('form-data');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');
const scoringService = require('./scoring.service');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';
const keyRotator = require('../utils/keyRotator');
const llmService = require('./llm.service');

/**
 * Gets a fresh model instance with a rotated API key
 */
const getModel = () => {

  const key = keyRotator.getNextKey();
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: process.env.GENAI_MODEL || "gemini-2.0-flash" });
};



const aiServiceClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 45000, // Increased timeout for heavy AI tasks
});

/**
 * Global Sanitization: Strips markdown characters (asterisks, etc.) from AI-generated content
 */
const sanitizeAIOutput = (obj) => {
  if (typeof obj === 'string') return obj.replace(/\*\*/g, '').replace(/\*/g, '').trim();
  if (Array.isArray(obj)) return obj.map(sanitizeAIOutput);
  if (typeof obj === 'object' && obj !== null) {
    const newObj = {};
    for (let key in obj) {
       if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = sanitizeAIOutput(obj[key]);
       }
    }
    return newObj;
  }
  return obj;
};

/**
 * Resume parsing integration
 */
const parseResumeWithAI = async (filePath) => {
  try {
    // 1. Try Remote AI Service first (Flask)
    logger.info(`[AI Service] Attempting remote parse via ${AI_SERVICE_URL}`);
    
    const formData = new FormData();
    const fs = require('fs');
    if (!fs.existsSync(filePath)) throw new Error("File not found for parsing");
    
    const fileStream = fs.createReadStream(filePath);
    formData.append('file', fileStream);

    const response = await aiServiceClient.post('/api/ai/resume/parse', formData, {
      headers: formData.getHeaders(),
    });

    if (response.data && response.data.success) {
        logger.info("[AI Service] Remote parse successful");
        return response.data.data;
    }
    throw new Error("Remote service returned unsuccessful response");

  } catch (error) {
    logger.warn(`[AI Service] Remote parse failed: ${error.message}. Attempting Direct Gemini Parse...`);
    
    // 2. Try Direct Gemini Parse from Node (Secondary Pipeline)
    try {
        return await parseResumeWithGeminiDirect(filePath);
    } catch (geminiError) {
        logger.error(`[AI Service] Direct Gemini parse also failed: ${geminiError.message}. Falling back to local ML parser.`);
        // 3. Last Resort: Local ML Parser
        const localData = await localResumeParser(filePath);
        return {
            ...localData,
            total_years_experience: localData.experience_years || 0
        };
    }
  }
};

/**
 * Direct Gemini Resume Parser (Node-based secondary pipeline)
 */
const parseResumeWithGeminiDirect = async (filePath) => {
    try {
        const fs = require('fs');
        const pdf = require('pdf-parse'); 
        const dataBuffer = fs.readFileSync(filePath);
        
        let text = "";
        if (filePath.toLowerCase().endsWith('.pdf')) {
            const pdfData = await pdf(dataBuffer);
            text = pdfData.text;
        } else {
            text = dataBuffer.toString('utf-8');
        }

        const prompt = `
            Task: Parse the following resume text and return a structured JSON object.
            
            Resume Text:
            ${text.substring(0, 4000)}

            Required JSON Format:
            {
                "contact_info": { "email": "", "phone": "", "name": "" },
                "skills": ["skill1", "skill2"],
                "experience_years": number,
                "overall_score": 0-100,
                "summary": "Short executive summary",
                "education": [{ "degree": "", "specialization": "", "cgpa": "" }],
                "strengths": ["string", "string", "string", "string", "string"],
                "weaknesses": ["string", "string", "string", "string", "string"],
                "role_fit": { "fit_level": "High/Medium/Low", "explanation": "" }
            }
        `;

        const responseText = await llmService.generateCompletion('RESUME_SCORING', prompt);
        const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
        const sanitized = sanitizeAIOutput(parsed);
        return {
            ...sanitized,
            total_years_experience: sanitized.experience_years || 0
        };
    } catch (e) {
        logger.error(`[Gemini Direct] Failed: ${e.message}`);
        throw e;
    }
};

/**
 * Local ML-based Resume Parser (Iterative Fallback)
 */
const localResumeParser = async (filePath) => {
    try {
        const fs = require('fs');
        const pdf = require('pdf-parse');
        let text = "";
        
        try {
            const dataBuffer = fs.readFileSync(filePath);
            if (filePath.toLowerCase().endsWith('.pdf')) {
                const pdfData = await pdf(dataBuffer);
                text = pdfData.text;
            } else {
                text = dataBuffer.toString('utf-8');
            }
        } catch (readErr) {
            logger.warn(`Local parser text extraction failed: ${readErr.message}`);
            text = "Text extraction failed";
        }

        const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
        const phone = text.match(/(\+?\d{1,3}[- ]?)?\d{10}/)?.[0];
        
        const commonSkills = ["React", "Node.js", "Java", "Python", "SQL", "Docker", "AWS", "SAP", "Quality Control", "Production", "Marketing", "Supply Chain"];
        const foundSkills = commonSkills.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(text));

        const cgpaMatch = text.match(/CGPA[\s:]*([0-9.]+)/i);
        const experience = text.match(/(\d+)\+?\s*(years?|yrs?)/i)?.[1] || 2;

        return {
            contact_info: { email, phone },
            skills: foundSkills,
            experience_years: parseInt(experience),
            overall_score: 65,
            summary: "Extracted via Local Semantic Pipeline (AI Fallback Active)",
            education: [{ degree: "Detected Degree", cgpa: cgpaMatch?.[1] }],
            strengths: ["Clear professional background", "Documented technical skills", "Structured profile layout"],
            weaknesses: ["Deep AI analysis unavailable for this file format", "Verify certifications manually"],
            role_fit: { fit_level: "Moderate", explanation: "Matched against core industrial keywords." }
        };
    } catch (e) {
        logger.error(`[Local Parser] Critical Failure: ${e.message}`);
        return { skills: [], summary: "Parsing Failed", overall_score: 0, strengths: [], weaknesses: [] };
    }
};

/**
 * Score resume against job requirements
 */
const scoreResume = async (parsedResume, jobRequirements) => {
  try {
    const jdSkillsText = (jobRequirements.required_skills?.join(' ') || jobRequirements.description || '').toLowerCase();
    const candSkills = parsedResume.skills ? (Array.isArray(parsedResume.skills) ? parsedResume.skills : Object.values(parsedResume.skills).flat()) : [];
    
    const skillMatch = scoringService.matchSkills(jdSkillsText, candSkills);
    const resumeText = JSON.stringify(parsedResume).toLowerCase();
    const cosineScore = scoringService.calculateCosineSimilarity(jdSkillsText, resumeText);
    
    // Higher weight for skill match in JD scoring
    const finalFitScore = Math.round((skillMatch.matchPercentage * 0.7) + (cosineScore * 30));

    return {
      overall_fit_percentage: finalFitScore,
      matched_skills: skillMatch.matched,
      missing_skills: skillMatch.missing,
      cosine_similarity: cosineScore,
      analysis: `Skill Match: ${skillMatch.matchPercentage}%, Semantic Alignment: ${Math.round(cosineScore * 100)}%`
    };
  } catch (error) {
    logger.error(`Scoring Error: ${error.message}`);
    return { overall_fit_percentage: 0, matched_skills: [], missing_skills: [] };
  }
};

/**
 * Analyze Assessment Response (Hybrid Gemini + Local Semantic)
 */
const analyzeAssessmentResponse = async (assessmentData) => {
    try {
        const { question, answer, category, expectedAnswer, keywords } = assessmentData;
        
        // 1. Initial Local Semantic Score (Cosine Similarity)
        // If we have an expected answer, compare against that. Otherwise compare against the question context.
        const referenceText = expectedAnswer || question;
        const localSemanticScore = scoringService.calculateCosineSimilarity(referenceText, answer);
        const baselineScore = Math.round(localSemanticScore * 100);

        // 2. Call Remote AI for Behavioral/Deep Technical Insights
        if (!AI_SERVICE_URL.includes('localhost:5000')) {
            const response = await aiServiceClient.post('/api/ai/assessment/analyze', {
                question,
                answer,
                category,
                expectedAnswer,
                keywords
            });
            return {
                score: response.data?.score || baselineScore,
                insights: response.data?.insights || "Analysis completed via Neural Engine."
            };
        }

        // Local Fallback Logic: Boost score if keywords are found
        let finalScore = baselineScore;
        if (keywords && Array.isArray(keywords)) {
            const foundCount = keywords.filter(k => answer.toLowerCase().includes(k.toLowerCase())).length;
            const keywordBoost = (foundCount / keywords.length) * 20;
            finalScore = Math.min(100, finalScore + keywordBoost);
        }

        return {
            score: finalScore,
            insights: "Local semantic analysis performed. Keyword density weighted."
        };

    } catch (err) {
        logger.warn(`Assessment AI Analysis failed: ${err.message}. Falling back to ML baseline.`);
        return { score: 70, insights: "Baseline fallback active." };
    }
};

/**
 * Analyze Interview
 */
/**
 * Analyze Interview using Deep AI
 */
const analyzeInterview = async (transcript, interviewDetails = {}) => {
  const { type = 'technical', questions = [] } = interviewDetails;
  
  const prompt = `
    Task: Deep AI Interview Analysis for Mask Polymers.
    Interview Type: ${type}
    Context Questions: ${JSON.stringify(questions)}
    Transcript: ${transcript.substring(0, 8000)}

    Analyze the transcript and provide a comprehensive evaluation in JSON format.
    Include scores (0-100), green/red flags, and hiring recommendations.

    Required JSON Schema:
    {
      "overall_assessment": {
        "overall_score": 0-100,
        "summary": "string",
        "key_takeaways": ["string"],
        "next_round_readiness": boolean
      },
      "qa_analyses": [
        { "question": "string", "answer_summary": "string", "technical_depth": 0-10, "communication_clarity": 0-10 }
      ],
      "metrics": {
        "technical_knowledge": 0-100,
        "communication": 0-100,
        "problem_solving": 0-100,
        "soft_skills": 0-100,
        "cultural_fit": 0-100
      },
      "speaking_patterns": {
        "confidence_level": "high | moderate | low",
        "pace": "steady | fast | slow",
        "clarity": "clear | average | poor",
        "hesitation_level": "low | medium | high"
      },
      "green_flags": ["string"],
      "red_flags": ["string"],
      "recommendation": "strong_yes | yes | maybe | no",
      "performance_prediction": {
        "predicted_on_job_performance": "exceptional | strong | average | risk",
        "time_to_productivity_months": number,
        "retention_probability_percentage": 0-100
      }
    }
  `;

  try {
    const responseText = await llmService.generateCompletion('INTERVIEW_ANALYSIS', prompt);
    const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
    return sanitizeAIOutput(parsed);
  } catch (error) {
    logger.error(`AI Interview Analysis Error: ${error.message}`);
    // Deterministic fallback
    const semanticScore = scoringService.calculateCosineSimilarity("professionalism experience knowledge", transcript);
    const score = Math.round(semanticScore * 100);
    
    return {
      overall_assessment: { 
        overall_score: score, 
        summary: "Semantic fallback analysis active due to AI service interruption.",
        key_takeaways: ["Candidate provided structured responses"]
      },
      metrics: { technical_knowledge: score, communication: 70, problem_solving: 60, soft_skills: 70, cultural_fit: 60 },
      recommendation: score > 60 ? 'yes' : 'maybe'
    };
  }
};

/**
 * Generate Resume Summary (AI-enhanced)
 */
const generateResumeSummary = async (parsedData) => {
    try {
        const skills = Array.isArray(parsedData.skills) ? parsedData.skills.join(', ') : 
                      (typeof parsedData.skills === 'object' ? Object.values(parsedData.skills).flat().join(', ') : 'Various technical domains');
        const exp = parsedData.total_years_experience || parsedData.experience_years || 0;
        
        const prompt = `
            Task: Generate an executive summary and analysis for a candidate based on their parsed resume data.
            Candidate Data:
            - Experience: ${exp} years
            - Skills: ${skills}
            - Highest Qualification: ${parsedData.highest_qualification || 'N/A'}
            - Top Achievements: ${parsedData.key_achievements?.join(', ') || 'N/A'}
            
            Return a JSON object:
            {
                "executive_summary": "A 2-3 sentence professional summary",
                "key_strengths": ["List 5 distinct strengths"],
                "weaknesses": ["List 3-5 potential areas for growth or gaps"],
                "recommended_improvements": ["What the candidate should add or improve in their profile"]
            }
        `;

        try {
            const responseText = await llmService.generateCompletion('RESUME_SCORING', prompt);
            const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
            return sanitizeAIOutput(parsed);
        } catch (llmErr) {
            logger.warn(`LLM Summary generation failed: ${llmErr.message}. Using structured fallback.`);
            return {
                executive_summary: `Candidate presents ${exp} years of industry experience with core competencies in ${skills.substring(0, 100)}...`,
                key_strengths: parsedData.strengths?.length > 0 ? parsedData.strengths : ["Clear professional background", "Documented technical skills", "Structured profile layout"],
                weaknesses: parsedData.weaknesses?.length > 0 ? parsedData.weaknesses : ["Deep AI analysis unavailable for this file format", "Verify certifications manually"],
                recommended_improvements: parsedData.recommendations?.length > 0 ? parsedData.recommendations : ["Add specific project impact metrics"]
            };
        }
    } catch (e) {
        logger.error(`[Summary Generator] Critical Error: ${e.message}`);
        return {
            executive_summary: "Error generating summary.",
            key_strengths: [],
            weaknesses: [],
            recommended_improvements: []
        };
    }
};

/**
 * Generate Interview Summary
 */
const generateInterviewSummary = async (transcript, score) => {
    return `The candidate demonstrated a ${score > 70 ? 'strong' : 'moderate'} grasp of professional concepts. Transcript analysis indicates active engagement with a focus score of ${score}%.`;
};

module.exports = {
  parseResumeWithAI,
  scoreResume,
  analyzeAssessmentResponse,
  analyzeInterview,
  generateResumeSummary,
  generateInterviewSummary,
  healthCheck: async () => ({ status: "UP", mode: AI_SERVICE_URL.includes('localhost') ? "LOCAL_ML" : "REMOTE_AI" }),
  
  /**
   * Module 1: Advanced Answer Analysis
   */
  evaluateTechnicalAnswer: async (question, answer, expectedAnswer, keywords) => {
    const prompt = `
      Task: Evaluate technical response for Mask Polymers.
      Context: Q: ${question} | Ans: ${answer} | Ref: ${expectedAnswer}
      Output Format (JSON): { 
        "score": number, 
        "structure_score": number, 
        "concept_coverage": number, 
        "explanation": "string",
        "strengths": ["string"],
        "weaknesses": ["string"]
      }
    `;
    try {
      const responseText = await llmService.generateCompletion('INTERVIEW_ANALYSIS', prompt);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
      return sanitizeAIOutput(parsed);
    } catch (err) {
      logger.warn(`AI Technical Evaluation Error: ${err.message}. Providing baseline scores.`);
      return { 
        score: 50, 
        structure_score: 50, 
        concept_coverage: 50, 
        explanation: "AI analysis encountered an error. Falling back to semantic baseline.",
        strengths: ["Baseline response provided"],
        weaknesses: ["AI analysis was interrupted"]
      };
    }
  },

  /**
   * Module 2: Full Interview Analysis
   */
  analyzeFullInterview: async (qaPairs, jobTitle) => {
    const prompt = `
      Task: Analyze Video Interview for ${jobTitle}.
      Data: ${JSON.stringify(qaPairs)}
      Output Format (JSON): { "dimension_scores": { "technical": 0, "communication": 0, "confidence": 0, "soft_skills": 0, "integrity": 0 }, "overall_interview_score": 0, "highlights": { "summary": "" }, "recommendation": "" }
    `;
    try {
      const responseText = await llmService.generateCompletion('INTERVIEW_ANALYSIS', prompt);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
      return sanitizeAIOutput(parsed);
    } catch (err) {
      logger.warn(`AI Full Interview Analysis Error: ${err.message}`);
      return { 
        overall_interview_score: 50, 
        highlights: { summary: "The AI interview analysis was interrupted. Please review the transcript manually." },
        dimension_scores: { technical: 50, communication: 50, confidence: 50 }
      };
    }
  },

  /**
   * Module 4: Final Recommendation Engine
   * Generates the executive hiring decision and role fit analysis
   */
  getFinalCandidateDecision: async (metrics) => {
    const { 
        jobId,
        assessmentScore, 
        interviewScore, 
        integrityScore, 
        behavioralScore,
        jobTitle = "the specified role",
        candidateName = "this candidate"
    } = metrics;
    
    // Default weights
    let weights = { assessment: 0.4, interview: 0.4, integrity: 0.1, behavioral: 0.1 };

    if (jobId) {
      try {
        const { AIConfig } = require('../models');
        const dbConfig = await AIConfig.findOne({ where: { jobId: String(jobId), status: 'ACTIVE' } });
        if (dbConfig) {
          // Map AI Config weights (Resume, MCQ, Tech, Interview) to the final 4 metrics
          // Since this function focuses on Post-Interview decision, we re-weight
          const totalBase = (dbConfig.mcqWeight + dbConfig.technicalWeight + dbConfig.interviewWeight) || 1;
          weights.assessment = (dbConfig.mcqWeight + dbConfig.technicalWeight) / totalBase * 0.8;
          weights.interview = dbConfig.interviewWeight / totalBase * 0.8;
          weights.integrity = 0.1;
          weights.behavioral = 0.1;
        }
      } catch (e) {
        logger.warn(`Failed to fetch AI weights for job ${jobId}, using defaults.`);
      }
    }
    
    const finalScore = (assessmentScore * weights.assessment) + (interviewScore * weights.interview) + (integrityScore * weights.integrity) + (behavioralScore * weights.behavioral);
    
    const prompt = `
      Task: Generate Final Hiring Decision for Mask Polymers Recruitment System.
      Role: ${jobTitle}
      Candidate: ${candidateName}
      
      Performance Metrics:
      - Technical Assessment Score: ${assessmentScore}/100
      - AI Interview Performance: ${interviewScore}/100
      - Integrity/Security Score: ${integrityScore}/100
      - Behavioral/Cultural Score: ${behavioralScore}/100
      - Calculated Weighted Score: ${Math.round(finalScore)}/100
      
      Provide a comprehensive hiring recommendation in JSON format.
      CRITICAL: DO NOT use markdown like asterisks (**) for bolding. Return plain text only.
      
      Required JSON Schema:
      {
        "decision": "Strong Hire | Hire | Borderline | Reject",
        "role_recommendation": "A detailed 1-2 sentence recommendation on which specific capacity or sub-role this candidate fits best within ${jobTitle}.",
        "fit_breakdown": {
          "technical": 0-100,
          "communication": 0-100,
          "leadership": 0-100
        },
        "reasoning": "A professional executive rationale for the decision based on the provided metrics.",
        "success_prediction_percentage": 0-100
      }
    `;

    try {
      const responseText = await llmService.generateCompletion('BIAS_SAFE_HR', prompt);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
      
      return { ...sanitizeAIOutput(parsed), final_score: finalScore };
    } catch (err) {
      logger.error(`[AI Decision Core] Execution Error: ${err.message}`);
      return { 
        decision: "Borderline", 
        role_recommendation: "System requires manual HR review due to analysis error.",
        fit_breakdown: { technical: assessmentScore, communication: interviewScore, leadership: 50 },
        reasoning: "The AI decision core encountered a processing error. Please review scores manually.",
        success_prediction_percentage: 50,
        final_score: finalScore 
      };
    }
  },

  /**
   * Module 5: Strategic System Report
   */
  generateSystemReport: async (stats) => {
    const prompt = `
      Task: Generate Strategic AI Recruitment Report for Mask Polymers.
      Stats Data: ${JSON.stringify(stats)}
      
      Generate a professional executive summary, trend analysis, and strategic recommendations.
      Return JSON format: { "title": "", "summary": "", "sections": [{ "heading": "", "content": "" }], "conclusion": "" }
    `;
    try {
      const responseText = await llmService.generateCompletion('LOW_COST_SCALING', prompt);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
      return sanitizeAIOutput(parsed);
    } catch (err) {
      return { title: "AI Report Error", summary: "Failed to generate report using AI." };
    }
  },

  /**
   * Module 6: Specific Section Insight Generator
   */
  generateStrategicInsight: async (section, data) => {
    const prompt = `
      Task: Generate a Strategic Recruitment Insight for the section: "${section}".
      Context Data: ${JSON.stringify(data)}
      
      Requirements:
      - Use professional recruitment language.
      - Base the insight on the provided data trends.
      - For "Talent Intelligence", identify correlations.
      - For "Predictive Analytics", provide probability-based rationale.
      - For "Recommendations", give actionable advice.
      
      Return a concise JSON object:
      {
        "title": "Short title",
        "content": "A 2-3 sentence strategic insight based on data.",
        "impact": "High | Moderate | Low",
        "action_item": "Suggested next step"
      }
    `;
    try {
      const responseText = await llmService.generateCompletion('LOW_COST_SCALING', prompt);
      const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());
      return sanitizeAIOutput(parsed);
    } catch (err) {
      logger.error(`[AI Insight Generator] Error: ${err.message}`);
      return { 
        title: `${section} Insight`, 
        content: "The AI is currently analyzing recent data trends. Please check back shortly.",
        impact: "Moderate"
      };
    }
  },

  /**
   * Module 7: Candidate Chatbot
   */
  chatWithAI: async (message, history = []) => {
    const prompt = `
      Task: AI Recruitment Assistant for Mask Polymers.
      Role: Help the candidate with their application, interview, or assessment queries.
      Context: You are professional, helpful, and concise.
      
      Chat History:
      ${JSON.stringify(history)}
      
      User Message: ${message}
      
      Response (Plain Text):
    `;
    try {
      return await llmService.generateCompletion('CANDIDATE_CHATBOT', prompt);
    } catch (err) {
      logger.error(`[AI Chat] Error: ${err.message}`);
      return "I apologize, but I'm having trouble connecting to my brain right now. Please try again in a moment.";
    }
  }
};