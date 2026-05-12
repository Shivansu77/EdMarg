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
const { sendRecordingReadyEmail } = require('../services/email.service');
const { User } = require('../models/user.model');
const { isSimulatedZoomTestUrl, sanitizeRecordingUrl } = require('../utils/recording.utils');

function isPendingProcessorAuthorized(req) {
  return Boolean(req.user && req.user._id);
}

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

      // Ignore Zoom webhook "test" payloads so they don't pollute real data.
      const simulatedDownloadUrl = bestRecording.download_url || '';
      const simulatedPlayUrl = bestRecording.play_url || '';
      if (
        isSimulatedZoomTestUrl(simulatedDownloadUrl) ||
        isSimulatedZoomTestUrl(simulatedPlayUrl)
      ) {
        console.warn(
          `[Zoom Webhook] Ignoring simulated recording payload for meeting ${zoomMeetingId}`
        );
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
        if (
          existingRecording.processingStatus === 'failed' &&
          existingRecording.zoomDownloadUrl
        ) {
          existingRecording.processingStatus = 'pending';
          existingRecording.errorMessage = '';
          await existingRecording.save();

          processRecordingAsync(existingRecording._id).catch((err) => {
            console.error(
              `[Zoom Pipeline] Retry failed for existing Recording ${existingRecording._id}:`,
              err.message
            );
          });

          console.log(
            `[Zoom Webhook] Existing failed recording ${existingRecording._id} re-queued for processing`
          );
          return res.status(200).send('ok');
        }

        console.log(
          `[Zoom Webhook] Recording already exists for meeting ${zoomMeetingId} ` +
          `(status: ${existingRecording.processingStatus}) — skipping`
        );
        return res.status(200).send('ok');
      }

      if (!bestRecording.download_url) {
        console.warn(
          `[Zoom Webhook] Missing download_url for meeting ${zoomMeetingId}; cannot upload to Cloudinary`
        );

        const safePlayUrl = sanitizeRecordingUrl(bestRecording.play_url || '');
        if (safePlayUrl) {
          await Booking.findByIdAndUpdate(booking._id, {
            recordingUrl: safePlayUrl,
          });
        }

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
      const safePlayUrl = sanitizeRecordingUrl(bestRecording.play_url || '');
      if (safePlayUrl) {
        await Booking.findByIdAndUpdate(booking._id, {
          recordingUrl: safePlayUrl,
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

    // Update the Booking with the Cloudinary URL + mark as completed
    await Booking.findByIdAndUpdate(recording.sessionId, {
      recordingUrl: cloudinaryResult.secure_url,
      status: 'completed',
      completedAt: new Date(),
    });

    console.log(`[Zoom Pipeline] ✅ Booking ${recording.sessionId} recordingUrl updated + status: completed`);

    // ────────────────────────────────────────────────────────────────────
    // Step 4: Send email notification to the student
    // ────────────────────────────────────────────────────────────────────
    try {
      const [student, mentor] = await Promise.all([
        User.findById(recording.studentId).select('name email').lean(),
        User.findById(recording.mentorId).select('name').lean(),
      ]);

      if (student?.email) {
        // Build the recording page URL using FRONTEND_ORIGIN env or fallback
        const frontendBase = (
          process.env.FRONTEND_ORIGIN ||
          process.env.NEXT_PUBLIC_APP_URL ||
          'https://edmarg.onrender.com'
        ).replace(/\/$/, '');

        const recordingPageUrl = `${frontendBase}/sessions/${recording.sessionId}/recording`;

        // Format the session date from the booking
        const booking = await Booking.findById(recording.sessionId).select('date startTime').lean();
        const sessionDate = booking?.date
          ? new Date(booking.date).toLocaleDateString('en-IN', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })
          : 'your recent session';

        await sendRecordingReadyEmail({
          to: student.email,
          studentName: student.name || 'Student',
          mentorName: mentor?.name || 'your mentor',
          sessionDate,
          recordingPageUrl,
          durationMinutes: recording.duration ? Math.round(recording.duration / 60) : undefined,
        });
      } else {
        console.warn(`[Zoom Pipeline] Student ${recording.studentId} has no email — skipping notification`);
      }
    } catch (emailErr) {
      // Email failure must never crash the pipeline
      console.error(`[Zoom Pipeline] Email notification failed (non-fatal):`, emailErr.message);
    }
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

// ─── Pending Processor (Cron-safe) ─────────────────────────────────────────
/**
 * GET /api/v1/zoom/process-pending
 *
 * Processes a batch of recordings that are stuck in:
 * pending/downloading/uploading/failed (with zoomDownloadUrl available).
 *
 * This route is intended to be called by authenticated dashboard/recordings
 * flows to recover recordings that were left pending/failed.
 */
exports.processPendingRecordings = async (req, res) => {
  try {
    if (!isPendingProcessorAuthorized(req)) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized pending-processor request',
      });
    }

    const limitParam = Number(req.query.limit);
    const batchSize =
      Number.isInteger(limitParam) && limitParam > 0
        ? Math.min(limitParam, 10)
        : 3;

    const candidates = await Recording.find({
      processingStatus: { $in: ['pending', 'downloading', 'uploading', 'failed'] },
      zoomDownloadUrl: { $exists: true, $ne: '' },
    })
      .sort({ updatedAt: 1 })
      .limit(batchSize)
      .select('_id processingStatus meetingId')
      .lean();

    if (!candidates.length) {
      return res.status(200).json({
        success: true,
        message: 'No pending recordings to process',
        data: {
          scanned: 0,
          processed: 0,
          failed: 0,
        },
      });
    }

    let processed = 0;
    let failed = 0;
    const results = [];

    for (const candidate of candidates) {
      const recordingId = String(candidate._id);

      try {
        if (candidate.processingStatus !== 'pending') {
          await Recording.findByIdAndUpdate(recordingId, {
            processingStatus: 'pending',
            errorMessage: '',
          });
        }

        await processRecordingAsync(recordingId);

        const latest = await Recording.findById(recordingId)
          .select('processingStatus errorMessage')
          .lean();

        const finalStatus = latest?.processingStatus || 'unknown';
        const isCompleted = finalStatus === 'completed';

        if (isCompleted) processed += 1;
        else failed += 1;

        results.push({
          recordingId,
          meetingId: candidate.meetingId,
          status: finalStatus,
          ...(latest?.errorMessage ? { error: latest.errorMessage } : {}),
        });
      } catch (err) {
        failed += 1;
        results.push({
          recordingId,
          meetingId: candidate.meetingId,
          status: 'failed',
          error: err.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Pending recording batch processed',
      data: {
        scanned: candidates.length,
        processed,
        failed,
        results,
      },
    });
  } catch (error) {
    console.error('[Zoom Pending Processor] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process pending recordings',
    });
  }
};

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
