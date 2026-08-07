// @ts-nocheck
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
  compressAndUploadRecording,
  deleteRecordingClip,
  deleteRecording,
} = require('../../controllers/recording.controller');

const router = express.Router();

/**
 * GET /api/v1/recordings
 * Get all recordings for the authenticated user
 */
router.get('/', protect, getMyRecordings);

/**
 * A session can hold several videos, and the student is a first-class
 * contributor — they may upload their own capture of the call. The
 * controller still verifies the caller is actually the mentor or the student
 * on that specific booking, so role alone never grants access.
 */
const SESSION_PARTICIPANTS = ['student', 'mentor', 'admin'];

/**
 * POST /api/v1/recordings/:sessionId/upload-signature
 * Create signed Cloudinary upload params for a direct browser upload.
 */
router.post(
  '/:sessionId/upload-signature',
  protect,
  authorize(...SESSION_PARTICIPANTS),
  createRecordingUploadSignature
);

/**
 * POST /api/v1/recordings/:sessionId/complete-upload
 * Persist metadata after a direct Cloudinary upload finishes.
 */
router.post(
  '/:sessionId/complete-upload',
  protect,
  authorize(...SESSION_PARTICIPANTS),
  finalizeRecordingUpload
);

/**
 * POST /api/v1/recordings/:sessionId/upload
 * Manually upload a session recording video to Cloudinary.
 * Video is compressed via FFmpeg before upload and appended to the
 * session's clip timeline.
 * Allowed: the mentor or student on the session, or an admin.
 */
router.post(
  '/:sessionId/upload',
  protect,
  authorize(...SESSION_PARTICIPANTS),
  uploadRecordingVideo,
  uploadRecordingForSession
);

/**
 * POST /api/v1/recordings/:sessionId/compress-and-upload
 * Upload a video, compress it server-side via FFmpeg (H.264/AAC),
 * then store the compressed version in Cloudinary as a new timeline part.
 * This is the primary upload endpoint used by the frontend.
 * Allowed: the mentor or student on the session, or an admin.
 */
router.post(
  '/:sessionId/compress-and-upload',
  protect,
  authorize(...SESSION_PARTICIPANTS),
  uploadRecordingVideo,
  compressAndUploadRecording
);

/**
 * DELETE /api/v1/recordings/:sessionId/clips/:clipId
 * Remove a single video part from a session timeline.
 * Allowed: whoever uploaded the clip, the session mentor, or an admin.
 *
 * Declared before the /:recordingId route so the more specific path wins.
 */
router.delete(
  '/:sessionId/clips/:clipId',
  protect,
  authorize(...SESSION_PARTICIPANTS),
  deleteRecordingClip
);

/**
 * DELETE /api/v1/recordings/:recordingId
 * Delete an entire recording (all clips) from Cloudinary and MongoDB.
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
