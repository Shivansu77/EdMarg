const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const isBcryptHash = (value = '') =>
  typeof value === 'string' &&
  (value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$'));

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (value) => {
          if (!value) return true;
          return /^\d{10}$/.test(String(value));
        },
        message: 'Phone number must be exactly 10 digits',
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    profileImage: { type: String, default: "" },
    studentProfile: {
      classLevel: String,
      interests: [String],
    },
    mentorProfile: {
      expertise: [String],
      bio: String,
      experienceYears: Number,
      pricePerSession: Number,
      sessionDuration: { type: Number, default: 45, min: 15, max: 180 },
      autoConfirm: { type: Boolean, default: false },
      sessionNotes: String,
      linkedinUrl: String,
      rating: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      approvedAt: Date,
      approvedBy: mongoose.Schema.Types.ObjectId,
      rejectionReason: String,
    },
  },
  { timestamps: true }
);

const tokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
});

const User = mongoose.model('User', userSchema);
const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = { User, TokenBlacklist };
