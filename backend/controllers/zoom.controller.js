/**
 * Zoom Controller
 * ===============
 * Handles Zoom webhook events and triggers the async recording pipeline.
 *
 * Flow:
 * 1. Zoom fires recording.completed webhook
 * 2. We validate the signature, find the matching booking
 * 3. Create a Recording document with status 'pending'
 * 4. Return 200 to Zoom immediately (they expect fast response)
 * 5. Kick off async: download from Zoom → upload to Cloudinary → update DB
 */

const crypto = require('crypto');
const { Booking } = require('../models/booking.model');
const { Recording } = require('../models/Recording');
const { createZoomMeeting, downloadRecording } = require('../services/zoom.service');
const { uploadVideoFromStream } = require('../services/cloudinary.service');

// ─── Webhook Signature Verification ────────────────────────────────────────
/**
 * Verifies the Zoom webhook request signature using HMAC-SHA256.
 * Zoom sends: x-zm-request-timestamp + x-zm-signature headers.
 *
 * @param {Object} req - Express request
 * @returns {boolean} Whether the signature is valid
 */
function verifyWebhookSignature(req) {
  const secret = process.env.ZOOM_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[Zoom Webhook] ZOOM_WEBHOOK_SECRET not set — skipping signature verification');
    return true; // Allow through if no secret configured (dev mode)
  }

  const timestamp = req.headers['x-zm-request-timestamp'];
  const signature = req.headers['x-zm-signature'];

  if (!timestamp || !signature) {
    console.warn('[Zoom Webhook] Missing timestamp or signature headers');
    return false;
  }

  // Zoom signature = v0=HMAC-SHA256(webhook_secret, "v0:{timestamp}:{body}")
  const message = `v0:${timestamp}:${JSON.stringify(req.body)}`;
  const hashForVerify = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  const expectedSignature = `v0=${hashForVerify}`;
  return signature === expectedSignature;
}

// ─── Main Webhook Handler ──────────────────────────────────────────────────
/**
 * POST /api/v1/zoom/webhook
 *
 * Handles all Zoom webhook events:
 * - endpoint.url_validation: Zoom's challenge-response for webhook setup
 * - recording.completed: Triggers the recording pipeline
 */
exports.zoomWebhook = async (req, res) => {
  try {
    const { event, payload } = req.body;

    // ────────────────────────────────────────────────────────────────────
    // 1. Webhook URL Validation Challenge (Required by Zoom during setup)
    // ────────────────────────────────────────────────────────────────────
    if (event === 'endpoint.url_validation') {
      const secret = process.env.ZOOM_WEBHOOK_SECRET;
      const hashForValidate = crypto
        .createHmac('sha256', secret)
        .update(payload.plainToken)
        .digest('hex');

      return res.status(200).json({
        plainToken: payload.plainToken,
        encryptedToken: hashForValidate,
      });
    }

    // ────────────────────────────────────────────────────────────────────
    // 2. Verify webhook signature for all other events
    // ────────────────────────────────────────────────────────────────────
    if (!verifyWebhookSignature(req)) {
      console.error('[Zoom Webhook] Invalid signature — rejecting request');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // ────────────────────────────────────────────────────────────────────
    // 3. Handle recording.completed event
    // ────────────────────────────────────────────────────────────────────
    if (event === 'recording.completed') {
      const recording = payload.object;
      const zoomMeetingId = String(recording.id);

      console.log(`[Zoom Webhook] recording.completed for meeting ${zoomMeetingId}`);

      // Extract the best recording file (prefer shared_screen_with_speaker_view, then speaker_view)
      const recordingFiles = recording.recording_files || [];
      const preferredTypes = [
        'shared_screen_with_speaker_view',
        'shared_screen_with_gallery_view',
        'speaker_view',
        'gallery_view',
        'shared_screen',
      ];

      let bestRecording = null;
      for (const type of preferredTypes) {
        bestRecording = recordingFiles.find(
          (f) => f.recording_type === type && f.status === 'completed'
        );
        if (bestRecording) break;
      }

      // Fallback: pick the first completed MP4 file
      if (!bestRecording) {
        bestRecording = recordingFiles.find(
          (f) => f.file_type === 'MP4' && f.status === 'completed'
        );
      }

      if (!bestRecording) {
        console.warn(`[Zoom Webhook] No suitable recording file found for meeting ${zoomMeetingId}`);
        return res.status(200).send('ok');
      }

      // ──────────────────────────────────────────────────────────────────
      // 3a. Find the booking that matches this Zoom meeting
      // ──────────────────────────────────────────────────────────────────
      const booking = await Booking.findOne({ zoomMeetingId }).lean();

      if (!booking) {
        console.warn(`[Zoom Webhook] No booking found for meeting ${zoomMeetingId} — ignoring`);
        return res.status(200).send('ok');
      }

      // ──────────────────────────────────────────────────────────────────
      // 3b. Idempotency: check if we already processed this meeting
      // ──────────────────────────────────────────────────────────────────
      const existingRecording = await Recording.findOne({ meetingId: zoomMeetingId });

      if (existingRecording) {
        console.log(
          `[Zoom Webhook] Recording already exists for meeting ${zoomMeetingId} ` +
          `(status: ${existingRecording.processingStatus}) — skipping`
        );
        return res.status(200).send('ok');
      }

      // ──────────────────────────────────────────────────────────────────
      // 3c. Create Recording document with status 'pending'
      // ──────────────────────────────────────────────────────────────────
      const newRecording = await Recording.create({
        sessionId: booking._id,
        meetingId: zoomMeetingId,
        mentorId: booking.mentor._id || booking.mentor,
        studentId: booking.student._id || booking.student,
        duration: bestRecording.recording_end
          ? Math.round(
              (new Date(bestRecording.recording_end) - new Date(bestRecording.recording_start)) / 1000
            )
          : 0,
        recordingType: bestRecording.recording_type || 'unknown',
        zoomDownloadUrl: bestRecording.download_url,
        processingStatus: 'pending',
      });

      console.log(`[Zoom Webhook] Created Recording ${newRecording._id} — starting async processing`);

      // ──────────────────────────────────────────────────────────────────
      // 3d. Kick off async processing (don't await — return 200 now)
      // ──────────────────────────────────────────────────────────────────
      processRecordingAsync(newRecording._id).catch((err) => {
        console.error(`[Zoom Pipeline] Unhandled error for Recording ${newRecording._id}:`, err.message);
      });

      // Also update the legacy recordingUrl on the booking (backward compat)
      if (bestRecording.play_url) {
        await Booking.findByIdAndUpdate(booking._id, {
          recordingUrl: bestRecording.play_url,
        });
      }
    }

    // Always acknowledge the webhook
    res.status(200).send('ok');
  } catch (error) {
    console.error('[Zoom Webhook Error]:', error.message, error.stack);
    // Return 200 even on error to prevent Zoom from aggressively retrying
    res.status(200).send('error');
  }
};

// ─── Async Recording Processing Pipeline ───────────────────────────────────
/**
 * Downloads recording from Zoom and uploads to Cloudinary.
 * Runs asynchronously after the webhook returns 200.
 *
 * Pipeline: pending → downloading → uploading → completed (or failed)
 *
 * @param {string} recordingId - MongoDB ObjectId of the Recording document
 */
async function processRecordingAsync(recordingId) {
  let recording;

  try {
    recording = await Recording.findById(recordingId);
    if (!recording) {
      throw new Error(`Recording ${recordingId} not found`);
    }

    if (recording.processingStatus === 'completed') {
      console.log(`[Zoom Pipeline] Recording ${recordingId} already completed — skipping`);
      return;
    }

    // ────────────────────────────────────────────────────────────────────
    // Step 1: Download from Zoom
    // ────────────────────────────────────────────────────────────────────
    recording.processingStatus = 'downloading';
    await recording.save();
    console.log(`[Zoom Pipeline] Downloading recording for meeting ${recording.meetingId}...`);

    const videoStream = await downloadRecording(recording.zoomDownloadUrl);

    // ────────────────────────────────────────────────────────────────────
    // Step 2: Upload to Cloudinary
    // ────────────────────────────────────────────────────────────────────
    recording.processingStatus = 'uploading';
    await recording.save();
    console.log(`[Zoom Pipeline] Uploading to Cloudinary...`);

    const cloudinaryResult = await uploadVideoFromStream(videoStream, {
      folder: 'session-recordings',
      publicId: `meeting-${recording.meetingId}`,
    });

    // ────────────────────────────────────────────────────────────────────
    // Step 3: Update Recording with Cloudinary data
    // ────────────────────────────────────────────────────────────────────
    recording.videoUrl = cloudinaryResult.secure_url;
    recording.cloudinaryPublicId = cloudinaryResult.public_id;
    recording.duration = cloudinaryResult.duration || recording.duration;
    recording.fileSize = cloudinaryResult.bytes || 0;
    recording.processingStatus = 'completed';
    recording.zoomDownloadUrl = ''; // Clear temporary URL
    recording.errorMessage = '';
    await recording.save();

    console.log(`[Zoom Pipeline] ✅ Recording ${recordingId} completed:`, {
      cloudinaryPublicId: cloudinaryResult.public_id,
      duration: cloudinaryResult.duration,
      bytes: cloudinaryResult.bytes,
    });

    // Also update the Booking with the Cloudinary URL for backward compatibility
    await Booking.findByIdAndUpdate(recording.sessionId, {
      recordingUrl: cloudinaryResult.secure_url,
    });

    console.log(`[Zoom Pipeline] ✅ Booking ${recording.sessionId} recordingUrl updated`);
  } catch (error) {
    console.error(`[Zoom Pipeline] ❌ Failed for Recording ${recordingId}:`, error.message);

    // Mark recording as failed
    if (recording) {
      try {
        recording.processingStatus = 'failed';
        recording.errorMessage = error.message;
        await recording.save();
      } catch (saveErr) {
        console.error(`[Zoom Pipeline] Failed to save error state:`, saveErr.message);
      }
    }
  }
}

// ─── Standalone Meeting Creation (Existing) ─────────────────────────────────
/**
 * POST /api/v1/zoom/create-meeting
 * Manually create a Zoom meeting (used for testing or explicit standalone calls).
 */
exports.createStandaloneMeeting = async (req, res) => {
  try {
    const { topic, startTime, duration } = req.body;

    if (!topic || !startTime) {
      return res.status(400).json({ error: 'Topic and startTime are required' });
    }

    const meetingDetails = await createZoomMeeting({ topic, startTime, duration });

    res.status(201).json({
      success: true,
      data: meetingDetails,
    });
  } catch (err) {
    res.status(500).json({ error: 'Standalone meeting creation failed', details: err.message });
  }
};

// ─── Retry Failed Recording (Admin Utility) ────────────────────────────────
/**
 * POST /api/v1/zoom/retry-recording/:recordingId
 * Retries a failed recording processing.
 */
exports.retryRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const recording = await Recording.findById(recordingId);

    if (!recording) {
      return res.status(404).json({ success: false, message: 'Recording not found' });
    }

    if (recording.processingStatus === 'completed') {
      return res.status(400).json({ success: false, message: 'Recording already completed' });
    }

    if (!recording.zoomDownloadUrl) {
      return res.status(400).json({
        success: false,
        message: 'No Zoom download URL available — recording cannot be retried',
      });
    }

    // Reset status and kick off pipeline
    recording.processingStatus = 'pending';
    recording.errorMessage = '';
    await recording.save();

    processRecordingAsync(recording._id).catch((err) => {
      console.error(`[Zoom Pipeline] Retry error for ${recording._id}:`, err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Recording retry initiated',
      data: { recordingId: recording._id, status: 'pending' },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
