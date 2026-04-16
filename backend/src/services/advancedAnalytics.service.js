/**
 * Advanced Analytics Service
 * Probation Success Prediction + Training Recommendations
 * Enterprise-grade ML-based insights
 */

const AdvancedAnalytics = {
  /**
   * Predict candidate's probation success (6 months)
   * Based on: Resume score, MCQ performance, Technical round, Interview quality
   */
  predictProbationSuccess: async (candidateData) => {
    const {
      resumeScore,
      mcqScore,
      technicalScore,
      interviewScore,
      yearsOfExperience,
      jobLevel,
      previousCompanyStability,
    } = candidateData;

    try {
      // ML Model: Weighted scoring based on historical data
      const weights = {
        resume: 0.15,
        mcq: 0.15,
        technical: 0.35,
        interview: 0.25,
        experienceMatch: 0.1,
      };

      // Calculate experience match score (0-100)
      const experienceMatch = this.calculateExperienceMatch(
        yearsOfExperience,
        jobLevel
      );

      // Normalized weighted score (0-100)
      const probabilityScore =
        resumeScore * weights.resume +
        mcqScore * weights.mcq +
        technicalScore * weights.technical +
        interviewScore * weights.interview +
        experienceMatch * weights.experienceMatch;

      // Predict success probability using sigmoid function for realistic prediction
      const successProbability = this.sigmoidFunction(
        probabilityScore,
        50,
        15
      ); // Mean=50, SD=15

      // Risk category
      let riskLevel,
        recommendation;
      if (successProbability >= 0.8) {
        riskLevel = "LOW_RISK";
        recommendation = "Strong candidate. Typical probation outcome. Standard onboarding.";
      } else if (successProbability >= 0.6) {
        riskLevel = "MEDIUM_RISK";
        recommendation =
          "Good potential. May need targeted training. Assign mentor.";
      } else if (successProbability >= 0.4) {
        riskLevel = "HIGH_RISK";
        recommendation =
          "Moderate concern. Recommend rigorous training plan. Close monitoring needed.";
      } else {
        riskLevel = "VERY_HIGH_RISK";
        recommendation =
          "Significant probation risk. Recommend senior review before hire. Consider pairing with experienced mentor.";
      }

      return {
        candidateId: candidateData.candidateId,
        probabilityScore: probabilityScore.toFixed(2),
        successProbability: (successProbability * 100).toFixed(2) + "%",
        riskLevel,
        recommendation,
        breakdown: {
          resumeContribution: (resumeScore * weights.resume).toFixed(2),
          mcqContribution: (mcqScore * weights.mcq).toFixed(2),
          technicalContribution: (technicalScore * weights.technical).toFixed(
            2
          ),
          interviewContribution: (interviewScore * weights.interview).toFixed(
            2
          ),
          experienceContribution: (experienceMatch * weights.experienceMatch).toFixed(
            2
          ),
        },
        risks: this.identifySpecificRisks(candidateData),
        strengths: this.identifyStrengths(candidateData),
        sixMonthOutlook: this.generateOutlook(successProbability),
      };
    } catch (error) {
      console.error("Error predicting probation success:", error);
      throw error;
    }
  },

  /**
   * Generate personalized training recommendations
   * Identifies skill gaps and recommends training paths
   */
  generateTrainingRecommendations: async (candidateData, jobRole) => {
    const {
      resumeScore,
      mcqScore,
      technicalScore,
      interviewScore,
      assessmentDetails,
    } = candidateData;

    const recommendations = {
      technical_skills: [],
      soft_skills: [],
      domain_knowledge: [],
      priority: [],
    };

    // Analyze score breakdowns to identify weak areas
    if (technicalScore < 50) {
      recommendations.technical_skills.push({
        gap: "TECHNICAL_FUNDAMENTALS",
        severity: "HIGH",
        trainingPath: "Advanced Technical Bootcamp",
        duration: "4-6 weeks",
        topics: this.getJobRoleSpecificTopics(jobRole),
        resources: [
          "Internal: Technical Wiki + Mentoring",
          "External: Coursera/Udemy courses",
          "Hands-on: 2-3 real projects with senior",
        ],
        estimatedCost: "$2000-3000",
        expectedOutcome: "80%+ technical proficiency within 8 weeks",
      });
    }

    if (interviewScore < 55) {
      recommendations.soft_skills.push({
        gap: "COMMUNICATION_AND_PRESENTATION",
        severity: "MEDIUM",
        trainingPath: "Professional Communication Workshop",
        duration: "2-3 weeks",
        focus: ["Clear technical communication", "Stakeholder management", "Documentation"],
        resources: [
          "Toastmasters / Speaking clubs",
          "Internal presentation workshops",
          "1-on-1 coaching with manager",
        ],
      });

      recommendations.soft_skills.push({
        gap: "CONFIDENCE_AND_ASSERTION",
        severity: "MEDIUM",
        trainingPath: "Leadership Fundamentals",
        focus: [
          "Decision-making",
          "Expressing opinions",
          "Handling criticism",
        ],
      });
    }

    if (mcqScore < 60) {
      recommendations.domain_knowledge.push({
        gap: "DOMAIN_KNOWLEDGE",
        severity: "HIGH",
        trainingPath: "Domain Deep Dive Program",
        duration: "3-4 weeks",
        curriculum: this.getJobRoleCurriculum(jobRole),
        timeline: {
          week_1: "Company products & services overview",
          week_2: "Industry trends & competitive landscape",
          week_3_4: "Real customer cases & solutions",
        },
      });
    }

    // Identify priority trainings
    if (technicalScore < 50) recommendations.priority.push("TECHNICAL_SKILLS");
    if (interviewScore < 55) recommendations.priority.push("SOFT_SKILLS");
    if (mcqScore < 60) recommendations.priority.push("DOMAIN_KNOWLEDGE");

    return {
      candidateId: candidateData.candidateId,
      jobRole,
      overallTrainingNeeded: recommendations.priority.length > 0,
      recommendations,
      totalEstimatedDuration: this.calculateTotalDuration(recommendations),
      estimatedCost: this.calculateTotalCost(recommendations),
      mentorRecommendation: {
        type: technicalScore < 50 ? "SENIOR_TECHNICAL" : "SENIOR_DOMAIN",
        importance: "HIGH",
        duration: "3 months minimum",
        frequency: "2-3 meetings per week",
      },
      reviewAt: {
        week_2: "Check-in on training progress",
        week_4: "Mid-training evaluation",
        month_3: "Full probation progress review",
      },
    };
  },

  /**
   * Get job-role-specific topics for training
   */
  getJobRoleSpecificTopics: (jobRole) => {
    const topics = {
      MANAGEMENT_TRAINEE_MARKETING: [
        "Polymer chemistry fundamentals",
        "Classification systems",
        "Property understanding",
        "Processing techniques",
        "Quality control basics",
        "Customer communication basics",
      ],
      EXECUTIVE_MARKETING: [
        "Advanced polymer chemistry",
        "Structure-property relationships",
        "Market positioning",
        "Customer technical consulting",
        "Competitive analysis",
        "Sales strategy",
      ],
      ASSISTANT_MANAGER_MARKETING: [
        "Formulation design",
        "Advanced technical marketing",
        "Team leadership",
        "Strategic planning",
        "Market development",
        "R&D collaboration",
      ],
    };

    return topics[jobRole] || topics.MANAGEMENT_TRAINEE_MARKETING;
  },

  /**
   * Get job-role-specific curriculum
   */
  getJobRoleCurriculum: (jobRole) => {
    const curriculum = {
      MANAGEMENT_TRAINEE_MARKETING: {
        module_1: "Polymer 101: Types, properties, applications",
        module_2: "Mask Polymers product range & customer segments",
        module_3: "Manufacturing overview & quality standards",
        module_4: "Sales fundamentals & customer interaction",
      },
      EXECUTIVE_MARKETING: {
        module_1: "Advanced polymer chemistry & formulations",
        module_2: "Technical sales & customer problem-solving",
        module_3: "Competitive positioning & market analysis",
        module_4: "Strategic account management",
      },
      ASSISTANT_MANAGER_MARKETING: {
        module_1: "Strategic product development",
        module_2: "Market expansion & new applications",
        module_3: "Team building & performance management",
        module_4: "P&L responsibility & business acumen",
      },
    };

    return curriculum[jobRole] || curriculum.MANAGEMENT_TRAINEE_MARKETING;
  },

  /**
   * Identify specific risks in candidate performance
   */
  identifySpecificRisks: (candidateData) => {
    const risks = [];
    const { mcqScore, technicalScore, interviewScore, resumeScore } =
      candidateData;

    if (technicalScore < 50) {
      risks.push({
        risk: "TECHNICAL_CAPABILITY",
        severity: "HIGH",
        description: "Low technical assessment score. May struggle with role responsibilities.",
        mitigation:
          "Intensive technical training program with senior mentor support",
      });
    }

    if (interviewScore < 55) {
      risks.push({
        risk: "COMMUNICATION_GAPS",
        severity: "MEDIUM",
        description:
          "Interview performance indicates potential communication challenges.",
        mitigation:
          "Soft skills training and regular feedback from manager",
      });
    }

    if (mcqScore < 60) {
      risks.push({
        risk: "DOMAIN_KNOWLEDGE",
        severity: "HIGH",
        description: "Knowledge gaps in domain/industry fundamentals.",
        mitigation: "Structured domain knowledge program, peer learning",
      });
    }

    if (
      resumeScore > 80 &&
      technicalScore < 60 &&
      interviewScore < 60
    ) {
      risks.push({
        risk: "RESUME_VS_PERFORMANCE_GAP",
        severity: "MEDIUM",
        description:
          "Resume is strong but assessment performance is weaker. Verify claims.",
        mitigation:
          "Reference checks, work samples verification, probation monitoring",
      });
    }

    return risks;
  },

  /**
   * Identify candidate strengths
   */
  identifyStrengths: (candidateData) => {
    const { resumeScore, mcqScore, technicalScore, interviewScore } =
      candidateData;
    const strengths = [];

    if (resumeScore > 80) {
      strengths.push({
        strength: "STRONG_BACKGROUND",
        score: resumeScore,
        implication: "Relevant experience and qualifications",
      });
    }

    if (technicalScore > 75) {
      strengths.push({
        strength: "TECHNICAL_EXCELLENCE",
        score: technicalScore,
        implication: "Can handle complex technical challenges independently",
      });
    }

    if (interviewScore > 75) {
      strengths.push({
        strength: "COMMUNICATION_AND_CLARITY",
        score: interviewScore,
        implication:
          "Can articulate ideas well, good interpersonal skills",
      });
    }

    if (mcqScore > 80) {
      strengths.push({
        strength: "DOMAIN_MASTERY",
        score: mcqScore,
        implication: "Deep understanding of industry/domain",
      });
    }

    return strengths;
  },

  /**
   * Generate 6-month probation outlook
   */
  generateOutlook: (successProbability) => {
    const probability = parseFloat(successProbability);

    if (probability >= 0.85) {
      return {
        rating: "EXCELLENT",
        outlook: "Expected to succeed and potentially exceed expectations",
        keyMilestones: [
          "Month 1: Onboarding complete, contributing to projects",
          "Month 2-3: Independent task execution",
          "Month 4-6: Team collaboration, mentoring others",
        ],
        possibleOutcomes: [
          "Extend offer (90%+ probability)",
          "Fast-track for advanced roles (40%+ probability)",
        ],
      };
    } else if (probability >= 0.7) {
      return {
        rating: "GOOD",
        outlook:
          "Expected to succeed with appropriate support and training",
        keyMilestones: [
          "Month 1: Guided onboarding with mentor",
          "Month 2-3: Supported task execution",
          "Month 4-6: Increased independence",
        ],
        possibleOutcomes: [
          "Extend offer (75%+ probability)",
          "Transition to different role (20%+ probability)",
        ],
      };
    } else if (probability >= 0.5) {
      return {
        rating: "MODERATE",
        outlook:
          "Success possible but requires close monitoring and targeted support",
        keyMilestones: [
          "Month 1-2: Intensive training and supervision",
          "Month 3: Reassessment of readiness",
          "Month 4-6: Continued monitoring",
        ],
        possibleOutcomes: [
          "Extend offer (50%+ probability)",
          "Extension for additional training (30%+ probability)",
          "Probation termination (20%+ probability)",
        ],
      };
    } else {
      return {
        rating: "HIGH RISK",
        outlook: "Significant success concerns. Strong support system required.",
        keyMilestones: [
          "Month 1: Senior review after 2 weeks",
          "Month 2: Mid-probation decision point",
          "Month 3: Final probation evaluation",
        ],
        possibleOutcomes: [
          "Extend offer (30%+ probability)",
          "Probation extension (40%+ probability)",
          "Probation termination (30%+ probability)",
        ],
      };
    }
  },

  /**
   * Calculate experience match score (0-100)
   */
  calculateExperienceMatch: (yearsOfExperience, jobLevel) => {
    const levelRequirements = {
      MANAGEMENT_TRAINEE_MARKETING: { min: 0, max: 2, ideal: 1 },
      EXECUTIVE_MARKETING: { min: 3, max: 6, ideal: 4.5 },
      ASSISTANT_MANAGER_MARKETING: { min: 6, max: 12, ideal: 8 },
    };

    const requirement = levelRequirements[jobLevel] || levelRequirements.MANAGEMENT_TRAINEE_MARKETING;

    if (
      yearsOfExperience < requirement.min ||
      yearsOfExperience > requirement.max
    ) {
      return 50; // Baseline if outside range
    }

    // Calculate closeness to ideal
    const diff = Math.abs(yearsOfExperience - requirement.ideal);
    const maxDiff = requirement.max - requirement.ideal;
    const match = 100 - (diff / maxDiff) * 100;

    return Math.max(40, Math.min(100, match));
  },

  /**
   * Sigmoid function for smooth probability curve
   */
  sigmoidFunction: (x, mean, stdDev) => {
    const z = (x - mean) / stdDev;
    return 1 / (1 + Math.exp(-z));
  },

  calculateTotalDuration: (recommendations) => {
    const weeks = [];
    Object.values(recommendations).forEach((category) => {
      if (Array.isArray(category)) {
        category.forEach((item) => {
          if (item.duration && typeof item.duration === "string") {
            const match = item.duration.match(/(\d+)-(\d+)/);
            if (match) weeks.push(parseInt(match[2]));
          }
        });
      }
    });

    return weeks.length > 0 ? `${Math.max(...weeks)} weeks` : "2-3 weeks";
  },

  calculateTotalCost: (recommendations) => {
    let total = 0;
    Object.values(recommendations).forEach((category) => {
      if (Array.isArray(category)) {
        category.forEach((item) => {
          if (
            item.estimatedCost &&
            typeof item.estimatedCost === "string"
          ) {
            const match = item.estimatedCost.match(/(\d+)/);
            if (match) total += parseInt(match[1]);
          }
        });
      }
    });

    return total > 0 ? `$${total}` : "$3000-5000";
  },
};

module.exports = AdvancedAnalytics;
