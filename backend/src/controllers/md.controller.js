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
    const applications = await Application.findAll({
      attributes: ['id', 'overall_score', 'status', 'applied_at'],
      include: [
        { model: Candidate, attributes: ['id'], include: [{ model: User, attributes: ['name', 'email'] }] },
        { model: Job, attributes: ['title'] },
        { model: TechnicalRound, attributes: ['score', 'status'] },
        { model: MalpracticeEvent, attributes: ['severity'] }
      ]
    });

    const enriched = applications.map((app) => {
      const score = app.overall_score || 0;
      const malpracticeScore = (app.MalpracticeEvents || []).reduce((sum, e) => sum + (e.severity || 0), 0);

      const recommendation = getRecommendation(score, malpracticeScore);

      return {
        ...app.toJSON(),
        candidate: { name: app.Candidate?.User?.name || 'Unknown' },
        score: app.overall_score || 0,
        ai_recommendation: recommendation,
        malpracticeScore
      };
    });

    res.json(enriched);

  } catch (err) {
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
      app.status = "OFFERED";

      await Offer.create({
        application_id: app.id,
        salary: 1000000,
        joining_date: new Date()
      });

    } else {
      app.status = "REJECTED";
    }

    await app.save();

    res.json({
      message: "MD decision applied successfully",
      app
    });

  } catch (err) {
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

    const selected = await Application.count({
      where: { status: "OFFERED" }
    });

    const rejected = await Application.count({
      where: { status: "REJECTED" }
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
      selectionRate: ((selected / total) * 100).toFixed(2),
      scoreDistribution
    });

  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};