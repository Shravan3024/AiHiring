const aiService = require('../services/ai.service');
const { Resume } = require('../models');

/**
 * Parse resume with AI enhancement
 */
exports.parseResumeWithAI = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded',
      });
    }

    // Parse with AI service
    const parsedData = await aiService.parseResumeWithAI(req.file.path);

    // Generate resume summary
    const summary = await aiService.generateResumeSummary(parsedData);

    // Combine results
    const enrichedData = {
      ...parsedData,
      ai_summary: summary,
      uploaded_at: new Date(),
      file_path: `/uploads/resumes/${req.file.filename}`,
    };

    // Save to database if candidateId provided
    if (req.body.candidateId) {
      await Resume.create({
        candidateId: req.body.candidateId,
        file_path: `/uploads/resumes/${req.file.filename}`,
        parsed_data: enrichedData,
        ai_analysis: summary,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Resume parsed successfully with AI analysis',
      data: enrichedData,
    });
  } catch (error) {
    console.error('Error parsing resume with AI:', error);
    return res.status(500).json({
      success: false,
      message: 'Error parsing resume',
      error: error.message,
    });
  }
};

/**
 * Score resume against job requirements
 */
exports.scoreResume = async (req, res) => {
  try {
    const { parsedResume, jobRequirements } = req.body;

    if (!parsedResume || !jobRequirements) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: parsedResume, jobRequirements',
      });
    }

    const score = await aiService.scoreResume(parsedResume, jobRequirements);

    return res.status(200).json({
      success: true,
      message: 'Resume scored successfully',
      data: score,
    });
  } catch (error) {
    console.error('Error scoring resume:', error);
    return res.status(500).json({
      success: false,
      message: 'Error scoring resume',
      error: error.message,
    });
  }
};

/**
 * Get AI-enhanced resume summary
 */
exports.getResumeSummary = async (req, res) => {
  try {
    const { parsedResume } = req.body;

    if (!parsedResume) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: parsedResume',
      });
    }

    const summary = await aiService.generateResumeSummary(parsedResume);

    return res.status(200).json({
      success: true,
      message: 'Resume summary generated successfully',
      data: summary,
    });
  } catch (error) {
    console.error('Error generating resume summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating resume summary',
      error: error.message,
    });
  }
};

/**
 * Analyze coding assessment
 */
exports.analyzeCodingAssessment = async (req, res) => {
  try {
    const { code, problemDescription } = req.body;

    if (!code || !problemDescription) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: code, problemDescription',
      });
    }

    const analysis = await aiService.analyzeCodingSolution(code, problemDescription);

    return res.status(200).json({
      success: true,
      message: 'Coding solution analyzed successfully',
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing coding:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing coding solution',
      error: error.message,
    });
  }
};

/**
 * Analyze MCQ assessment
 */
exports.analyzeMCQAssessment = async (req, res) => {
  try {
    const { questions, answers } = req.body;

    if (!questions || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: questions, answers',
      });
    }

    const analysis = await aiService.analyzeMCQTest(questions, answers);

    return res.status(200).json({
      success: true,
      message: 'MCQ assessment analyzed successfully',
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing MCQ:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing MCQ assessment',
      error: error.message,
    });
  }
};

/**
 * Analyze system design assessment
 */
exports.analyzeSystemDesign = async (req, res) => {
  try {
    const { designDescription, requirements } = req.body;

    if (!designDescription || !requirements) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: designDescription, requirements',
      });
    }

    const analysis = await aiService.analyzeSystemDesign(designDescription, requirements);

    return res.status(200).json({
      success: true,
      message: 'System design analyzed successfully',
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing system design:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing system design',
      error: error.message,
    });
  }
};

/**
 * Analyze case study assessment
 */
exports.analyzeCaseStudy = async (req, res) => {
  try {
    const { caseDescription, solution } = req.body;

    if (!caseDescription || !solution) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: caseDescription, solution',
      });
    }

    const analysis = await aiService.analyzeCaseStudy(caseDescription, solution);

    return res.status(200).json({
      success: true,
      message: 'Case study analyzed successfully',
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing case study:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing case study',
      error: error.message,
    });
  }
};

/**
 * Generate assessment report
 */
exports.generateAssessmentReport = async (req, res) => {
  try {
    const { results } = req.body;

    if (!results) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: results',
      });
    }

    const report = await aiService.generateAssessmentReport(results);

    return res.status(200).json({
      success: true,
      message: 'Assessment report generated successfully',
      data: report,
    });
  } catch (error) {
    console.error('Error generating assessment report:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating assessment report',
      error: error.message,
    });
  }
};

/**
 * Analyze interview
 */
exports.analyzeInterview = async (req, res) => {
  try {
    const { applicationId, transcript, interviewType } = req.body;
    const { InterviewSession, InterviewAnalysis, Application, Job, Interview } = require('../models');

    let finalTranscript = transcript;
    let qaPairs = [];

    // 1. If transcript missing, try fetching from InterviewSession
    if (!finalTranscript || finalTranscript.trim() === "") {
      const session = await InterviewSession.findOne({ 
        where: { application_id: applicationId },
        order: [['created_at', 'DESC']]
      });
      
      if (session && session.answers_provided) {
        qaPairs = session.answers_provided;
        finalTranscript = qaPairs.map(q => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n");
      }
    }

    if (!finalTranscript && qaPairs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No transcript or session data found for analysis.',
      });
    }

    const application = await Application.findByPk(applicationId, { include: [Job] });
    if (!application) return res.status(404).json({ success: false, message: "Application not found" });

    // 2. Execute Full AI Analysis
    const analysis = await aiService.analyzeFullInterview(qaPairs.length > 0 ? qaPairs : finalTranscript, application.Job?.title || "Professional");

    // 3. Save to InterviewAnalysis
    const [interviewAnalysis, created] = await InterviewAnalysis.findOrCreate({
      where: { application_id: applicationId },
      defaults: {
        transcript: finalTranscript,
        qa_pairs: qaPairs,
        overall_score: analysis.overall_interview_score || 50,
        technical_knowledge_score: analysis.dimension_scores?.technical || 50,
        communication_score: analysis.dimension_scores?.communication || 50,
        confidence_level: analysis.dimension_scores?.confidence > 70 ? 'HIGH' : 'MEDIUM',
        hire_recommendation: analysis.recommendation || 'CONSIDER',
        detailed_evaluation: analysis.highlights?.summary || "Analysis completed.",
        ai_model_used: "gemini-2.5-flash"
      }
    });

    if (!created) {
      await interviewAnalysis.update({
        transcript: finalTranscript,
        qa_pairs: qaPairs,
        overall_score: analysis.overall_interview_score || 50,
        technical_knowledge_score: analysis.dimension_scores?.technical || 50,
        communication_score: analysis.dimension_scores?.communication || 50,
        confidence_level: analysis.dimension_scores?.confidence > 70 ? 'HIGH' : 'MEDIUM',
        hire_recommendation: analysis.recommendation || 'CONSIDER',
        detailed_evaluation: analysis.highlights?.summary || "Analysis completed."
      });
    }

    // 4. Update Application and Interview records
    await application.update({
      interview_score: analysis.overall_interview_score || 50,
      final_decision: analysis.recommendation,
      role_recommendation: analysis.recommendation,
      ai_rationale: analysis.highlights?.summary
    });

    const [interview] = await Interview.findOrCreate({
      where: { application_id: applicationId },
      defaults: {
        ai_score: analysis.overall_interview_score || 50,
        ai_summary: analysis.highlights?.summary,
        status: 'COMPLETED'
      }
    });

    if (interview) {
      await interview.update({
        ai_score: analysis.overall_interview_score || 50,
        ai_summary: analysis.highlights?.summary,
        status: 'COMPLETED'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview analyzed successfully',
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing interview:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing interview',
      error: error.message,
    });
  }
};

/**
 * Analyze single interview answer
 */
exports.analyzeInterviewAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: question, answer',
      });
    }

    const analysis = await aiService.analyzeInterviewAnswer(question, answer);

    return res.status(200).json({
      success: true,
      message: 'Interview answer analyzed successfully',
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing interview answer:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing interview answer',
      error: error.message,
    });
  }
};

/**
 * Predict interview performance
 */
exports.predictPerformance = async (req, res) => {
  try {
    const interviewData = req.body;

    if (!interviewData || Object.keys(interviewData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing interview data',
      });
    }

    const prediction = await aiService.predictInterviewPerformance(interviewData);

    return res.status(200).json({
      success: true,
      message: 'Performance prediction generated successfully',
      data: prediction,
    });
  } catch (error) {
    console.error('Error predicting performance:', error);
    return res.status(500).json({
      success: false,
      message: 'Error predicting performance',
      error: error.message,
    });
  }
};

/**
 * Analyze speaking patterns
 */
exports.analyzeSpeakingPatterns = async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: transcript',
      });
    }

    const patterns = await aiService.analyzeSpeakingPatterns(transcript);

    return res.status(200).json({
      success: true,
      message: 'Speaking patterns analyzed successfully',
      data: patterns,
    });
  } catch (error) {
    console.error('Error analyzing speaking patterns:', error);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing speaking patterns',
      error: error.message,
    });
  }
};

/**
 * Compare candidates
 */
exports.compareCandidates = async (req, res) => {
  try {
    const { candidates } = req.body;

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: candidates (array)',
      });
    }

    const comparison = await aiService.compareCandidates(candidates);

    return res.status(200).json({
      success: true,
      message: 'Candidates compared successfully',
      data: comparison,
    });
  } catch (error) {
    console.error('Error comparing candidates:', error);
    return res.status(500).json({
      success: false,
      message: 'Error comparing candidates',
      error: error.message,
    });
  }
};

/**
 * Generate feedback
 */
exports.generateFeedback = async (req, res) => {
  try {
    const { context, type } = req.body;

    if (!context) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: context',
      });
    }

    const feedback = await aiService.generateFeedback(context, type || 'general');

    return res.status(200).json({
      success: true,
      message: 'Feedback generated successfully',
      data: feedback,
    });
  } catch (error) {
    console.error('Error generating feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating feedback',
      error: error.message,
    });
  }
};

/**
 * AI Service health check
 */
exports.healthCheck = async (req, res) => {
  try {
    const status = await aiService.healthCheck();

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    console.error('Error checking AI service health:', error);
    return res.status(500).json({
      success: false,
      message: 'AI service is not available',
      error: error.message,
    });
  }
};

/**
 * Get AI service capabilities
 */
exports.getCapabilities = async (req, res) => {
  try {
    const capabilities = await aiService.getCapabilities();

    return res.status(200).json({
      success: true,
      data: capabilities,
    });
  } catch (error) {
    console.error('Error getting AI capabilities:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting AI service capabilities',
      error: error.message,
    });
  }
};

/**
 * Candidate Chatbot Endpoint
 */
exports.chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const response = await aiService.chatWithAI(message, history || []);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error in AI Chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during AI chat',
      error: error.message,
    });
  }
};
