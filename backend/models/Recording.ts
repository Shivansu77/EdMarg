// @ts-nocheck
/**
 * Recording Model
 * ===============
 * Stores metadata for session recordings uploaded to Cloudinary.
 * Each recording is linked to a Booking (session), mentor, and student.
 *
 * MULTI-CLIP STRUCTURE
 * --------------------
 * A single mentoring session often produces more than one video: the mentor
 * records the screen share, the connection drops and a second part is
 * recorded, the student uploads their own capture, and so on. Those are all
 * parts of the *same* session, so they live in one Recording document as an
 * ordered `clips` array. The frontend stitches them into a single continuous
 * timeline.
 *
 * Key design decisions:
 * - One Recording document per session; `clips[]` holds every video part.
 * - Unique index on meetingId prevents duplicate webhook processing.
 * - The legacy top-level videoUrl/cloudinaryPublicId/duration/fileSize fields
 *   are kept in sync with clips[0] so older code and existing documents keep
 *   working without a migration.
 * - processingStatus tracks the async download→upload pipeline.
 * - videoUrl stores the Cloudinary secure_url (permanent, but we serve
 *   short-lived signed URLs to clients).
 */

const mongoose = require('mongoose');

/**
 * A single video part of a session recording.
 * Multiple clips play back-to-back as one continuous timeline.
 */
const clipSchema = new mongoose.Schema(
  {
    // Human readable label shown in the timeline, e.g. "Part 1"
    title: {
      type: String,
      default: '',
      trim: true,
      maxlength: 160,
    },

    // Cloudinary video details for this clip
    videoUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },

    // Playback metadata
    duration: {
      type: Number, // seconds
      default: 0,
    },
    fileSize: {
      type: Number, // bytes
      default: 0,
    },

    // Explicit ordering on the timeline (ascending)
    order: {
      type: Number,
      default: 0,
      index: true,
    },

    // Who added this clip — students may upload their own captures
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    uploadedByRole: {
      type: String,
      enum: ['student', 'mentor', 'admin', 'system'],
      default: 'system',
    },

    // How the clip got here
    source: {
      type: String,
      enum: ['zoom', 'screen_recording', 'manual_upload', 'student_upload'],
      default: 'manual_upload',
    },
  },
  {
    timestamps: true, // per-clip createdAt / updatedAt
  }
);

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

    // ── Multi-video timeline ────────────────────────────────────────────
    // Every video part of this session, in playback order.
    clips: {
      type: [clipSchema],
      default: [],
    },

    // ── Legacy single-video fields (kept in sync with clips[0]) ─────────
    // Existing documents and older clients still read these.
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

/** Total playable seconds across every clip. */
recordingSchema.virtual('totalDuration').get(function () {
  if (Array.isArray(this.clips) && this.clips.length > 0) {
    return this.clips.reduce((sum, clip) => sum + (Number(clip.duration) || 0), 0);
  }
  return Number(this.duration) || 0;
});

/** Number of video parts on the timeline. */
recordingSchema.virtual('clipCount').get(function () {
  return Array.isArray(this.clips) && this.clips.length > 0 ? this.clips.length : this.videoUrl ? 1 : 0;
});

/**
 * Append a clip and keep ordering plus the legacy mirror fields consistent.
 * Callers still need to `save()`.
 */
recordingSchema.methods.addClip = function (clip) {
  if (!Array.isArray(this.clips)) {
    this.clips = [];
  }

  const nextOrder = this.clips.reduce(
    (max, existing) => Math.max(max, Number(existing.order) || 0),
    -1
  ) + 1;

  this.clips.push({
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

  this.syncLegacyFields();
  return this.clips[this.clips.length - 1];
};

/**
 * Mirror the first clip onto the legacy top-level fields and recompute the
 * aggregate duration/size so old readers see something sensible.
 */
recordingSchema.methods.syncLegacyFields = function () {
  if (!Array.isArray(this.clips) || this.clips.length === 0) {
    return;
  }

  const ordered = [...this.clips].sort(
    (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)
  );
  const first = ordered[0];

  this.videoUrl = first.videoUrl || '';
  this.cloudinaryPublicId = first.cloudinaryPublicId || '';
  this.duration = ordered.reduce((sum, clip) => sum + (Number(clip.duration) || 0), 0);
  this.fileSize = ordered.reduce((sum, clip) => sum + (Number(clip.fileSize) || 0), 0);
};

/**
 * Backfill: documents created before the multi-clip change have only the
 * legacy fields. Expose them as a one-clip timeline so read paths never need
 * to special-case the old shape.
 */
recordingSchema.methods.normalizedClips = function () {
  if (Array.isArray(this.clips) && this.clips.length > 0) {
    return [...this.clips].sort(
      (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)
    );
  }

  if (!this.videoUrl) {
    return [];
  }

  return [
    {
      _id: this._id,
      title: 'Session recording',
      videoUrl: this.videoUrl,
      cloudinaryPublicId: this.cloudinaryPublicId || '',
      duration: Number(this.duration) || 0,
      fileSize: Number(this.fileSize) || 0,
      order: 0,
      uploadedBy: null,
      uploadedByRole: 'system',
      source: this.recordingType === 'manual_upload' ? 'manual_upload' : 'zoom',
      createdAt: this.createdAt,
    },
  ];
};

recordingSchema.set('toJSON', { virtuals: true });
recordingSchema.set('toObject', { virtuals: true });

const Recording = mongoose.model('Recording', recordingSchema);

module.exports = { Recording };
