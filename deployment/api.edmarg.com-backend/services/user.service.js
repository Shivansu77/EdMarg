const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { TokenBlacklist } = require('../models/user.model');
const { AppError, UnauthorizedError, ValidationError } = require('../utils/errors');
const studentAssessmentRepository = require('../repositories/studentAssessment.repository');
const careerAssessmentService = require('./careerAssessment.service');
const { validateEmail } = require('../utils/validators');
const { sendEmailVerificationOtpEmail } = require('./email.service');

const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const buildRetryableError = (message, statusCode, retryAfterSeconds) =>
  Object.assign(new AppError(message, statusCode), {
    retryAfterSeconds: Math.max(1, Math.ceil(Number(retryAfterSeconds) || 0)),
  });

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

  if (digits.length < 10 || digits.length > 15) {
    throw new ValidationError('Phone number must be between 10 and 15 digits');
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
    const normalizedEmail = validateEmail(userData.email);
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) throw new Error('User already exists');

    return userRepository.create({
      ...userData,
      email: normalizedEmail,
    });
  }

  async signupUser(userData) {
    const normalizedEmail = validateEmail(userData.email);
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
    const normalizedEmail = validateEmail(email);
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
    const normalizedEmail = validateEmail(email);
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

  async sendEmailVerificationOtp(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (user.emailVerification?.isVerified) {
      return {
        alreadyVerified: true,
        lastSentAt: user.emailVerification?.lastSentAt
          ? new Date(user.emailVerification.lastSentAt).toISOString()
          : undefined,
      };
    }

    const now = Date.now();
    const lastSentAt = user.emailVerification?.lastSentAt
      ? new Date(user.emailVerification.lastSentAt).getTime()
      : 0;

    const retryAfterMs = lastSentAt ? OTP_RESEND_COOLDOWN_MS - (now - lastSentAt) : 0;
    if (retryAfterMs > 0) {
      throw buildRetryableError(
        'Please wait a minute before requesting another OTP',
        429,
        retryAfterMs / 1000
      );
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const previousEmailVerification = user.emailVerification?.toObject
      ? user.emailVerification.toObject()
      : user.emailVerification
        ? { ...user.emailVerification }
        : null;
    const pendingEmailVerification = {
      ...(previousEmailVerification || {}),
      isVerified: false,
      otpHash,
      otpExpiresAt: new Date(now + OTP_EXPIRY_MS),
      lastSentAt: new Date(now),
      verifiedAt: previousEmailVerification?.verifiedAt,
    };

    await user.updateOne({
      $set: {
        emailVerification: pendingEmailVerification,
      },
    });

    const isSmtpConfigured = !!(
      (process.env.SMTP_HOST || '').trim() &&
      (process.env.SMTP_USER || '').trim() &&
      (process.env.SMTP_PASS || '').trim()
    );

    const sent = await sendEmailVerificationOtpEmail({
      to: user.email,
      name: user.name,
      otp,
    });

    if (!sent) {
      const restoredEmailVerification = previousEmailVerification || {
        isVerified: false,
      };

      await user.updateOne({
        $set: {
          emailVerification: restoredEmailVerification,
        },
      });

      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[EMAIL_OTP_DEV_FALLBACK] SMTP not configured. OTP for ${user.email}: ${otp}`);
        return { alreadyVerified: false, delivery: 'log' };
      }

      const reason = isSmtpConfigured
        ? 'Failed to deliver OTP email. Check SMTP credentials on the server.'
        : 'Email service is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in server environment.';

      console.error(`[OTP] Email send failed — ${reason}`);
      throw new ValidationError(reason);
    }

    return {
      alreadyVerified: false,
      delivery: 'email',
      lastSentAt: new Date(now).toISOString(),
      resendAvailableAt: new Date(now + OTP_RESEND_COOLDOWN_MS).toISOString(),
    };
  }

  async verifyEmailOtp(userId, otp) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }

    if (user.emailVerification?.isVerified) {
      return this.sanitizeUser(user);
    }

    const normalizedOtp = String(otp || '').trim();
    if (!/^\d{6}$/.test(normalizedOtp)) {
      throw new ValidationError('OTP must be a 6-digit code');
    }

    const expiresAt = user.emailVerification?.otpExpiresAt
      ? new Date(user.emailVerification.otpExpiresAt).getTime()
      : 0;

    if (!user.emailVerification?.otpHash || !expiresAt || expiresAt < Date.now()) {
      throw new ValidationError('OTP expired. Please request a new one');
    }

    const otpHash = crypto.createHash('sha256').update(normalizedOtp).digest('hex');
    if (otpHash !== user.emailVerification.otpHash) {
      throw new ValidationError('Invalid OTP');
    }

    const verifiedEmailVerification = {
      isVerified: true,
      verifiedAt: new Date(),
      lastSentAt: user.emailVerification?.lastSentAt,
    };

    await user.updateOne({
      $set: {
        emailVerification: verifiedEmailVerification,
      },
    });

    const updatedUser = await userRepository.findById(userId);
    return this.sanitizeUser(updatedUser);
  }
}

module.exports = new UserService();
