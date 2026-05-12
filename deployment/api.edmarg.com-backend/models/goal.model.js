const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
    completedAt: Date,
  },
  { _id: true }
);

const goalSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    category: {
      type: String,
      enum: ['career', 'technical', 'academic', 'personal'],
      default: 'technical',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
    targetDate: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [milestoneSchema],
    linkedSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
  },
  { timestamps: true }
);

const Goal = mongoose.model('Goal', goalSchema);

module.exports = { Goal };
