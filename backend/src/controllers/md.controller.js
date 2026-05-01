const {
  Application,
  Candidate,
  Job,
  TechnicalRound,
  Offer,
  MalpracticeEvent,
  User
} = require("../models");

// 🔥 AI Recommendation Logic
function getRecommendation(score, malpracticeScore) {
  if (malpracticeScore >= 8) return "REJECT";

  if (score >= 80) return "STRONGLY_RECOMMENDED";
  if (score >= 60) return "RECOMMENDED";
  if (score >= 40) return "AVERAGE";

  return "REJECT";
}

async function getMalpracticeScore(application_id) {
  const events = await MalpracticeEvent.findAll({
    where: { application_id }
  });

  return events.reduce((sum, e) => sum + e.severity, 0);
}

// 📊 MAIN API
exports.getMDApplications = async (req, res) => {
  try {
    const { AssessmentAnalysis, InterviewAnalysis } = require("../models");
    
    const applications = await Application.findAll({
      attributes: ['id', 'overall_score', 'status', 'applied_at'],
      include: [
        { model: Candidate, attributes: ['id', 'experience_years', 'candidate_type', 'domain', 'area_of_interest', 'current_company', 'working_address'], include: [{ model: User, attributes: ['name', 'email'] }] },
        { model: Job, attributes: ['title', 'department'] },
        { model: TechnicalRound, attributes: ['score', 'status'] },
        { model: MalpracticeEvent, attributes: ['severity'] },
        { model: AssessmentAnalysis, attributes: ['strengths', 'weaknesses'] },
        { model: InterviewAnalysis, attributes: ['detailed_evaluation', 'hire_recommendation'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const enriched = applications.map((app) => {
      const score = app.overall_score || 0;
      const malpracticeScore = (app.MalpracticeEvents || []).reduce((sum, e) => sum + (e.severity || 0), 0);
      const recommendation = getRecommendation(score, malpracticeScore);

      // Map pros/cons from analyses
      const assessment = app.AssessmentAnalysis;
      const pros = Array.isArray(assessment?.strengths) ? assessment.strengths : [];
      const cons = Array.isArray(assessment?.weaknesses) ? assessment.weaknesses : [];

      return {
        ...app.toJSON(),
        candidate: {
          name: app.Candidate?.User?.name || 'Unknown',
          email: app.Candidate?.User?.email || '',
          experience_years: app.Candidate?.experience_years || 0,
          candidate_type: app.Candidate?.candidate_type || null,
          domain: app.Candidate?.domain || null,
          area_of_interest: app.Candidate?.area_of_interest || null,
          current_company: app.Candidate?.current_company || null,
          working_address: app.Candidate?.working_address || null,
        },
        score: app.overall_score || 0,
        ai_recommendation: recommendation,
        malpracticeScore,
        AIDecision: {
          pros: pros,
          cons: cons,
          ai_decision: recommendation,
          score: score
        }
      };
    });

    res.json(enriched);

  } catch (err) {
    console.error("MD Applications Fetch Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.mdDecision = async (req, res) => {
  try {
    const { application_id, decision } = req.body;

    const app = await Application.findByPk(application_id);

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (decision === "APPROVED") {
      // Correct status for global consistency
      app.status = "SELECTED";
    } else {
      app.status = "REJECTED";
    }

    await app.save();

    res.json({
      message: `Application ${decision.toLowerCase()} successfully`,
      app
    });

  } catch (err) {
    console.error("MD Decision Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTopCandidates = async (req, res) => {
  try {
    const applications = await Application.findAll({
      attributes: ['overall_score'],
      include: [
        { model: Candidate, attributes: ['id'], include: [{ model: User, attributes: ['name'] }] },
        { model: Job, attributes: ['title'] }
      ]
    });

    const ranked = applications
      .map(app => ({
        candidate: app.Candidate?.User?.name || 'Unknown',
        job: app.Job?.title || 'N/A',
        score: app.overall_score || 0
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(ranked);

  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const total = await Application.count();

    // Align with global status enums
    const selected = await Application.count({
      where: { 
        status: { 
          [require('sequelize').Op.in]: ['SELECTED', 'HIRED'] 
        } 
      }
    });

    const rejected = await Application.count({
      where: { 
        status: { 
          [require('sequelize').Op.in]: ['REJECTED', 'AUTO_REJECTED'] 
        } 
      }
    });

    // Analytics based on overall score
    const high = await Application.count({ where: { overall_score: { [require('sequelize').Op.gte]: 80 } } });
    const medium = await Application.count({ where: { overall_score: { [require('sequelize').Op.between]: [50, 79] } } });
    const low = await Application.count({ where: { overall_score: { [require('sequelize').Op.lt]: 50 } } });

    const scoreDistribution = { high, medium, low };

    res.json({
      total,
      selected,
      rejected,
      selectionRate: total > 0 ? ((selected / total) * 100).toFixed(1) : "0.0",
      scoreDistribution
    });

  } catch (err) {
    console.error("MD Analytics Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};