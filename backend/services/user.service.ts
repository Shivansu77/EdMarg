// @ts-nocheck
const { createClerkClient, verifyToken } = require('@clerk/backend');
const userRepository = require('../repositories/user.repository');
const { UnauthorizedError, ValidationError } = require('../utils/errors');
const studentAssessmentRepository = require('../repositories/studentAssessment.repository');
const careerAssessmentService = require('./careerAssessment.service');
const { validateEmail } = require('../utils/validators');

const normalizePhoneNumber = (phoneNumber) => {
  if (phoneNumber === undefined || phoneNumber === null) {
    return undefined;
  }
  return String(phoneNumber).trim();
};

const getClerkClient = () => {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new ValidationError('Clerk is not configured on the server');
  }

  return createClerkClient({ secretKey });
};

const getPrimaryEmail = (clerkUser) => {
  const primaryEmailId = clerkUser.primaryEmailAddressId;
  const primaryEmail = Array.isArray(clerkUser.emailAddresses)
    ? clerkUser.emailAddresses.find((entry) => entry.id === primaryEmailId) ||
      clerkUser.emailAddresses[0]
    : null;

  return primaryEmail?.emailAddress || '';
};

const getPrimaryPhoneNumber = (clerkUser) => {
  const primaryPhoneId = clerkUser.primaryPhoneNumberId;
  const primaryPhone = Array.isArray(clerkUser.phoneNumbers)
    ? clerkUser.phoneNumbers.find((entry) => entry.id === primaryPhoneId) ||
      clerkUser.phoneNumbers[0]
    : null;

  return primaryPhone?.phoneNumber || undefined;
};

const buildNameFromClerk = (clerkUser, email) => {
  const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim();
  return fullName || clerkUser.username || String(email || '').split('@')[0] || 'Student';
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

  async syncClerkUserByClerkId(clerkUserId) {
    if (!clerkUserId) {
      throw new UnauthorizedError('Invalid Clerk session');
    }

    const clerkUser = await getClerkClient().users.getUser(clerkUserId);
    const email = validateEmail(getPrimaryEmail(clerkUser));
    const name = buildNameFromClerk(clerkUser, email);
    const phoneNumber = normalizePhoneNumber(getPrimaryPhoneNumber(clerkUser));
    const profileImage = clerkUser.imageUrl || '';

    const updateData = {
      clerkId: clerkUserId,
      name,
      email,
      profileImage,
    };

    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }

    // Utilize upsert logic to ensure we don't hit duplicate key errors if webhook is delayed
    return userRepository.upsertByClerkId(clerkUserId, updateData);
  }

  async processWebhookUserCreated(payload) {
    const email = validateEmail(getPrimaryEmail(payload));
    const name = buildNameFromClerk(payload, email);
    const phoneNumber = normalizePhoneNumber(getPrimaryPhoneNumber(payload));
    const profileImage = payload.image_url || '';

    const userData = {
      clerkId: payload.id,
      name,
      email,
      phoneNumber,
      profileImage,
      role: 'student',
    };

    return userRepository.upsertByClerkId(payload.id, userData);
  }

  async processWebhookUserUpdated(payload) {
    const email = validateEmail(getPrimaryEmail(payload));
    const name = buildNameFromClerk(payload, email);
    const phoneNumber = normalizePhoneNumber(getPrimaryPhoneNumber(payload));
    const profileImage = payload.image_url || '';

    const updateData = {
      name,
      email,
      profileImage,
    };

    if (phoneNumber !== undefined) {
      updateData.phoneNumber = phoneNumber;
    }

    return userRepository.upsertByClerkId(payload.id, updateData);
  }

  async processWebhookUserDeleted(payload) {
    const clerkId = payload.id;
    if (!clerkId) return null;

    const user = await userRepository.findByClerkId(clerkId);
    if (!user) return null;

    // We can physically delete the user for now
    const { User } = require('../models/user.model');
    return User.findByIdAndDelete(user._id);
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

  async applyAsMentor(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'student') {
      throw new ValidationError('Only students can apply to become a mentor');
    }

    if (!data.linkedinUrl || !data.linkedinUrl.trim()) {
      throw new ValidationError('LinkedIn profile link is required');
    }

    return userRepository.applyAsMentor(userId, data);
  }

  async withdrawMentorApplication(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'student') {
      throw new Error('Only students can withdraw a mentor application');
    }

    const approvalStatus = user.mentorProfile?.approvalStatus;
    if (!approvalStatus || approvalStatus === 'approved') {
      throw new Error('No pending or rejected application to withdraw');
    }

    return userRepository.updateUserProfile(userId, {
      mentorProfile: {
        ...user.mentorProfile,
        approvalStatus: null,
        linkedinUrl: null,
      },
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

}

module.exports = new UserService();
