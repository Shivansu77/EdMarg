// @ts-nocheck
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
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: (value) => {
          if (!value) return true;
          return /^(\+?\d{10,15})$/.test(String(value));
        },
        message: 'Phone number must be between 10 and 15 digits',
      },
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
    },
    profileImage: { type: String, default: "" },
    timezone: { type: String, default: 'Asia/Kolkata' },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
    },
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
    emailVerification: {
      isVerified: { type: Boolean, default: false },
      otpHash: String,
      otpExpiresAt: Date,
      lastSentAt: Date,
      verifiedAt: Date,
    },
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
      languages: { type: [String], default: ['English'] },
      currentCompany: { type: String, default: '' },
      currentTitle: { type: String, default: '' },
      location: { type: String, default: '' },
      education: { type: String, default: '' },
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
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = { User };
