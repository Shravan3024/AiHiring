/**
 * Question Randomizer Service
 * Ensures fair assessment: randomized questions, difficulty balance, role-specific selection
 */

const QuestionRandomizer = {
  /**
   * Get randomized interview questions for a candidate
   * Ensures: 1) Fair difficulty distribution, 2) No repeats, 3) Role-specific
   */
  getRandomizedInterviewQuestions: async (
    jobRole,
    questionCount = 5,
    InterviewQuestionBank
  ) => {
    try {
      // Step 1: Get all questions for this role
      const allQuestions = await InterviewQuestionBank.findAll({
        where: { jobRole },
        attributes: [
          "id",
          "questionId",
          "question",
          "category",
          "difficulty",
          "estimatedTime",
        ],
      });

      if (allQuestions.length < questionCount) {
        throw new Error(
          `Not enough questions for role ${jobRole}. Available: ${allQuestions.length}, Requested: ${questionCount}`
        );
      }

      // Step 2: Balance difficulty distribution
      const byDifficulty = {
        EASY: allQuestions.filter((q) => q.difficulty === "EASY"),
        MEDIUM: allQuestions.filter((q) => q.difficulty === "MEDIUM"),
        HARD: allQuestions.filter((q) => q.difficulty === "HARD"),
      };

      // Step 3: Select balanced mix (for 5 questions: 1 EASY, 2 MEDIUM, 2 HARD)
      const distribution = this.calculateDifficultyDistribution(
        questionCount
      );
      const selectedQuestions = [];

      for (const [difficulty, count] of Object.entries(distribution)) {
        const available = byDifficulty[difficulty];
        const shuffled = this.shuffleArray(available);
        selectedQuestions.push(...shuffled.slice(0, count));
      }

      // Step 4: Final shuffle to randomize order
      const randomized = this.shuffleArray(selectedQuestions);

      return {
        jobRole,
        totalQuestions: randomized.length,
        estimatedTotalTime: randomized.reduce(
          (sum, q) => sum + q.estimatedTime,
          0
        ),
        questions: randomized.map((q, idx) => ({
          sequenceNumber: idx + 1,
          questionId: q.questionId,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          estimatedTime: q.estimatedTime,
        })),
        meta: {
          randomizationSeed: Date.now(),
          balancedDistribution: distribution,
        },
      };
    } catch (error) {
      console.error("Error generating randomized questions:", error);
      throw error;
    }
  },

  /**
   * Calculate fair difficulty distribution
   * For 5 questions: 1 EASY, 2 MEDIUM, 2 HARD (or similar based on count)
   */
  calculateDifficultyDistribution: (questionCount) => {
    const distributions = {
      3: { EASY: 1, MEDIUM: 1, HARD: 1 },
      4: { EASY: 1, MEDIUM: 2, HARD: 1 },
      5: { EASY: 1, MEDIUM: 2, HARD: 2 },
      6: { EASY: 1, MEDIUM: 2, HARD: 3 },
      8: { EASY: 1, MEDIUM: 3, HARD: 4 },
      10: { EASY: 2, MEDIUM: 3, HARD: 5 },
    };

    // Default: prefer more hard questions for experienced roles
    const defaultDistribution = {
      EASY: Math.ceil(questionCount * 0.15),
      MEDIUM: Math.ceil(questionCount * 0.35),
      HARD: Math.floor(questionCount * 0.5),
    };

    return (
      distributions[questionCount] || {
        EASY: Math.max(1, Math.ceil(questionCount * 0.15)),
        MEDIUM: Math.ceil(questionCount * 0.35),
        HARD: Math.max(1, Math.floor(questionCount * 0.5)),
      }
    );
  },

  /**
   * Get technical assessment questions (MCQ, Coding, Theory, Debugging)
   */
  getRandomizedTechnicalQuestions: async (
    jobRole,
    TechnicalQuestionBank,
    config = {}
  ) => {
    const {
      mcqCount = 10,
      codingCount = 2,
      theoryCount = 3,
      debuggingCount = 1,
    } = config;

    try {
      const types = {
        MCQ: mcqCount,
        CODING: codingCount,
        THEORY: theoryCount,
        DEBUGGING: debuggingCount,
      };

      const selectedQuestions = [];

      for (const [type, count] of Object.entries(types)) {
        const questions = await TechnicalQuestionBank.findAll({
          where: { jobRole, questionType: type },
          order: [["id", "DESC"]], // Get recent questions first
          limit: count * 2, // Get 2x to have options
        });

        const shuffled = this.shuffleArray(questions);
        selectedQuestions.push(
          ...shuffled.slice(0, count).map((q, idx) => ({
            ...q.dataValues,
            sequenceNumber: selectedQuestions.length + idx + 1,
          }))
        );
      }

      const shuffled = this.shuffleArray(selectedQuestions);

      return {
        jobRole,
        assessmentType: "TECHNICAL_ROUND",
        totalQuestions: shuffled.length,
        breakdown: {
          MCQ: mcqCount,
          CODING: codingCount,
          THEORY: theoryCount,
          DEBUGGING: debuggingCount,
        },
        questions: shuffled,
        timeLimit: {
          MCQ: mcqCount * 2, // 2 min per MCQ
          CODING: codingCount * 20, // 20 min per coding
          THEORY: theoryCount * 5, // 5 min per theory
          DEBUGGING: debuggingCount * 10, // 10 min per debugging
          total: mcqCount * 2 + codingCount * 20 + theoryCount * 5 + debuggingCount * 10,
        },
      };
    } catch (error) {
      console.error("Error generating technical questions:", error);
      throw error;
    }
  },

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  shuffleArray: (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * Validate question selection for fairness
   */
  validateQuestionSelection: (questions) => {
    const validation = {
      totalCount: questions.length,
      hasAllDifficulties:
        new Set(questions.map((q) => q.difficulty)).size > 1,
      averageDifficulty: this.calculateAverageDifficulty(questions),
      timeEstimate: questions.reduce((sum, q) => sum + q.estimatedTime, 0),
      isValid: true,
      warnings: [],
    };

    // Warning: All questions same difficulty
    if (!validation.hasAllDifficulties) {
      validation.warnings.push(
        "All questions have same difficulty level - may not be fair"
      );
      validation.isValid = false;
    }

    // Warning: Too many hard questions
    const hardCount = questions.filter((q) => q.difficulty === "HARD").length;
    if (hardCount / questions.length > 0.7) {
      validation.warnings.push(
        `${hardCount} out of ${questions.length} questions are HARD - may be too difficult`
      );
    }

    return validation;
  },

  calculateAverageDifficulty: (questions) => {
    const difficulty_score = { EASY: 1, MEDIUM: 2, HARD: 3 };
    const avg =
      questions.reduce(
        (sum, q) => sum + (difficulty_score[q.difficulty] || 0),
        0
      ) / questions.length;
    return avg.toFixed(2);
  },
};

module.exports = QuestionRandomizer;
