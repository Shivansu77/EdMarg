const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    slots: {
      type: [slotSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// One availability record per mentor per day-of-week
availabilitySchema.index({ mentor: 1, dayOfWeek: 1 }, { unique: true });

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = { Availability };
