// @ts-nocheck
/**
 * Recording Controller
 * ====================
 * Handles secure access to session recordings.
 * Students and mentors can only access recordings for their own sessions.
 * Returns a short-lived signed Cloudinary URL for secure playback.
 *
 * Video uploads are now compressed via FFmpeg before being stored in
 * Cloudinary — production-grade H.264/AAC compression similar to
 * platforms like Udemy and YouTube.
 */

const { Recording } = require('../models/Recording');
const { Booking } = require('../models/booking.model');
const {
  generateSignedDeliveryUrl,
  uploadVideoBuffer,
  uploadVideoFile,
  createSignedVideoUploadParams,
  deleteVideo,
} = require('../services/cloudinary.service');
const { cleanupFile } = require('../services/compression.service');
const {
  sanitizeRecordingUrl,
  isSimulatedZoomTestUrl,
} = require('../utils/recording.utils');
const { getIO } = require('../lib/socket');

const extractCloudinaryVersionFromUrl = (url = '') => {
  const match = String(url).match(/\/v(\d+)\//);
  if (!match) {
    return undefined;
  }

  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Resolve a booking and verify the caller may upload a clip to it.
 *
 * Both the assigned mentor and the assigned student are allowed: a session can
 * produce several videos and the student often has their own capture of the
 * call. Admins may act on any session. Returns the booking plus the caller's
 * participant role so clips can be attributed.
 */
const getAuthorizedSessionBooking = async (sessionId, userId, role) => {
  const booking = await Booking.findById(sessionId).lean();

  if (!booking) {
    const error = new Error('Session not found');
    error.statusCode = 404;
    throw error;
  }

  const bookingMentorId = String(booking.mentor?._id || booking.mentor);
  const bookingStudentId = String(booking.student?._id || booking.student);

  let participantRole = null;
  if (userId === bookingMentorId) {
    participantRole = 'mentor';
  } else if (userId === bookingStudentId) {
    participantRole = 'student';
  } else if (role === 'admin') {
    participantRole = 'admin';
  }

  if (!participantRole) {
    const error = new Error(
      'Only the session mentor, the session student, or an admin can upload this recording'
    );
    error.statusCode = 403;
    throw error;
  }

  return { booking, participantRole };
};

const emitRecordingReadyEvent = (booking, recording, videoUrl) => {
  try {
    const io = getIO();
    if (!io) {
      return;
    }

    const studentId = String(booking.student?._id || booking.student);
    io.to(`user:${studentId}`).emit('recording_ready', {
      type: 'recording_ready',
      sessionId: String(booking._id),
      recordingId: String(recording._id),
      url: videoUrl,
      message: 'Your session recording is ready! Watch now →',
    });
    console.log(`[Socket.io] Emitted recording_ready to user:${studentId}`);
  } catch (socketErr) {
    // Non-critical: log but don't fail the request
    console.warn('[Socket.io] Failed to emit recording_ready:', socketErr.message);
  }
};

/**
 * Build the Cloudinary identifiers for a session's recordings.
 *
 * `publicId` is suffixed with the next clip index so every uploaded part gets
 * its own Cloudinary asset instead of overwriting the previous one. The first
 * clip keeps the unsuffixed id for backward compatibility with recordings
 * created before multi-clip support.
 */
const getManualRecordingIdentifiers = (booking, existingRecording, sessionId) => {
  const meetingId =
    existingRecording?.meetingId ||
    booking.zoomMeetingId ||
    `manual-session-${String(sessionId)}`;

  const basePublicId = `meeting-${meetingId}`;
  const clipCount = Array.isArray(existingRecording?.clips)
    ? existingRecording.clips.length
    : 0;

  return {
    meetingId,
    folder: `recordings/${String(sessionId)}`,
    // First part keeps the legacy id; later parts are unique per clip.
    publicId: clipCount === 0 ? basePublicId : `${basePublicId}-part${clipCount + 1}`,
    basePublicId,
    nextClipIndex: clipCount,
  };
};

/**
 * Turn a stored recording into an ordered clip list.
 *
 * Documents written before multi-clip support only have the top-level
 * videoUrl, so they are surfaced as a single-clip timeline. Every read path
 * goes through here and never has to special-case the old shape.
 */
const normalizeRecordingClips = (recording) => {
  if (Array.isArray(recording?.clips) && recording.clips.length > 0) {
    return [...recording.clips].sort(
      (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)
    );
  }

  if (!recording?.videoUrl) {
    return [];
  }

  return [
    {
      _id: recording._id,
      title: 'Session recording',
      videoUrl: recording.videoUrl,
      cloudinaryPublicId: recording.cloudinaryPublicId || '',
      duration: Number(recording.duration) || 0,
      fileSize: Number(recording.fileSize) || 0,
      order: 0,
      uploadedByRole: 'system',
      source: recording.recordingType === 'manual_upload' ? 'manual_upload' : 'zoom',
      createdAt: recording.createdAt,
    },
  ];
};

/**
 * Shape a clip for the client, swapping the stored URL for a short-lived
 * signed delivery URL when the asset lives in Cloudinary.
 */
const toClientClip = (clip, index) => {
  let playbackUrl = clip.videoUrl;

  if (clip.cloudinaryPublicId) {
    try {
      playbackUrl = generateSignedDeliveryUrl(clip.cloudinaryPublicId, {
        expiresInSeconds: 7200,
        version: extractCloudinaryVersionFromUrl(clip.videoUrl),
      });
    } catch (signErr) {
      console.warn(
        `[Recording Controller] Failed to sign Cloudinary URL for ${clip.cloudinaryPublicId}:`,
        signErr.message
      );
    }
  }

  return {
    _id: clip._id ? String(clip._id) : null,
    title: clip.title || `Part ${index + 1}`,
    videoUrl: playbackUrl,
    duration: Number(clip.duration) || 0,
    fileSize: Number(clip.fileSize) || 0,
    order: Number(clip.order) || index,
    uploadedByRole: clip.uploadedByRole || 'system',
    source: clip.source || 'manual_upload',
    createdAt: clip.createdAt || null,
  };
};

/**
 * Append a clip to a recording, keeping order and the legacy mirror fields
 * consistent. Works on a hydrated (non-lean) Mongoose document.
 */
const appendClipToRecording = (recording, clip) => {
  if (!Array.isArray(recording.clips)) {
    recording.clips = [];
  }

  // Existing single-video documents: adopt the old top-level video as part 1
  // so it stays on the timeline once a second part is added.
  if (recording.clips.length === 0 && recording.videoUrl) {
    recording.clips.push({
      title: 'Part 1',
      videoUrl: recording.videoUrl,
      cloudinaryPublicId: recording.cloudinaryPublicId || '',
      duration: Number(recording.duration) || 0,
      fileSize: Number(recording.fileSize) || 0,
      order: 0,
      uploadedBy: null,
      uploadedByRole: 'system',
      source: recording.recordingType === 'manual_upload' ? 'manual_upload' : 'zoom',
    });
  }

  const nextOrder = recording.clips.reduce(
    (max, existing) => Math.max(max, Number(existing.order) || 0),
    -1
  ) + 1;

  recording.clips.push({
    title: clip.title || `Part ${nextOrder + 1}`,
    videoUrl: clip.videoUrl,
    cloudinaryPublicId: clip.cloudinaryPublicId || '',
    duration: Number(clip.duration) || 0,
    fileSize: Number(clip.fileSize) || 0,
    order: nextOrder,
    uploadedBy: clip.uploadedBy || null,
    uploadedByRole: clip.uploadedByRole || 'system',
    source: clip.source || 'manual_upload',
  });

  // Mirror onto the legacy fields: first clip's URL, aggregate duration/size.
  const ordered = [...recording.clips].sort(
    (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)
  );
  recording.videoUrl = ordered[0].videoUrl || '';
  recording.cloudinaryPublicId = ordered[0].cloudinaryPublicId || '';
  recording.duration = ordered.reduce((sum, c) => sum + (Number(c.duration) || 0), 0);
  recording.fileSize = ordered.reduce((sum, c) => sum + (Number(c.fileSize) || 0), 0);

  return recording.clips[recording.clips.length - 1];
};

// ─── Get Recording by Session ──────────────────────────────────────────────
/**
 * GET /api/v1/recordings/:sessionId
 *
 * Returns recording metadata and a signed video URL.
 * Only accessible by the student or mentor who owns the session.
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     _id, sessionId, meetingId, duration, recordingType,
 *     processingStatus, createdAt,
 *     videoUrl: "<signed-cloudinary-url>"  // 2-hour expiry
 *   }
 * }
 */
exports.getRecordingBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = String(req.user._id);
    const sessionIdStr = String(sessionId);
    const isMongoObjectId = /^[a-f\d]{24}$/i.test(sessionIdStr);

    // ──────────────────────────────────────────────────────────────────
    // 1. Resolve booking
    // ──────────────────────────────────────────────────────────────────
    let booking = null;

    if (isMongoObjectId) {
      booking = await Booking.findById(sessionIdStr).lean();
    }

    if (!booking) {
      booking = await Booking.findOne({ zoomMeetingId: sessionIdStr }).lean();
    }

    if (!booking) {
      // Fallback: try resolving through Recording if client sent meetingId/recordingId.
      const recordingByAltId = await Recording.findOne({
        $or: [{ meetingId: sessionIdStr }, ...(isMongoObjectId ? [{ _id: sessionIdStr }] : [])],
      }).lean();

      if (recordingByAltId) {
        booking = await Booking.findById(recordingByAltId.sessionId).lean();
      }

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }
    }

    const bookingStudentId = String(booking.student._id || booking.student);
    const bookingMentorId = String(booking.mentor._id || booking.mentor);
    const safeBookingRecordingUrl = sanitizeRecordingUrl(booking.recordingUrl || '');

    if (userId !== bookingStudentId && userId !== bookingMentorId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this recording',
      });
    }

    // ──────────────────────────────────────────────────────────────────
    // 2. Find the recording for this session
    // ──────────────────────────────────────────────────────────────────
    const recording = await Recording.findOne({ sessionId: booking._id }).lean();

    if (!recording) {
      // Backward-compat fallback:
      // Some sessions may only have booking.recordingUrl persisted.
      if (safeBookingRecordingUrl) {
        return res.status(200).json({
          success: true,
          data: {
            _id: null,
            sessionId: booking._id,
            meetingId: booking.zoomMeetingId || '',
            duration: 0,
            recordingType: 'zoom_playback',
            processingStatus: 'completed',
            fileSize: 0,
            createdAt: booking.updatedAt || booking.createdAt,
            videoUrl: safeBookingRecordingUrl,
            clips: [
              {
                _id: null,
                title: 'Session recording',
                videoUrl: safeBookingRecordingUrl,
                duration: 0,
                fileSize: 0,
                order: 0,
                uploadedByRole: 'system',
                source: 'zoom',
                createdAt: booking.updatedAt || booking.createdAt,
              },
            ],
          },
          message: 'Serving recording from booking fallback URL',
        });
      }

      return res.status(404).json({
        success: false,
        message: 'No recording available for this session',
      });
    }

    // ──────────────────────────────────────────────────────────────────
    // 3. Handle processing states
    // ──────────────────────────────────────────────────────────────────
    if (recording.processingStatus !== 'completed') {
      if (
        recording.processingStatus === 'failed' &&
        isSimulatedZoomTestUrl(recording.zoomDownloadUrl || '')
      ) {
        return res.status(404).json({
          success: false,
          message: 'No recording available for this session',
        });
      }

      // If pipeline isn't completed but we still have a booking-level recording URL,
      // return it so users can watch instead of seeing a hard failure.
      if (safeBookingRecordingUrl) {
        return res.status(200).json({
          success: true,
          data: {
            _id: recording._id,
            sessionId: recording.sessionId,
            meetingId: recording.meetingId,
            duration: recording.duration,
            recordingType: recording.recordingType || 'zoom_playback',
            processingStatus: 'completed',
            fileSize: recording.fileSize || 0,
            createdAt: recording.createdAt,
            videoUrl: safeBookingRecordingUrl,
            clips: [
              {
                _id: null,
                title: 'Session recording',
                videoUrl: safeBookingRecordingUrl,
                duration: Number(recording.duration) || 0,
                fileSize: Number(recording.fileSize) || 0,
                order: 0,
                uploadedByRole: 'system',
                source: 'zoom',
                createdAt: recording.createdAt,
              },
            ],
          },
          message: 'Serving booking recording URL fallback while processing metadata',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          _id: recording._id,
          sessionId: recording.sessionId,
          meetingId: recording.meetingId,
          duration: recording.duration,
          recordingType: recording.recordingType,
          processingStatus: recording.processingStatus,
          createdAt: recording.createdAt,
          videoUrl: null, // Not ready yet
          clips: [],
        },
        message:
          recording.processingStatus === 'failed'
            ? 'Recording processing failed. Please contact support.'
            : 'Recording is still being processed. Please check back shortly.',
      });
    }

    // ──────────────────────────────────────────────────────────────────
    // 4. Build the clip timeline with fresh signed URLs (2-hour expiry)
    // ──────────────────────────────────────────────────────────────────
    // Every part of the session is returned in playback order. Legacy
    // single-video documents come back as a one-clip timeline so the client
    // only ever deals with one shape.
    const clips = normalizeRecordingClips(recording).map(toClientClip);

    return res.status(200).json({
      success: true,
      data: {
        _id: recording._id,
        sessionId: recording.sessionId,
        meetingId: recording.meetingId,
        // Aggregate across every clip so the UI can show total watch time.
        duration: clips.reduce((total, clip) => total + clip.duration, 0),
        recordingType: recording.recordingType,
        processingStatus: recording.processingStatus,
        fileSize: clips.reduce((total, clip) => total + clip.fileSize, 0),
        createdAt: recording.createdAt,
        // Kept for older clients that only understand a single video.
        videoUrl: clips[0]?.videoUrl || null,
        clips,
      },
    });
  } catch (error) {
    console.error('[Recording Controller] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve recording',
    });
  }
};

// ─── Get All Recordings for a Student ──────────────────────────────────────
/**
 * GET /api/v1/recordings
 *
 * Returns all recordings for the authenticated user (student or mentor).
 */
exports.getMyRecordings = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const userRole = req.user.role;

    const query =
      userRole === 'mentor' ? { mentorId: userId } : { studentId: userId };

    const recordings = await Recording.find(query)
      .sort({ createdAt: -1 })
      .populate('sessionId', 'date startTime endTime sessionDuration')
      .populate('mentorId', 'name email profileImage')
      .populate('studentId', 'name email profileImage')
      .lean();

    // A session can hold several videos. Surface the part count and a light
    // per-clip summary so list views can show "3 parts" without a second
    // request. Signed playback URLs are deliberately left out — those are
    // minted per-session by getRecordingBySession when a video is actually
    // watched, and signing every clip here would be wasted work.
    const withClipSummary = recordings.map((recording) => {
      const clips = normalizeRecordingClips(recording);

      return {
        ...recording,
        clipCount: clips.length,
        // Aggregate so the card totals match what the player will report.
        duration: clips.reduce((sum, clip) => sum + (Number(clip.duration) || 0), 0),
        fileSize: clips.reduce((sum, clip) => sum + (Number(clip.fileSize) || 0), 0),
        clips: clips.map((clip, index) => ({
          _id: clip._id ? String(clip._id) : null,
          title: clip.title || `Part ${index + 1}`,
          duration: Number(clip.duration) || 0,
          fileSize: Number(clip.fileSize) || 0,
          order: Number(clip.order) || index,
          uploadedByRole: clip.uploadedByRole || 'system',
          source: clip.source || 'manual_upload',
          createdAt: clip.createdAt || null,
        })),
      };
    });

    return res.status(200).json({
      success: true,
      data: { recordings: withClipSummary },
      count: withClipSummary.length,
    });

  } catch (error) {
    console.error('[Recording Controller] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve recordings',
    });
  }
};

// ─── Prepare Direct Upload Signature ───────────────────────────────────────
/**
 * POST /api/v1/recordings/:sessionId/upload-signature
 *
 * Returns a short-lived signed Cloudinary upload payload so the browser can
 * upload directly to Cloudinary instead of proxying the video through backend.
 */
exports.createRecordingUploadSignature = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = String(req.user._id);
    const role = String(req.user.role || '').toLowerCase();

    const { booking, participantRole } = await getAuthorizedSessionBooking(sessionId, userId, role);
    const existingRecording = await Recording.findOne({ sessionId }).select('meetingId clips videoUrl duration fileSize recordingType').lean();
    const { meetingId, folder, publicId } = getManualRecordingIdentifiers(
      booking,
      existingRecording,
      sessionId
    );

    const uploadParams = createSignedVideoUploadParams({
      folder,
      publicId,
      overwrite: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        ...uploadParams,
        meetingId,
      },
    });
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    console.error('[Recording Upload Signature] Error:', error.message);
    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? 'Failed to prepare recording upload'
          : error.message,
    });
  }
};

// ─── Finalize Direct Upload ────────────────────────────────────────────────
/**
 * POST /api/v1/recordings/:sessionId/complete-upload
 *
 * Persists Cloudinary upload metadata after a successful direct browser upload.
 */
exports.finalizeRecordingUpload = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = String(req.user._id);
    const role = String(req.user.role || '').toLowerCase();
    const {
      secureUrl,
      publicId: uploadedPublicId,
      duration,
      bytes,
    } = req.body || {};

    if (!secureUrl || !uploadedPublicId) {
      return res.status(400).json({
        success: false,
        message: 'secureUrl and publicId are required',
      });
    }

    const { booking, participantRole } = await getAuthorizedSessionBooking(sessionId, userId, role);
    let recording = await Recording.findOne({ sessionId });
    const { meetingId, folder } = getManualRecordingIdentifiers(
      booking,
      recording,
      sessionId
    );

    // The asset must live in this session's folder. An exact public id match
    // is no longer possible because each clip gets its own suffixed id.
    if (!String(uploadedPublicId).startsWith(`${folder}/`)) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded asset does not match this recording session',
      });
    }

    if (!recording) {
      recording = new Recording({
        sessionId: booking._id,
        meetingId,
        mentorId: booking.mentor?._id || booking.mentor,
        studentId: booking.student?._id || booking.student,
      });
    }

    appendClipToRecording(recording, {
      title: req.body?.title,
      videoUrl: String(secureUrl),
      cloudinaryPublicId: String(uploadedPublicId),
      duration: Number(duration) || 0,
      fileSize: Number(bytes) || 0,
      uploadedBy: req.user._id,
      uploadedByRole: participantRole,
      source: participantRole === 'student' ? 'student_upload' : 'manual_upload',
    });

    recording.recordingType = 'manual_upload';
    recording.processingStatus = 'completed';
    recording.zoomDownloadUrl = '';
    recording.errorMessage = '';
    await recording.save();

    await Booking.findByIdAndUpdate(booking._id, {
      recordingUrl: recording.videoUrl,
    });

    emitRecordingReadyEvent(booking, recording, String(secureUrl));

    return res.status(200).json({
      success: true,
      message: 'Recording uploaded successfully',
      data: {
        _id: recording._id,
        sessionId: recording.sessionId,
        meetingId: recording.meetingId,
        duration: recording.duration,
        fileSize: recording.fileSize,
        recordingType: recording.recordingType,
        processingStatus: recording.processingStatus,
        videoUrl: recording.videoUrl,
        cloudinaryPublicId: recording.cloudinaryPublicId,
        clipCount: recording.clips.length,
      },
    });
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    console.error('[Recording Finalize Upload] Error:', error.message);
    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? 'Failed to finalize recording upload'
          : error.message,
    });
  }
};

// ─── Manual Upload for a Session ───────────────────────────────────────────
/**
 * POST /api/v1/recordings/:sessionId/upload
 *
 * Allows mentor/admin to upload a session video manually.
 * The video is compressed with FFmpeg (H.264/AAC) and then stored in Cloudinary.
 *
 * Uses disk storage (multer) so FFmpeg can process the file directly.
 */
exports.uploadRecordingForSession = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const { sessionId } = req.params;
    const userId = String(req.user._id);
    const role = String(req.user.role || '').toLowerCase();

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a video file in field "video"',
      });
    }

    // multer disk storage: file is at req.file.path
    uploadedFilePath = req.file.path;
    const originalSize = req.file.size;

    const { booking, participantRole } = await getAuthorizedSessionBooking(sessionId, userId, role);
    let recording = await Recording.findOne({ sessionId });
    const { meetingId, folder, publicId } = getManualRecordingIdentifiers(
      booking,
      recording,
      sessionId
    );

    console.log(
      `[Recording Upload] Starting compress + upload for session ${sessionId} ` +
      `(${(originalSize / 1e6).toFixed(1)} MB)`
    );

    // Compress and upload via the new file-based function
    const cloudinaryResult = await uploadVideoFile(uploadedFilePath, {
      folder,
      publicId,
    });

    if (!recording) {
      recording = new Recording({
        sessionId: booking._id,
        meetingId,
        mentorId: booking.mentor?._id || booking.mentor,
        studentId: booking.student?._id || booking.student,
      });
    }

    // Append as a new part instead of replacing — a session can have many.
    appendClipToRecording(recording, {
      title: req.body?.title,
      videoUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      duration: cloudinaryResult.duration || 0,
      fileSize: cloudinaryResult.bytes || 0,
      uploadedBy: req.user._id,
      uploadedByRole: participantRole,
      source: participantRole === 'student' ? 'student_upload' : 'manual_upload',
    });

    recording.recordingType = 'manual_upload';
    recording.processingStatus = 'completed';
    recording.zoomDownloadUrl = '';
    recording.errorMessage = '';
    await recording.save();

    await Booking.findByIdAndUpdate(booking._id, {
      recordingUrl: recording.videoUrl,
    });

    emitRecordingReadyEvent(booking, recording, cloudinaryResult.secure_url);

    // Log compression stats
    const stats = cloudinaryResult.compressionStats;
    if (stats) {
      console.log(
        `[Recording Upload] ✅ Session ${sessionId}: ` +
        `${(stats.originalSize / 1e6).toFixed(1)} MB → ${(stats.compressedSize / 1e6).toFixed(1)} MB ` +
        `(${stats.reductionPercent}% reduction, compressed: ${stats.wasCompressed})`
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Recording compressed and uploaded to Cloudinary successfully',
      data: {
        _id: recording._id,
        sessionId: recording.sessionId,
        meetingId: recording.meetingId,
        duration: recording.duration,
        fileSize: recording.fileSize,
        recordingType: recording.recordingType,
        processingStatus: recording.processingStatus,
        videoUrl: recording.videoUrl,
        cloudinaryPublicId: recording.cloudinaryPublicId,
        compression: stats || null,
      },
    });
  } catch (error) {
    console.error('[Recording Upload] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload recording video',
    });
  } finally {
    // Always clean up the uploaded temp file
    if (uploadedFilePath) {
      cleanupFile(uploadedFilePath);
    }
  }
};

// ─── Compress and Upload (New — for frontend direct-to-backend flow) ───────
/**
 * POST /api/v1/recordings/:sessionId/compress-and-upload
 *
 * Accepts a video upload from the frontend, compresses it server-side
 * using FFmpeg (production-grade H.264/AAC), and uploads the compressed
 * version to Cloudinary. This replaces the direct browser-to-Cloudinary
 * upload to ensure every video is optimally compressed.
 *
 * The frontend sends the raw video here and receives the finalized
 * recording data back — one endpoint instead of the old 3-step flow
 * (get signature → upload to Cloudinary → finalize).
 */
exports.compressAndUploadRecording = async (req, res) => {
  let uploadedFilePath = null;

  try {
    const { sessionId } = req.params;
    const userId = String(req.user._id);
    const role = String(req.user.role || '').toLowerCase();

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a video file in field "video"',
      });
    }

    uploadedFilePath = req.file.path;
    const originalSize = req.file.size;

    const { booking, participantRole } = await getAuthorizedSessionBooking(sessionId, userId, role);
    let recording = await Recording.findOne({ sessionId });
    const { meetingId, folder, publicId } = getManualRecordingIdentifiers(
      booking,
      recording,
      sessionId
    );

    console.log(
      `[Compress & Upload] Session ${sessionId}: ` +
      `compressing ${(originalSize / 1e6).toFixed(1)} MB video...`
    );

    // Compress and upload
    const cloudinaryResult = await uploadVideoFile(uploadedFilePath, {
      folder,
      publicId,
    });

    // Create or update the recording
    if (!recording) {
      recording = new Recording({
        sessionId: booking._id,
        meetingId,
        mentorId: booking.mentor?._id || booking.mentor,
        studentId: booking.student?._id || booking.student,
      });
    }

    // Append as a new part so earlier videos in this session are preserved.
    appendClipToRecording(recording, {
      title: req.body?.title,
      videoUrl: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      duration: cloudinaryResult.duration || 0,
      fileSize: cloudinaryResult.bytes || 0,
      uploadedBy: req.user._id,
      uploadedByRole: participantRole,
      source: participantRole === 'student' ? 'student_upload' : 'manual_upload',
    });

    recording.recordingType = 'manual_upload';
    recording.processingStatus = 'completed';
    recording.zoomDownloadUrl = '';
    recording.errorMessage = '';
    await recording.save();

    await Booking.findByIdAndUpdate(booking._id, {
      recordingUrl: recording.videoUrl,
    });

    emitRecordingReadyEvent(booking, recording, cloudinaryResult.secure_url);

    const stats = cloudinaryResult.compressionStats;
    if (stats) {
      console.log(
        `[Compress & Upload] ✅ Session ${sessionId}: ` +
        `${(stats.originalSize / 1e6).toFixed(1)} MB → ${(stats.compressedSize / 1e6).toFixed(1)} MB ` +
        `(${stats.reductionPercent}% reduction)`
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Recording compressed and uploaded successfully',
      data: {
        _id: recording._id,
        sessionId: recording.sessionId,
        meetingId: recording.meetingId,
        duration: recording.duration,
        fileSize: recording.fileSize,
        recordingType: recording.recordingType,
        processingStatus: recording.processingStatus,
        videoUrl: recording.videoUrl,
        cloudinaryPublicId: recording.cloudinaryPublicId,
        clipCount: recording.clips.length,
        compression: stats || null,
      },
    });
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    console.error('[Compress & Upload] Error:', error.message);
    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 500
          ? 'Failed to compress and upload recording'
          : error.message,
    });
  } finally {
    if (uploadedFilePath) {
      cleanupFile(uploadedFilePath);
    }
  }
};

// ─── Delete a Single Clip ──────────────────────────────────────────────────
/**
 * DELETE /api/v1/recordings/:sessionId/clips/:clipId
 *
 * Removes one part from the session timeline. Uploaders can remove their own
 * clip (e.g. a student who uploaded the wrong file); the session mentor and
 * admins can remove any clip.
 */
exports.deleteRecordingClip = async (req, res) => {
  try {
    const { sessionId, clipId } = req.params;
    const userId = String(req.user._id);
    const role = String(req.user.role || '').toLowerCase();

    const { booking } = await getAuthorizedSessionBooking(sessionId, userId, role);
    const recording = await Recording.findOne({ sessionId: booking._id });

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found',
      });
    }

    const clip = recording.clips?.id(clipId);
    if (!clip) {
      return res.status(404).json({
        success: false,
        message: 'Clip not found',
      });
    }

    const isUploader = String(clip.uploadedBy || '') === userId;
    const isMentorOrAdmin = role === 'admin' || String(recording.mentorId) === userId;

    if (!isUploader && !isMentorOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete clips you uploaded',
      });
    }

    if (clip.cloudinaryPublicId) {
      try {
        await deleteVideo(clip.cloudinaryPublicId);
      } catch (cloudErr) {
        // Keep going: a dangling Cloudinary asset is better than a broken timeline.
        console.warn('[Clip Delete] Cloudinary deletion failed:', cloudErr.message);
      }
    }

    clip.deleteOne();

    // Re-number the remaining parts so the timeline stays contiguous.
    recording.clips
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
      .forEach((remaining, index) => {
        remaining.order = index;
      });

    if (recording.clips.length === 0) {
      recording.videoUrl = '';
      recording.cloudinaryPublicId = '';
      recording.duration = 0;
      recording.fileSize = 0;
      await Booking.findByIdAndUpdate(booking._id, { $unset: { recordingUrl: 1 } });
    } else {
      const ordered = recording.clips;
      recording.videoUrl = ordered[0].videoUrl || '';
      recording.cloudinaryPublicId = ordered[0].cloudinaryPublicId || '';
      recording.duration = ordered.reduce((sum, c) => sum + (Number(c.duration) || 0), 0);
      recording.fileSize = ordered.reduce((sum, c) => sum + (Number(c.fileSize) || 0), 0);
      await Booking.findByIdAndUpdate(booking._id, { recordingUrl: recording.videoUrl });
    }

    await recording.save();

    return res.status(200).json({
      success: true,
      message: 'Clip deleted successfully',
      data: {
        _id: recording._id,
        sessionId: recording.sessionId,
        clipCount: recording.clips.length,
        duration: recording.duration,
        fileSize: recording.fileSize,
      },
    });
  } catch (error) {
    const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
    console.error('[Clip Delete] Error:', error.message);
    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Failed to delete clip' : error.message,
    });
  }
};

// ─── Delete Recording ──────────────────────────────────────────────────────
/**
 * DELETE /api/v1/recordings/:recordingId
 *
 * Deletes an entire recording (every clip) from Cloudinary and MongoDB.
 * Only the mentor who owns the session or an admin can delete.
 */
exports.deleteRecording = async (req, res) => {
  try {
    const { recordingId } = req.params;
    const userId = String(req.user._id);
    const role = String(req.user.role || '').toLowerCase();

    const recording = await Recording.findById(recordingId);

    if (!recording) {
      return res.status(404).json({
        success: false,
        message: 'Recording not found',
      });
    }

    // Authorization check: only the mentor or admin
    if (role !== 'admin' && String(recording.mentorId) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned mentor or an admin can delete this recording',
      });
    }

    // Remove every clip's asset, plus the legacy single asset if distinct.
    const publicIds = new Set();
    (recording.clips || []).forEach((clip) => {
      if (clip.cloudinaryPublicId) publicIds.add(clip.cloudinaryPublicId);
    });
    if (recording.cloudinaryPublicId) publicIds.add(recording.cloudinaryPublicId);

    for (const publicId of publicIds) {
      try {
        await deleteVideo(publicId);
      } catch (cloudErr) {
        console.warn('[Recording Delete] Cloudinary deletion failed:', cloudErr.message);
        // Continue with DB cleanup even if Cloudinary fails
      }
    }

    // Clear recording URL from the booking
    await Booking.findByIdAndUpdate(recording.sessionId, {
      $unset: { recordingUrl: 1 },
    });

    // Remove from database
    await Recording.findByIdAndDelete(recordingId);

    return res.status(200).json({
      success: true,
      message: 'Recording deleted successfully',
    });
  } catch (error) {
    console.error('[Recording Delete] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete recording',
    });
  }
};
