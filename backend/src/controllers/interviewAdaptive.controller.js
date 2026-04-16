const { 
  Application, 
  InterviewSession, 
  InterviewAnalysis, 
  InterviewQuestionBank, 
  ApplicationStatusLog, 
  Candidate, 
  Job 
} = require('../models');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * PHASE 6: ADVANCED ADAPTIVE INTERVIEW PANEL
 */
exports.startAdaptiveInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const candidateId = req.candidate.id;

    const application = await Application.findOne({
      where: { id: applicationId, candidate_id: candidateId },
      include: [Candidate, Job]
    });

    if (!application || application.status !== 'INTERVIEW_UNLOCKED') {
        return res.status(403).json({ error: 'Interview is locked or has not been approved by HR.' });
    }

    // Initialize/Find Session
    let session = await InterviewSession.findOne({
      where: { application_id: applicationId, status: 'SCHEDULED' }
    });

    if (!session) {
      session = await InterviewSession.create({
        application_id: applicationId,
        status: 'IN_PROGRESS',
        questions_asked: [],
        metadata: { current_phase: 'WARMUP', question_count: 0 }
      });
    }

    // Change App Status
    await application.update({ status: 'INTERVIEW_IN_PROGRESS' });

    // Generate FIRST Question (Warmup)
    const firstQuestion = await getAdaptiveQuestion(application, session, null);
    
    // Update questions asked
    await session.update({
        questions_asked: [firstQuestion],
        status: 'IN_PROGRESS'
    });

    res.json({
      success: true,
      message: "Adaptive Interview Panel Initialized",
      session_id: session.id,
      phase: session.metadata.current_phase,
      question: firstQuestion,
      total_expected: 10
    });

  } catch (error) {
    logger.error(`[Adaptive Interview] Start Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to initialize adaptive interview' });
  }
};

/**
 * Handle Next Question Response
 */
exports.submitResponseAndGetNext = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { answer, responseTimeMs } = req.body;
    const candidateId = req.candidate.id;

    const session = await InterviewSession.findOne({
      where: { application_id: applicationId },
      include: [{ model: Application, include: [Candidate, Job] }]
    });

    if (!session || session.status !== 'IN_PROGRESS') {
        return res.status(400).json({ error: 'No active interview session found.' });
    }

    const currentMetadata = session.metadata || {};
    const currentQuestionCount = currentMetadata.question_count || 0;

    // 1. ANALYZE PREVIOUS ANSWER
    const analysis = await analyzeAnswer(answer, session.questions_asked[currentQuestionCount], session.Application.Job);
    
    // 2. LOG THE PAIR
    const qaPair = {
        question: session.questions_asked[currentQuestionCount],
        answer,
        analysis,
        responseTimeMs,
        timestamp: new Date()
    };

    const updatedAnswers = [...(session.answers_received || []), qaPair];
    const updatedCount = currentQuestionCount + 1;

    // 3. DECIDE NEXT PHASE
    let nextPhase = 'TECHNICAL';
    if (updatedCount >= 2) nextPhase = 'TECHNICAL';
    if (updatedCount >= 6) nextPhase = 'BEHAVIORAL';
    if (updatedCount >= 8) nextPhase = 'STRESS';
    if (updatedCount >= 9) nextPhase = 'CLOSING';

    // 4. GENERATE NEXT QUESTION OR FINISH
    if (updatedCount >= 10) {
        // FINAL ANALYSIS & CLOSING
        return finalizeInterview(req, res, session, updatedAnswers);
    }

    const nextQuestion = await getAdaptiveQuestion(session.Application, session, analysis, nextPhase);
    
    // Update Session
    const questionsAsked = [...session.questions_asked, nextQuestion];
    await session.update({
        questions_asked: questionsAsked,
        answers_received: updatedAnswers,
        metadata: { ...currentMetadata, current_phase: nextPhase, question_count: updatedCount }
    });

    res.json({
        success: true,
        phase: nextPhase,
        question: nextQuestion,
        count: updatedCount,
        progress: (updatedCount / 10) * 100
    });

  } catch (error) {
    logger.error(`[Adaptive Interview] Step Error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process interview step' });
  }
};

/**
 * AI Logic: Get Adaptive Question
 */
async function getAdaptiveQuestion(application, session, lastAnalysis, forcePhase = null) {
  const phase = forcePhase || session.metadata.current_phase || 'WARMUP';
  const role = application.Job.title;
  const skills = application.skills || [];

  const prompt = `
    You are an Expert AI Interview Panel for the role: ${role}.
    Current Phase: ${phase}.
    Context: Candidate has skills [${skills.join(', ')}].
    ${lastAnalysis ? `Last answer quality: ${lastAnalysis.technical_accuracy}/100. Reasoning: ${lastAnalysis.reasoning}` : ''}

    Task: Generate the NEXT interview question.
    Guidelines:
    - If WARMUP: Ask something about their journey or "Tell us about yourself".
    - If TECHNICAL: If last answer was strong, ask a deeper/harder question. If weak, simplify or ask a follow-up. Use technical depth relevant to ${role}.
    - If BEHAVIORAL: Ask a situational "What if" question.
    - If STRESS: Ask a rapid, challenging question to check confidence or handle a stressful scenario.
    - If CLOSING: Ask "Do you have any questions for us?".

    Rules:
    - ONE question only.
    - Professional and slightly strict tone.
    - Do NOT be robotic.

    Response format: JUST the question text.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/**
 * AI Logic: Analyze Individual Answer
 */
async function analyzeAnswer(answer, question, job) {
    const prompt = `
        Evaluate this interview answer:
        Question: ${question}
        Answer: ${answer}

        Return a JSON object with:
        {
          "technical_accuracy": 0-100,
          "communication_clarity": 0-100,
          "confidence_score": 0-100,
          "cheating_risk_score": 0-100 (detect unnatural patterns, copy-paste style, or sudden quality shifts),
          "reasoning": "short explanation"
        }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/```json|```/g, '').trim();
    try {
        return JSON.parse(text);
    } catch (e) {
        return { technical_accuracy: 50, communication_clarity: 50, confidence_score: 50, cheating_risk_score: 0, reasoning: "Error parsing AI analysis" };
    }
}

/**
 * Finalize Interview & Generate Report
 */
async function finalizeInterview(req, res, session, allPairs) {
    const prompt = `
        Complete Interview Analysis for ${session.Application.Candidate.name}.
        Role: ${session.Application.Job.title}.
        Full Transcript of 10 Questions:
        ${allPairs.map(p => `Q: ${p.question}\nA: ${p.answer}`).join('\n\n')}

        Return STRICT JSON for final report:
        {
          "technical_score": 0-100,
          "communication_score": 0-100,
          "confidence_score": 0-100,
          "behavioral_score": 0-100,
          "cheating_risk": 0-100,
          "strengths": ["list of 3 strengths"],
          "weaknesses": ["list of 3 weaknesses"],
          "final_decision": "SELECTED / REJECTED / REVIEW",
          "reason": "Detailed rationale"
        }
    `;

    const result = await model.generateContent(prompt);
    let finalJson = result.response.text().replace(/```json|```/g, '').trim();
    const finalReport = JSON.parse(finalJson);

    // Store in DB
    await InterviewAnalysis.create({
        application_id: session.application_id,
        transcript: allPairs.map(p => `Q: ${p.question}\nA: ${p.answer}`).join('\n\n'),
        qa_pairs: allPairs,
        communication_score: finalReport.communication_score,
        technical_knowledge_score: finalReport.technical_score,
        soft_skills_score: finalReport.behavioral_score,
        behavioral_score: finalReport.behavioral_score,
        cheating_risk_score: finalReport.cheating_risk,
        overall_score: (finalReport.technical_score + finalReport.communication_score + finalReport.behavioral_score) / 3,
        strengths: finalReport.strengths,
        weaknesses: finalReport.weaknesses,
        hire_recommendation: finalReport.final_decision.toLowerCase(),
        detailed_evaluation: finalReport.reason
    });

    // Update Application
    await session.Application.update({ 
        status: 'INTERVIEW_COMPLETED',
        interview_score: (finalReport.technical_score + finalReport.communication_score + finalReport.behavioral_score) / 3
    });

    await session.update({ status: 'COMPLETED' });

    res.json({
        success: true,
        message: "Interview Completed Successfully",
        report: finalReport
    });
}
