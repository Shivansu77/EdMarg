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
    const { name, email, password } = req.body;
    
    // In a real app, hash the password here
    const user = await User.create({ name, email, password });
    
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

