const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

const aiServiceClient = axios.create({
  baseURL: AI_SERVICE_URL,
  timeout: 30000,
});

/**
 * Resume parsing integration
 */
const parseResumeWithAI = async (filePath) => {
  try {
    const formData = new FormData();
    const fileStream = require('fs').createReadStream(filePath);
    formData.append('file', fileStream);

    const response = await aiServiceClient.post('/api/resume/parse', formData, {
      headers: formData.getHeaders(),
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Resume Parse Error: ${error.message}`);
  }
};

/**
 * Score resume against job requirements
 */
const scoreResume = async (parsedResume, jobRequirements) => {
  try {
    const response = await aiServiceClient.post('/api/resume/score', {
      parsed_resume: parsedResume,
      job_requirements: jobRequirements,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Resume Score Error: ${error.message}`);
  }
};

/**
 * Generate resume summary
 */
const generateResumeSummary = async (parsedResume) => {
  try {
    const response = await aiServiceClient.post('/api/resume/summary', {
      parsed_resume: parsedResume,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Resume Summary Error: ${error.message}`);
  }
};

/**
 * Analyze coding solution
 */
const analyzeCodingSolution = async (code, problemDescription) => {
  try {
    const response = await aiServiceClient.post('/api/assessment/coding', {
      code,
      problem: problemDescription,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Coding Analysis Error: ${error.message}`);
  }
};

/**
 * Analyze MCQ test responses
 */
const analyzeMCQTest = async (questions, answers) => {
  try {
    const response = await aiServiceClient.post('/api/assessment/mcq', {
      questions,
      answers,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - MCQ Analysis Error: ${error.message}`);
  }
};

/**
 * Analyze system design
 */
const analyzeSystemDesign = async (designDescription, requirements) => {
  try {
    const response = await aiServiceClient.post('/api/assessment/design', {
      design: designDescription,
      requirements,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Design Analysis Error: ${error.message}`);
  }
};

/**
 * Analyze case study response
 */
const analyzeCaseStudy = async (caseDescription, solution) => {
  try {
    const response = await aiServiceClient.post('/api/assessment/case-study', {
      case: caseDescription,
      solution,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Case Study Analysis Error: ${error.message}`);
  }
};

/**
 * Generate assessment report
 */
const generateAssessmentReport = async (results) => {
  try {
    const response = await aiServiceClient.post('/api/assessment/report', {
      results,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Report Generation Error: ${error.message}`);
  }
};

/**
 * Analyze interview session
 */
const analyzeInterview = async (transcript, interviewDetails = {}) => {
  try {
    const response = await aiServiceClient.post('/api/interview/analyze', {
      transcript,
      details: interviewDetails,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Interview Analysis Error: ${error.message}`);
  }
};

/**
 * Analyze single interview answer
 */
const analyzeInterviewAnswer = async (question, answer) => {
  try {
    const response = await aiServiceClient.post('/api/interview/answer', {
      question,
      answer,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Answer Analysis Error: ${error.message}`);
  }
};

/**
 * Predict interview performance
 */
const predictInterviewPerformance = async (interviewData) => {
  try {
    const response = await aiServiceClient.post('/api/interview/performance-prediction', interviewData);

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Performance Prediction Error: ${error.message}`);
  }
};

/**
 * Analyze speaking patterns
 */
const analyzeSpeakingPatterns = async (transcript) => {
  try {
    const response = await aiServiceClient.post('/api/interview/speaking-patterns', {
      transcript,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Speaking Patterns Error: ${error.message}`);
  }
};

/**
 * Generate assessment summary
 */
const generateAssessmentSummary = async (assessmentData) => {
  try {
    const response = await aiServiceClient.post('/api/summary/assessment', assessmentData);

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Assessment Summary Error: ${error.message}`);
  }
};

/**
 * Generate interview summary
 */
const generateInterviewSummary = async (interviewData) => {
  try {
    const response = await aiServiceClient.post('/api/summary/interview', interviewData);

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Interview Summary Error: ${error.message}`);
  }
};

/**
 * Compare candidates
 */
const compareCandidates = async (candidates) => {
  try {
    const response = await aiServiceClient.post('/api/candidates/compare', {
      candidates,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Candidate Comparison Error: ${error.message}`);
  }
};

/**
 * Generate feedback
 */
const generateFeedback = async (context, type = 'general') => {
  try {
    const response = await aiServiceClient.post('/api/feedback/generate', {
      context,
      type,
    });

    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Feedback Generation Error: ${error.message}`);
  }
};

/**
 * Health check
 */
const healthCheck = async () => {
  try {
    const response = await aiServiceClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error(`AI Service - Health Check Error: ${error.message}`);
  }
};

/**
 * Get service capabilities
 */
const getCapabilities = async () => {
  try {
    const response = await aiServiceClient.get('/capabilities');
    return response.data.capabilities;
  } catch (error) {
    throw new Error(`AI Service - Get Capabilities Error: ${error.message}`);
  }
};

/**
 * Analyze theory-based assessment responses
 */
const analyzeAssessmentResponse = async (assessmentData) => {
  try {
    const response = await aiServiceClient.post('/api/assessment/analyze-response', assessmentData);
    return response.data.data;
  } catch (error) {
    throw new Error(`AI Service - Assessment Response Analysis Error: ${error.message}`);
  }
};

module.exports = {
  // Resume operations
  parseResumeWithAI,
  scoreResume,
  generateResumeSummary,

  // Assessment operations
  analyzeCodingSolution,
  analyzeMCQTest,
  analyzeSystemDesign,
  analyzeCaseStudy,
  analyzeAssessmentResponse,
  generateAssessmentReport,

  // Interview operations
  analyzeInterview,
  analyzeInterviewAnswer,
  predictInterviewPerformance,
  analyzeSpeakingPatterns,

  // Summary operations
  generateAssessmentSummary,
  generateInterviewSummary,
  compareCandidates,
  generateFeedback,

  // Service operations
  healthCheck,
  getCapabilities,
};
