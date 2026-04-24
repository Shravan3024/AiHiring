const express = require('express');
const router = express.Router();
const AIInsightsController = require('../controllers/aiInsights.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/dashboard', auth, role(['HR', 'ADMIN']), AIInsightsController.getDashboardData);
router.get('/download-insights', auth, role(['HR', 'ADMIN']), AIInsightsController.downloadInsights);
router.post('/generate-report', auth, role(['HR', 'ADMIN']), AIInsightsController.generateAIReport);
router.post('/analyze-section', auth, role(['HR', 'ADMIN']), AIInsightsController.analyzeSection);

module.exports = router;
