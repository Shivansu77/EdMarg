const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { TokenBlacklist } = require('../models/user.model');

class UserService {
  async createUser(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return userRepository.create({
      ...userData,
      password: hashedPassword,
    });
  }

  async loginUser(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

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
}

module.exports = new UserService();
