const express = require('express');
const router = express.Router();
const TalentPoolController = require('../controllers/talentPool.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

router.get('/', auth, role(['HR', 'ADMIN']), TalentPoolController.getTalentPool);

module.exports = router;
