const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const webhookAuth = require('../middleware/webhookAuth');

// CNB webhook endpoint for PR events
router.post('/pr', webhookAuth, webhookController.handlePrEvent);

module.exports = router;