const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const JSON_TYPE = sequelize.getDialect() === 'postgres' ? DataTypes.JSONB : DataTypes.JSON;
  const ARRAY_STRING = sequelize.getDialect() === 'postgres' ? DataTypes.ARRAY(DataTypes.STRING) : DataTypes.JSON;

  return sequelize.define(
    "InterviewAnalysis",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      application_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      interview_session_id: {
        type: DataTypes.INTEGER,
        comment: "Reference to interview session",
      },
      // Interview Metadata
      interview_type: {
        type: DataTypes.ENUM("technical", "hr", "behavioral", "system_design"),
        comment: "Type of interview conducted",
      },
      interviewer_name: {
        type: DataTypes.STRING,
      },
      interview_duration_minutes: {
        type: DataTypes.INTEGER,
      },
      // Transcript & Raw Data
      transcript: {
        type: DataTypes.TEXT,
        comment: "Full interview transcript",
      },
      qa_pairs: {
        type: JSON_TYPE,
        comment: "Array of {question, answer, analysis_score}",
      },
      // Overall Scoring
      overall_score: {
        type: DataTypes.FLOAT,
        comment: "Overall interview score (0-100)",
      },
      // Component Scores (Weighted)
      technical_knowledge_score: {
        type: DataTypes.FLOAT,
        comment: "Technical depth & breadth (0-100)",
        defaultValue: null,
      },
      problem_solving_score: {
        type: DataTypes.FLOAT,
        comment: "Approach & logical thinking (0-100)",
        defaultValue: null,
      },
      communication_score: {
        type: DataTypes.FLOAT,
        comment: "Clarity, articulation, listening (0-100)",
        defaultValue: null,
      },
      soft_skills_score: {
        type: DataTypes.FLOAT,
        comment: "Teamwork, adaptability, leadership (0-100)",
        defaultValue: null,
      },
      cultural_fit_score: {
        type: DataTypes.FLOAT,
        comment: "Values alignment, work style (0-100)",
        defaultValue: null,
      },
      // Individual Answer Analysis
      answer_analyses: {
        type: JSON_TYPE,
        comment: "[{question_id, relevance: 0-100, completeness: 0-100, clarity: 0-100, confidence: high|medium|low, feedback: string}]",
      },
      // Performance Indicators
      confidence_level: {
        type: DataTypes.ENUM("high", "medium", "low"),
        comment: "Observed confidence during interview",
      },
      communication_style: {
        type: DataTypes.STRING,
        comment: "e.g., formal, conversational, technical",
      },
      pace: {
        type: DataTypes.ENUM("fast", "normal", "slow"),
        comment: "Speaking pace analysis",
      },
      clarity: {
        type: DataTypes.ENUM("very_clear", "clear", "somewhat_clear", "unclear"),
        comment: "Speech clarity assessment",
      },
      hesitation_level: {
        type: DataTypes.ENUM("high", "medium", "low"),
        comment: "Amount of hesitation or pauses",
      },
      vocabulary_level: {
        type: DataTypes.ENUM("advanced", "intermediate", "basic"),
        comment: "Sophistication of vocabulary used",
      },
      // Qualitative Analysis
      strengths: {
        type: ARRAY_STRING,
        comment: "Demonstrated strengths",
      },
      weaknesses: {
        type: ARRAY_STRING,
        comment: "Areas of concern",
      },
      key_takeaways: {
        type: ARRAY_STRING,
        comment: "Important observations",
      },
      // Behavioral Indicators
      green_flags: {
        type: ARRAY_STRING,
        comment: "Positive signals observed",
      },
      red_flags: {
        type: ARRAY_STRING,
        comment: "Concerning signals observed",
      },
      // Performance Prediction
      predicted_on_job_performance: {
        type: DataTypes.ENUM("high", "medium", "low"),
        comment: "Predicted actual job performance",
      },
      performance_confidence_percentage: {
        type: DataTypes.FLOAT,
        comment: "Confidence in prediction (0-100)",
      },
      time_to_productivity_months: {
        type: DataTypes.INTEGER,
        comment: "Estimated months to full productivity",
      },
      retention_probability_percentage: {
        type: DataTypes.FLOAT,
        comment: "Likelihood to stay with company (0-100)",
      },
      team_fit_assessment: {
        type: DataTypes.ENUM("good", "fair", "poor"),
        comment: "How well they'll fit the team",
      },
      growth_trajectory: {
        type: DataTypes.ENUM("fast", "moderate", "slow"),
        comment: "Expected career growth speed",
      },
      // Recommendations
      follow_up_questions: {
        type: ARRAY_STRING,
        comment: "Questions for next round or clarification",
      },
      further_discussion_topics: {
        type: ARRAY_STRING,
        comment: "Topics to explore further",
      },
      // AI Recommendation
      hire_recommendation: {
        type: DataTypes.ENUM("strong_yes", "yes", "maybe", "no", "strong_no"),
        comment: "AI's hiring recommendation",
      },
      recommendation_confidence: {
        type: DataTypes.FLOAT,
        comment: "Confidence in recommendation (0-100)",
      },
      next_round_ready: {
        type: DataTypes.BOOLEAN,
        comment: "Ready for next round of interviews",
      },
      // Explainability
      detailed_evaluation: {
        type: DataTypes.TEXT,
        comment: "Comprehensive evaluation summary",
      },
      scoring_rationale: {
        type: DataTypes.TEXT,
        comment: "Explanation of how scores were calculated",
      },
      // Metadata
      ai_model_used: {
        type: DataTypes.STRING,
        defaultValue: "gemini-1.5-flash-latest",
        comment: "AI model used for analysis",
      },
      analysis_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      analyzed_by: {
        type: DataTypes.STRING,
        comment: "HR/Interviewer who conducted interview",
      },
    },
    {
      tableName: "interview_analysis",
      timestamps: true,
    }
  );
};
