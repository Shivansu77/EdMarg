/**
 * Recording Routes
 * ================
 * Secure endpoints for accessing session recordings.
 * All routes require authentication via JWT.
 */

const express = require('express');
const { protect } = require('../../middlewares/auth.middleware');
const {
  getRecordingBySession,
  getMyRecordings,
} = require('../../controllers/recording.controller');

const router = express.Router();

/**
 * GET /api/v1/recordings
 * Get all recordings for the authenticated user
 */
router.get('/', protect, getMyRecordings);

/**
 * GET /api/v1/recordings/:sessionId
 * Get recording for a specific session (booking)
 * Returns signed Cloudinary URL for secure playback
 */
router.get('/:sessionId', protect, getRecordingBySession);

module.exports = router;
