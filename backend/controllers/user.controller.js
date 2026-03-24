const User = require('../models/user.model');

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
    const { name, email, password, phoneNumber, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists with this email',
      });
    }

    // In a real app, hash the password here before save.
    const user = await User.create({ name, email, password, phoneNumber, role });

    const safeUser = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, data: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // In a real app, compare hashed password with bcrypt.
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const safeUser = await User.findById(user._id).select('-password');
    return res.status(200).json({
      success: true,
      data: safeUser,
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

