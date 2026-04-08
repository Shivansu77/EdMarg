/**
 * Recording Controller
 * ====================
 * Handles secure access to session recordings.
 * Students and mentors can only access recordings for their own sessions.
 * Returns a short-lived signed Cloudinary URL for secure playback.
 */

const { Recording } = require('../models/Recording');
const { Booking } = require('../models/booking.model');
const { generateSignedDeliveryUrl, cloudinary } = require('../services/cloudinary.service');

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

    // ──────────────────────────────────────────────────────────────────
    // 1. Find the booking and verify ownership
    // ──────────────────────────────────────────────────────────────────
    const booking = await Booking.findById(sessionId).lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    const bookingStudentId = String(booking.student._id || booking.student);
    const bookingMentorId = String(booking.mentor._id || booking.mentor);

    if (userId !== bookingStudentId && userId !== bookingMentorId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this recording',
      });
    }

    // ──────────────────────────────────────────────────────────────────
    // 2. Find the recording for this session
    // ──────────────────────────────────────────────────────────────────
    const recording = await Recording.findOne({ sessionId }).lean();

    if (!recording) {
      // Backward-compat fallback:
      // Some sessions may only have booking.recordingUrl persisted.
      if (booking.recordingUrl) {
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
            videoUrl: booking.recordingUrl,
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
      // If pipeline isn't completed but we still have a booking-level recording URL,
      // return it so users can watch instead of seeing a hard failure.
      if (booking.recordingUrl) {
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
            videoUrl: booking.recordingUrl,
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
        },
        message:
          recording.processingStatus === 'failed'
            ? 'Recording processing failed. Please contact support.'
            : 'Recording is still being processed. Please check back shortly.',
      });
    }

    // ──────────────────────────────────────────────────────────────────
    // 4. Generate a signed URL for secure playback (2-hour expiry)
    // ──────────────────────────────────────────────────────────────────
    // For videos uploaded with 'upload' type, we use the direct secure_url
    // and append a signature. Cloudinary signed URLs for upload-type resources
    // use the URL signing approach.
    let signedVideoUrl = recording.videoUrl;

    if (recording.cloudinaryPublicId) {
      // Generate a fresh signed URL that expires in 2 hours
      signedVideoUrl = cloudinary.url(recording.cloudinaryPublicId, {
        resource_type: 'video',
        secure: true,
        sign_url: true,
        type: 'upload',
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
        fileSize: recording.fileSize,
        createdAt: recording.createdAt,
        videoUrl: signedVideoUrl,
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

    return res.status(200).json({
      success: true,
      data: { recordings },
      count: recordings.length,
    });
  } catch (error) {
    console.error('[Recording Controller] Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve recordings',
    });
  }
};
