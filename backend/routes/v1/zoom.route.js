const express = require('express');
const { zoomWebhook, createStandaloneMeeting } = require('../../controllers/zoom.controller');

const router = express.Router();

/**
 * Handle incoming Zoom webhook events (e.g. recording finished, verification challenges)
 * No strict auth middleware attached here to allow Zoom servers to hit it directly.
 */
router.post('/webhook', zoomWebhook);

/**
 * Manually trigger meeting creation 
 * (Optional depending on how tight you tie it to the booking model)
 */
router.post('/create-meeting', createStandaloneMeeting);

module.exports = router;
