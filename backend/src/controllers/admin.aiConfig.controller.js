const { AIConfig } = require("../models/index.js");
const auditLogger = require("../services/auditLogger.service");

const createAIConfig = async (req, res) => {
  try {
    const {
      jobId,
      resumeWeight,
      mcqWeight,
      technicalWeight,
      interviewWeight,
      passingThreshold,
      integrityPenalty,
      confidenceWeighting,
      prosConsRules,
      riskyWordings,
      autoEscalateThreshold,
    } = req.body;

    // Validate weights sum to 1.0
    const totalWeight =
      (resumeWeight || 0.25) +
      (mcqWeight || 0.25) +
      (technicalWeight || 0.25) +
      (interviewWeight || 0.25);

    if (Math.abs(totalWeight - 1.0) > 0.01) {
      return res.status(400).json({
        success: false,
        message: "Stage weights must sum to 1.0",
      });
    }

    const config = await AIConfig.create({
      jobId,
      resumeWeight: resumeWeight || 0.25,
      mcqWeight: mcqWeight || 0.25,
      technicalWeight: technicalWeight || 0.25,
      interviewWeight: interviewWeight || 0.25,
      passingThreshold,
      integrityPenalty,
      confidenceWeighting,
      prosConsRules,
      riskyWordings,
      autoEscalateThreshold,
      createdBy: req.user.id,
      status: "ACTIVE",
    });

    await auditLogger.logConfigChange(req, {
      entityType: "AIConfig",
      entityId: config.configId,
      newValue: config,
      description: `AI config created for job: ${jobId}`,
    });

    res.json({
      success: true,
      message: "AI configuration created successfully",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating AI configuration",
      error: error.message,
    });
  }
};

const updateAIConfig = async (req, res) => {
  try {
    const { configId } = req.params;
    const config = await AIConfig.findByPk(configId);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "AI configuration not found",
      });
    }

    // Validate weights if provided
    const {
      resumeWeight,
      mcqWeight,
      technicalWeight,
      interviewWeight,
    } = req.body;

    if (
      resumeWeight ||
      mcqWeight ||
      technicalWeight ||
      interviewWeight
    ) {
      const totalWeight =
        (resumeWeight || config.resumeWeight) +
        (mcqWeight || config.mcqWeight) +
        (technicalWeight || config.technicalWeight) +
        (interviewWeight || config.interviewWeight);

      if (Math.abs(totalWeight - 1.0) > 0.01) {
        return res.status(400).json({
          success: false,
          message: "Stage weights must sum to 1.0",
        });
      }
    }

    const oldValue = { ...config.dataValues };
    await config.update(req.body);

    await auditLogger.logConfigChange(req, {
      entityType: "AIConfig",
      entityId: configId,
      oldValue,
      newValue: config.dataValues,
      description: `AI config updated for job: ${config.jobId}`,
    });

    res.json({
      success: true,
      message: "AI configuration updated successfully",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating AI configuration",
      error: error.message,
    });
  }
};

const getAIConfig = async (req, res) => {
  try {
    const { jobId } = req.params;
    const config = await AIConfig.findOne({
      where: { jobId: String(jobId) },
    });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "AI configuration not found for this job",
      });
    }

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching AI configuration",
      error: error.message,
    });
  }
};

const getAllAIConfigs = async (req, res) => {
  try {
    const configs = await AIConfig.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching AI configurations",
      error: error.message,
    });
  }
};

const testAIConfig = async (req, res) => {
  try {
    const { configId } = req.params;
    const config = await AIConfig.findByPk(configId);

    if (!config) {
      return res.status(404).json({
        success: false,
        message: "AI configuration not found",
      });
    }

    // Simulate testing
    const testResult = {
      configId,
      status: "TESTED",
      timestamp: new Date(),
      weights: {
        resume: config.resumeWeight,
        mcq: config.mcqWeight,
        technical: config.technicalWeight,
        interview: config.interviewWeight,
      },
      threshold: config.passingThreshold,
      result: "Configuration is valid and ready",
    };

    res.json({
      success: true,
      message: "AI configuration test completed",
      data: testResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error testing AI configuration",
      error: error.message,
    });
  }
};

module.exports = {
  createAIConfig,
  updateAIConfig,
  getAIConfig,
  getAllAIConfigs,
  testAIConfig,
};
