const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_env';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
};

const signToken = (user) => jwt.sign(
  {
    userId: user._id,
    role: user.role,
    email: user.email,
  },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES_IN }
);

const sanitizeUser = (userDoc) => ({
  _id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  phoneNumber: userDoc.phoneNumber,
  role: userDoc.role,
  profileImage: userDoc.profileImage,
  isVerified: userDoc.isVerified,
  createdAt: userDoc.createdAt,
  updatedAt: userDoc.updatedAt,
});

const sendAuthResponse = (res, statusCode, user, message) => {
  const token = signToken(user);
  res.cookie('accessToken', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    data: sanitizeUser(user),
    message,
  });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Public
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, phoneNumber, role } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'name, email, and password are required',
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phoneNumber: phoneNumber?.trim() || '',
      role,
    });

    return sendAuthResponse(res, 201, user, 'Signup successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    return sendAuthResponse(res, 200, user, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
exports.logoutUser = async (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
