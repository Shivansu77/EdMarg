const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { TokenBlacklist } = require('../models/user.model');
const { UnauthorizedError, ValidationError } = require('../utils/errors');
const studentAssessmentRepository = require('../repositories/studentAssessment.repository');
const careerAssessmentService = require('./careerAssessment.service');

const isBcryptHash = (value = '') =>
  typeof value === 'string' &&
  (value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$'));

const normalizePhoneNumber = (phoneNumber) => {
  if (phoneNumber === undefined || phoneNumber === null) {
    return undefined;
  }

  const digits = String(phoneNumber).replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  if (digits.length !== 10) {
    throw new ValidationError('Phone number must be exactly 10 digits');
  }

  return digits;
};

class UserService {
  sanitizeUser(user) {
    if (!user) {
      return null;
    }

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;
    return safeUser;
  }

  async createUser(userData) {
    const normalizedEmail = String(userData.email || '').trim().toLowerCase();
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) throw new Error('User already exists');

    return userRepository.create({
      ...userData,
      email: normalizedEmail,
    });
  }

  async signupUser(userData) {
    const normalizedEmail = String(userData.email || '').trim().toLowerCase();
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) throw new Error('User already exists');

    const normalizedPassword = String(userData.password || '');
    if (normalizedPassword.length < 4) {
      throw new ValidationError('Password must be at least 4 characters');
    }

    const normalizedPhoneNumber = normalizePhoneNumber(userData.phoneNumber);

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

    return userRepository.create({
      name: userData.name,
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber: normalizedPhoneNumber,
      role: userData.role,
      studentProfile: userData.studentProfile,
      mentorProfile: userData.mentorProfile,
    });
  }

  async loginUser(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '');
    const user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      console.warn(`[AUTH_FAILURE] User not found: ${normalizedEmail}`);
      throw new UnauthorizedError('Invalid credentials');
    }

    const storedPassword = String(user.password || '');
    let isValid = false;

    if (isBcryptHash(storedPassword)) {
      isValid = await bcrypt.compare(normalizedPassword, storedPassword);
    } else {
      isValid = normalizedPassword === storedPassword;

      if (isValid) {
        await userRepository.updatePassword(user._id, normalizedPassword);
      }
    }

    if (!isValid) {
      console.warn(`[AUTH_FAILURE] Invalid password for user: ${normalizedEmail}`);
      throw new UnauthorizedError('Invalid credentials');
    }

    console.log(`[AUTH_SUCCESS] User logged in: ${normalizedEmail}`);
    return user;
  }

  async generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  async getMentors(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return userRepository.findMentors(skip, limit);
  }

  async getMentorCount() {
    return userRepository.countMentors();
  }

  async getMentorById(mentorId) {
    const mentor = await userRepository.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return null;
    }

    if (mentor.mentorProfile?.approvalStatus !== 'approved') {
      return null;
    }

    // Remove sensitive fields
    const mentorObj = mentor.toObject ? mentor.toObject() : mentor;
    delete mentorObj.password;
    return mentorObj;
  }

  async getUserById(userId) {
    return userRepository.findById(userId);
  }

  async logoutUser(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await TokenBlacklist.create({
      token,
      expiresAt: new Date(decoded.exp * 1000),
    });
  }

  async updateUserProfile(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const safeData = { ...data };
    if (Object.prototype.hasOwnProperty.call(safeData, 'phoneNumber')) {
      safeData.phoneNumber = normalizePhoneNumber(safeData.phoneNumber);
    }

    return userRepository.updateUserProfile(userId, safeData);
  }

  async submitAssessment(userId, answers) {
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      throw new ValidationError('Invalid assessment payload');
    }

    const answerKeys = Object.keys(answers);
    if (answerKeys.length === 0) {
      throw new ValidationError('Assessment answers cannot be empty');
    }

    const result = careerAssessmentService.evaluate(answers);
    return studentAssessmentRepository.upsertAssessment(userId, answers, result);
  }

  async getAssessmentSubmission(userId) {
    return studentAssessmentRepository.findByStudent(userId);
  }

  async googleLogin(googlePayload, options = {}) {
    const { email, name, picture, sub: googleId } = googlePayload;
    const normalizedEmail = email.trim().toLowerCase();
    const intendedRole =
      options.intendedRole === 'mentor' || options.intendedRole === 'student'
        ? options.intendedRole
        : 'student';

    let user = await userRepository.findByEmail(normalizedEmail);

    if (!user) {
      // Create new user if not exists
      // Using a random long password for OAuth users
      const dummyPassword = await bcrypt.hash(Math.random().toString(36) + googleId, 10);
      
      user = await userRepository.create({
        name,
        email: normalizedEmail,
        password: dummyPassword,
        role: intendedRole,
        profileImage: picture,
      });
      console.log(`[AUTH_GOOGLE] New user created: ${normalizedEmail}`);
    } else {
      // Update profile picture if user exists but has no picture
      if (!user.profileImage && picture) {
        await userRepository.updateUserProfile(user._id, { profileImage: picture });
      }
      console.log(`[AUTH_GOOGLE] Existing user logged in: ${normalizedEmail}`);
    }

    return user;
  }
}

module.exports = new UserService();
