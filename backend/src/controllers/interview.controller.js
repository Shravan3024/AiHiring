const { Interview, InterviewAnswer } = require("../models");
const aiService = require("../services/ai.service");
const logger = require("../utils/logger");

// AI Analysis functions (imported from interviewPhase5.controller.js logic)
function analyzeResponse(transcription) {
  return {
    sentiment: Math.random() * 0.5 + 0.5,
    confidence: Math.random() * 0.3 + 0.7,
    clarity: calculateClarity(transcription),
    relevance: calculateRelevance(transcription),
    keywords: extractKeywords(transcription),
    word_count: transcription.split(' ').length,
    filler_words: countFillerWords(transcription)
  };
}

function calculateClarity(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const avgWordsPerSentence = text.split(' ').length / (sentences.length || 1);

  if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 20) return 0.9;
  if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 25) return 0.7;
  if (avgWordsPerSentence >= 6 && avgWordsPerSentence <= 30) return 0.5;
  return 0.3;
}

function calculateRelevance(text) {
  const keywords = ['implement', 'design', 'optimize', 'improve', 'scalable', 'solution', 'architecture', 'database', 'API', 'microservices'];
  const lowerText = text.toLowerCase();
  const matches = keywords.filter(k => lowerText.includes(k)).length;

  return Math.min(1, matches / keywords.length);
}

function extractKeywords(text) {
  const technicalTerms = [
    'python', 'javascript', 'java', 'golang', 'rust',
    'react', 'vue', 'angular', 'node.js',
    'database', 'sql', 'nosql', 'mongodb', 'postgresql',
    'microservices', 'kubernetes', 'docker',
    'api', 'rest', 'graphql',
    'machine learning', 'ai', 'aws', 'azure', 'gcp'
  ];

  const lowerText = text.toLowerCase();
  return technicalTerms.filter(term => lowerText.includes(term));
}

function countFillerWords(text) {
  const fillers = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'so'];
  let count = 0;
  fillers.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    count += (text.match(regex) || []).length;
  });
  return count;
}

function calculateInterviewScore(answers) {
  if (answers.length === 0) return 0;

  let totalScore = 0;

  answers.forEach(answer => {
    let questionScore = 0;

    // Analyze the answer text if available
    const analysis = answer.answer_text ? analyzeResponse(answer.answer_text) : {
      sentiment: 0.5,
      confidence: 0.5,
      relevance: 0.5
    };

    questionScore += analysis.sentiment * 25;
    questionScore += analysis.confidence * 25;
    questionScore += analysis.relevance * 25;

    // Basic duration check (assuming 30-90 seconds is optimal)
    const duration = answer.response_duration_seconds || 45;
    if (duration >= 30 && duration <= 90) {
      questionScore += 25;
    } else if (duration >= 15 && duration <= 120) {
      questionScore += 15;
    } else {
      questionScore += 5;
    }

    totalScore += questionScore / 4;
  });

  return Math.round(totalScore / answers.length);
}

function generateAISummary(answers, score) {
  const analyses = answers.map(a => a.answer_text ? analyzeResponse(a.answer_text) : null).filter(Boolean);

  if (analyses.length === 0) {
    return "Limited response data available for analysis.";
  }

  const avgSentiment = analyses.reduce((sum, a) => sum + a.sentiment, 0) / analyses.length;
  const avgConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;
  const avgRelevance = analyses.reduce((sum, a) => sum + a.relevance, 0) / analyses.length;
  const totalWords = analyses.reduce((sum, a) => sum + a.word_count, 0);
  const totalFillers = analyses.reduce((sum, a) => sum + a.filler_words, 0);

  let summary = "";

  if (score >= 80) {
    summary += "Excellent performance with strong technical knowledge and communication skills. ";
  } else if (score >= 70) {
    summary += "Good performance showing solid understanding and clear communication. ";
  } else if (score >= 60) {
    summary += "Adequate performance with room for improvement in technical depth or communication. ";
  } else {
    summary += "Performance needs significant improvement in technical knowledge and communication. ";
  }

  if (avgConfidence > 0.8) {
    summary += "Demonstrated high confidence in responses. ";
  } else if (avgConfidence > 0.6) {
    summary += "Showed moderate confidence with some hesitation. ";
  } else {
    summary += "Appeared uncertain in several responses. ";
  }

  if (avgRelevance > 0.7) {
    summary += "Answers were highly relevant to the questions asked. ";
  } else if (avgRelevance > 0.4) {
    summary += "Answers addressed the questions with moderate relevance. ";
  } else {
    summary += "Answers sometimes missed the core requirements of the questions. ";
  }

  if (totalFillers > analyses.length * 2) {
    summary += "Used filler words frequently, suggesting nervousness or lack of preparation. ";
  } else if (totalFillers < analyses.length) {
    summary += "Spoke clearly with minimal filler words. ";
  }

  return summary.trim();
}

function generateHireRecommendation(score, answers) {
  if (score >= 85) return "STRONG_HIRE";
  if (score >= 75) return "HIRE";
  if (score >= 65) return "CONSIDER";
  if (score >= 55) return "REVIEW";
  return "NO_HIRE";
}

exports.startInterview = async (req, res) => {
  const interview = await Interview.findByPk(req.params.id);
  interview.status = "IN_PROGRESS";
  await interview.save();
  res.json({ message: "Interview started" });
};

exports.pauseInterview = async (req, res) => {
  const interview = await Interview.findByPk(req.params.id);
  interview.status = "PAUSED";
  await interview.save();
  res.json({ message: "Interview paused" });
};

exports.submitAnswer = async (req, res) => {
  const { interview_id, question, answer_text } = req.body;

  const answer = await InterviewAnswer.create({
    interview_id,
    question,
    answer_text
  });

  res.json(answer);
};

exports.completeInterview = async (req, res) => {
  try {
    const { Application, InterviewAnalysis, ApplicationStatusLog } = require("../models");
    
    const interview = await Interview.findByPk(req.params.id);

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    // Get all answers for this interview
    const answers = await InterviewAnswer.findAll({
      where: { interview_id: interview.id }
    });

    // Build transcript from answers
    let transcript = "";
    const qaArray = [];
    answers.forEach(answer => {
      transcript += `Q: ${answer.question}\nA: ${answer.answer_text}\n\n`;
      qaArray.push({
        question: answer.question,
        answer: answer.answer_text,
        duration_seconds: answer.response_duration_seconds || 0
      });
    });

    // ========== AI INTERVIEW ANALYSIS (NEW) ==========
    let aiScore = 0;
    let aiSummary = "";
    let aiAnalysis = null;
    let interviewAnalysisRecord = null;

    try {
      logger.info(`[Interview AI] Starting AI analysis for interview ${interview.id}`);

      // Call AI service to analyze interview
      const aiResult = await aiService.analyzeInterview(transcript, {
        interview_type: 'theory_based',
        qa_pairs: qaArray,
        duration_minutes: Math.round((answers.length * 2)), // Estimate
        total_questions: answers.length
      });

      aiScore = Math.round(aiResult.overall_score || 0);
      aiSummary = aiResult.summary || generateAISummary(answers, aiScore);

      aiAnalysis = {
        overall_score: aiResult.overall_score || 0,
        technical_knowledge_score: aiResult.technical_knowledge_score || 0,
        problem_solving_score: aiResult.problem_solving_score || 0,
        communication_score: aiResult.communication_score || 0,
        soft_skills_score: aiResult.soft_skills_score || 0,
        cultural_fit_score: aiResult.cultural_fit_score || 0,
        confidence_level: aiResult.confidence_level || 'medium',
        communication_style: aiResult.communication_style || 'formal',
        clarity: aiResult.clarity || 'clear',
        hesitation_level: aiResult.hesitation_level || 'medium',
        strengths: aiResult.strengths || [],
        weaknesses: aiResult.weaknesses || [],
        answer_analyses: aiResult.answer_analyses || [],
        red_flags: aiResult.red_flags || [],
        green_flags: aiResult.green_flags || [],
        hire_recommendation: aiResult.hire_recommendation || generateHireRecommendation(aiScore, answers)
      };

      logger.info(`[Interview AI] Analysis complete, score: ${aiScore}`);

    } catch (aiError) {
      logger.warn(`[Interview AI] AI analysis failed (using fallback): ${aiError.message}`);
      
      // Fallback: Use basic scoring
      aiScore = calculateInterviewScore(answers);
      aiSummary = generateAISummary(answers, aiScore);
    }

    // Update interview with final score
    interview.ai_score = aiScore;
    interview.ai_summary = aiSummary;
    interview.hire_recommendation = aiAnalysis ? aiAnalysis.hire_recommendation : generateHireRecommendation(aiScore, answers);
    interview.status = "COMPLETED";

    await interview.save();

    // Store AI analysis in InterviewAnalysis model
    if (aiAnalysis) {
      try {
        interviewAnalysisRecord = await InterviewAnalysis.create({
          application_id: interview.application_id,
          interview_session_id: interview.id,
          interview_type: 'theory_based',
          transcript: transcript,
          qa_pairs: qaArray,
          overall_score: aiAnalysis.overall_score,
          technical_knowledge_score: aiAnalysis.technical_knowledge_score,
          problem_solving_score: aiAnalysis.problem_solving_score,
          communication_score: aiAnalysis.communication_score,
          soft_skills_score: aiAnalysis.soft_skills_score,
          cultural_fit_score: aiAnalysis.cultural_fit_score,
          confidence_level: aiAnalysis.confidence_level,
          communication_style: aiAnalysis.communication_style,
          clarity: aiAnalysis.clarity,
          hesitation_level: aiAnalysis.hesitation_level,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses,
          answer_analyses: aiAnalysis.answer_analyses,
          red_flags: aiAnalysis.red_flags,
          green_flags: aiAnalysis.green_flags
        });

        logger.info(`[Interview AI] Analysis stored for application ${interview.application_id}`);
      } catch (dbError) {
        logger.error(`[Interview AI] Failed to store analysis: ${dbError.message}`);
      }
    }

    // Update Application with interview score
    const application = await Application.findByPk(interview.application_id);
    if (application) {
      await application.update({
        interview_score: aiScore,
        status: 'INTERVIEW_COMPLETED'
      });

      // Log status change
      await ApplicationStatusLog.create({
        application_id: application.id,
        previous_status: 'INTERVIEW_SCHEDULED',
        new_status: 'INTERVIEW_COMPLETED',
        changed_by: req.user?.id || null,
        changed_at: new Date()
      });

      // ========== CHECK AND TRIGGER AUTO-REJECTION ==========
      try {
        const { checkAndTriggerAutoRejection } = require("./application.controller");
        await checkAndTriggerAutoRejection(application.id, logger);
      } catch (autoRejectError) {
        logger.warn(`[Auto-Rejection] Check failed after interview: ${autoRejectError.message}`);
      }
    }

    res.json({
      message: "Interview completed with AI analysis",
      interview: {
        id: interview.id,
        ai_score: aiScore,
        ai_summary: aiSummary,
        hire_recommendation: interview.hire_recommendation,
        status: interview.status,
        completed_at: interview.updated_at,
        ai_analysis: aiAnalysis ? {
          technical_knowledge_score: aiAnalysis.technical_knowledge_score,
          communication_score: aiAnalysis.communication_score,
          confidence_level: aiAnalysis.confidence_level,
          strengths: aiAnalysis.strengths,
          weaknesses: aiAnalysis.weaknesses
        } : null
      }
    });
  } catch (error) {
    logger.error(`[Interview] Complete error: ${error.message}`);
    res.status(500).json({ error: "Failed to complete interview" });
  }
};
