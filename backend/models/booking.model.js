const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    sessionDuration: {
      type: Number,
      default: 45,
    },
    sessionType: {
      type: String,
      enum: ['video', 'chat', 'in-person'],
      default: 'video',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    mentorNotes: {
      type: String,
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cancellationReason: {
      type: String,
      maxlength: 500,
    },
    conductedAt: Date,
    completedAt: Date,
    zoomMeetingId: String,
    joinUrl: String,
    startUrl: String,
    recordingUrl: String,
    zoomError: String,
    sessionSummary: {
      type: String,
      maxlength: 2000,
    },
    actionItems: [
      {
        text: { type: String, maxlength: 500 },
        completed: { type: Boolean, default: false },
      },
    ],
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
    },
  },
  { timestamps: true }
);

// Prevent double-booking: same mentor, same date, same start time
bookingSchema.index(
  { mentor: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: 'cancelled' } },
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Booking };
