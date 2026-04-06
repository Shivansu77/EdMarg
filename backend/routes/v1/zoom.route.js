const express = require('express');
const { zoomWebhook, createStandaloneMeeting, retryRecording } = require('../../controllers/zoom.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

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

/**
 * Retry a failed recording processing
 * Only accessible by admins or mentors
 */
router.post('/retry-recording/:recordingId', protect, authorize('admin', 'mentor'), retryRecording);

module.exports = router;

