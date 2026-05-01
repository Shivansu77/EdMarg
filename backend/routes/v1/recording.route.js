/**
 * Recording Routes
 * ================
 * Secure endpoints for accessing session recordings.
 * All routes require authentication via JWT.
 */

const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { uploadRecordingVideo } = require('../../middlewares/upload.middleware');
const {
  getRecordingBySession,
  getMyRecordings,
  createRecordingUploadSignature,
  finalizeRecordingUpload,
  uploadRecordingForSession,
  deleteRecording,
} = require('../../controllers/recording.controller');

const router = express.Router();

/**
 * GET /api/v1/recordings
 * Get all recordings for the authenticated user
 */
router.get('/', protect, getMyRecordings);

/**
 * POST /api/v1/recordings/:sessionId/upload-signature
 * Create signed Cloudinary upload params for a direct browser upload.
 */
router.post(
  '/:sessionId/upload-signature',
  protect,
  authorize('mentor', 'admin'),
  createRecordingUploadSignature
);

/**
 * POST /api/v1/recordings/:sessionId/complete-upload
 * Persist metadata after a direct Cloudinary upload finishes.
 */
router.post(
  '/:sessionId/complete-upload',
  protect,
  authorize('mentor', 'admin'),
  finalizeRecordingUpload
);

/**
 * POST /api/v1/recordings/:sessionId/upload
 * Manually upload a session recording video to Cloudinary.
 * Allowed roles: mentor assigned to session, admin.
 */
router.post(
  '/:sessionId/upload',
  protect,
  authorize('mentor', 'admin'),
  uploadRecordingVideo,
  uploadRecordingForSession
);

/**
 * DELETE /api/v1/recordings/:recordingId
 * Delete a recording from Cloudinary and MongoDB.
 * Allowed roles: mentor who owns the session, admin.
 */
router.delete(
  '/:recordingId',
  protect,
  authorize('mentor', 'admin'),
  deleteRecording
);

/**
 * GET /api/v1/recordings/:sessionId
 * Get recording for a specific session (booking)
 * Returns signed Cloudinary URL for secure playback
 */
router.get('/:sessionId', protect, getRecordingBySession);

module.exports = router;
