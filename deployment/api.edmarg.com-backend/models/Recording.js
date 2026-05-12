/**
 * Recording Model
 * ===============
 * Stores metadata for Zoom session recordings uploaded to Cloudinary.
 * Each recording is linked to a Booking (session), mentor, and student.
 *
 * Key design decisions:
 * - Unique index on meetingId prevents duplicate webhook processing
 * - processingStatus tracks the async download→upload pipeline
 * - videoUrl stores the Cloudinary secure_url (permanent, but we serve signed URLs to clients)
 */

const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema(
  {
    // Reference to the booking/session this recording belongs to
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },

    // Zoom meeting ID — used as the idempotency key
    meetingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Users involved in the session
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Cloudinary video details
    videoUrl: {
      type: String,
      default: '',
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },

    // Recording metadata
    duration: {
      type: Number, // seconds
      default: 0,
    },
    recordingType: {
      type: String,
      default: 'shared_screen_with_speaker_view',
    },
    fileSize: {
      type: Number, // bytes
      default: 0,
    },

    // Async processing pipeline status
    processingStatus: {
      type: String,
      enum: ['pending', 'downloading', 'uploading', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },

    // Temporary: Zoom download URL (cleared after successful upload)
    zoomDownloadUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Compound index for fast student+session lookups
recordingSchema.index({ studentId: 1, sessionId: 1 });

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = { Recording };
