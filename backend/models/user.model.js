const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  phoneNumber: {
    type: String,
    trim: true
  },

  role: {
    type: String,
    enum: ["student", "mentor", "admin"],
    default: "student"
  },

  profileImage: {
    type: String,
    default: ""
  },

  isVerified: {
    type: Boolean,
    default: false
  },

  studentProfile: {
    classLevel: String,
    interests: [String],
    careerRecommendation: String
  },

  mentorProfile: {
    expertise: [String],
    bio: String,
    experienceYears: Number,
    pricePerSession: Number,
    rating: {
      type: Number,
      default: 0
    }
  },

  razorpayCustomerId: String

}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
