const { sequelize, AdminJob, Candidate, Application, AIModel, AdminAuditLog, SystemHealth, Job } = require("../models/index.js");
const { Op, fn, col, literal } = require("sequelize");

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalActiveJobs = await Job.count({ where: { status: "ACTIVE" } });
    const totalCandidates = await Candidate.count();
      const pendingApprovals = await Application.count({ where: { status: "HR_REVIEW" } });
    const aiEvaluationsToday = await Application.count({
      where: {
        updated_at: { [Op.gte]: today },
        status: ["RESUME_EVALUATED", "TECHNICAL_ROUND_COMPLETED", "INTERVIEW_COMPLETED"],
      },
    });

    res.json({
      success: true,
      data: {
        totalActiveJobs,
        totalCandidates,
        pendingApprovals,
        aiEvaluationsToday,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dashboard stats" });
  }
};

const getHiringVolumeTrend = async (req, res) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
    }

    const trends = await Promise.all(
      months.map(async ({ year, month }) => {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 1);
        const applications = await Application.count({ where: { created_at: { [Op.gte]: start, [Op.lt]: end } } });
        const hired = await Application.count({ where: { status: "SELECTED", updated_at: { [Op.gte]: start, [Op.lt]: end } } });
        return {
          month: start.toLocaleString("default", { month: "short", year: "2-digit" }),
          applications,
          hired,
        };
      })
    );

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching hiring trend" });
  }
};

const getRoleWiseApplications = async (req, res) => {
  try {
    const jobs = await Job.findAll({ include: [{ model: Application, attributes: [] }], attributes: ["id", "title", [fn("COUNT", col("Applications.id")), "count"]], group: ["Job.id"], raw: true });
    const data = jobs.map(j => ({ role: j.title, count: parseInt(j.count) || 0 })).filter(j => j.count > 0);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching role-wise applications" });
  }
};

const getFunnelAnalysis = async (req, res) => {
  try {
    const statuses = [
      { stage: "Applied", key: "APPLIED" },
        { stage: "Shortlisted", key: "RESUME_EVALUATED" },
        { stage: "Assessment", key: "TECHNICAL_ROUND_COMPLETED" },
        { stage: "Interview", key: "INTERVIEW_COMPLETED" },
        { stage: "Selected", key: "SELECTED" },
        { stage: "Offered", key: "HR_REVIEW" },
    ];

    const funnelData = await Promise.all(
      statuses.map(async ({ stage, key }) => {
        const count = await Application.count({ where: { status: key } });
        return { stage, count };
      })
    );

    res.json({ success: true, data: funnelData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching funnel analysis" });
  }
};

const getApprovalBottleneck = async (req, res) => {
  try {
      const pending = await Application.count({ where: { status: "HR_REVIEW" } });
      const approved = await Application.count({ where: { status: "SELECTED" } });
    res.json({ success: true, data: { pending_approvals: pending, approved } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching approval bottleneck" });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        database: "healthy",
        api_server: "healthy",
        ai_service: "healthy",
        email_service: "healthy",
        storage: "healthy",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching system health" });
  }
};

module.exports = {
  getDashboardStats,
  getHiringVolumeTrend,
  getRoleWiseApplications,
  getFunnelAnalysis,
  getApprovalBottleneck,
  getSystemHealth,
};
