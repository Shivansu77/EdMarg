const mongoose = require('mongoose');

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
    profileImage: String,
    mentorProfile: {
      expertise: [String],
      bio: String,
      experienceYears: Number,
      pricePerSession: Number,
      rating: { type: Number, default: 0 },
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
