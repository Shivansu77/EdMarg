const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { TokenBlacklist } = require('../models/user.model');
const { UnauthorizedError } = require('../utils/errors');

const isBcryptHash = (value = '') =>
  typeof value === 'string' &&
  (value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$'));

class UserService {
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

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return userRepository.create({
      name: userData.name,
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber: userData.phoneNumber,
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
      throw new UnauthorizedError('Invalid credentials');
    }

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
    return userRepository.updateUserProfile(userId, data);
  }
}

module.exports = new UserService();
