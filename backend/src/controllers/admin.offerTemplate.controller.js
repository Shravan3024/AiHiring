const { OfferTemplate } = require("../models/index.js");
const auditLogger = require("../services/auditLogger.service");

const createOfferTemplate = async (req, res) => {
  try {
    const { name, subject, body, jobId, legalClauses, salaryBreakupTemplate, branding, downloadAllowed, watermarkEnabled, expiryDurationDays } = req.body;

    const template = await OfferTemplate.create({
      templateName: name,
      templateContent: JSON.stringify({ subject, body }),
      jobId: jobId || null,
      legalClauses: legalClauses || [],
      salaryBreakupTemplate: salaryBreakupTemplate || null,
      branding: branding || null,
      downloadAllowed: downloadAllowed !== undefined ? downloadAllowed : true,
      watermarkEnabled: watermarkEnabled !== undefined ? watermarkEnabled : true,
      expiryDurationDays: expiryDurationDays || 30,
      versionNumber: 1,
      createdBy: req.user.id,
    });

    await auditLogger.logConfigChange(req, {
      entityType: "OfferTemplate",
      entityId: String(template.templateId),
      newValue: _serialize(template),
      description: `Offer template created: "${name}"`,
    });

    res.json({ success: true, data: _serialize(template) });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const updateOfferTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await OfferTemplate.findByPk(templateId);

    if (!template) return res.status(404).json({ success: false, message: "Not found" });

    const oldSnapshot = _serialize(template);
    const { name, subject, body, jobId, legalClauses, salaryBreakupTemplate, branding, downloadAllowed, watermarkEnabled, expiryDurationDays } = req.body;
    await template.update({
      templateName: name || template.templateName,
      templateContent: JSON.stringify({ subject, body }),
      jobId: jobId !== undefined ? jobId : template.jobId,
      legalClauses: legalClauses !== undefined ? legalClauses : template.legalClauses,
      salaryBreakupTemplate: salaryBreakupTemplate !== undefined ? salaryBreakupTemplate : template.salaryBreakupTemplate,
      branding: branding !== undefined ? branding : template.branding,
      downloadAllowed: downloadAllowed !== undefined ? downloadAllowed : template.downloadAllowed,
      watermarkEnabled: watermarkEnabled !== undefined ? watermarkEnabled : template.watermarkEnabled,
      expiryDurationDays: expiryDurationDays !== undefined ? expiryDurationDays : template.expiryDurationDays,
      versionNumber: (template.versionNumber || 0) + 1,
    });

    await auditLogger.logConfigChange(req, {
      entityType: "OfferTemplate",
      entityId: String(templateId),
      oldValue: oldSnapshot,
      newValue: _serialize(template),
      description: `Offer template updated: "${template.templateName}" (v${template.versionNumber})`,
    });

    res.json({ success: true, data: _serialize(template) });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getOfferTemplates = async (req, res) => {
  try {
    const templates = await OfferTemplate.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, data: templates.map(_serialize) });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

const getOfferTemplate = async (req, res) => {
  try {
    const template = await OfferTemplate.findByPk(req.params.templateId);
    if (!template) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: _serialize(template) });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

function _serialize(t) {
  let subject = "", body = "";
  try {
    const parsed = JSON.parse(t.templateContent || "{}");
    subject = parsed.subject || "";
    body = parsed.body || "";
  } catch (_) {}
  return {
    _id: String(t.templateId),
    name: t.templateName,
    subject,
    body,
    jobId: t.jobId,
    legalClauses: t.legalClauses,
    salaryBreakupTemplate: t.salaryBreakupTemplate,
    branding: t.branding,
    downloadAllowed: t.downloadAllowed,
    watermarkEnabled: t.watermarkEnabled,
    expiryDurationDays: t.expiryDurationDays,
    versionNumber: t.versionNumber,
    createdAt: t.createdAt,
  };
}

module.exports = { createOfferTemplate, updateOfferTemplate, getOfferTemplates, getOfferTemplate };
