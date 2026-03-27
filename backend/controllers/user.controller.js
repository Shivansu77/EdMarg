const userService = require('../services/user.service');

/* ================= SIGNUP ================= */
exports.signupUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role, studentProfile, mentorProfile } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required',
      });
    }

    const user = await userService.signupUser({
      name,
      email,
      password,
      phoneNumber,
      role,
      studentProfile,
      mentorProfile,
    });

    const token = await userService.generateToken(user._id);

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token,
      },
    });
  } catch (err) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message || 'Unable to create account',
    });
  }
};

/* ================= LOGIN ================= */
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await userService.loginUser(email, password);

    const token = await userService.generateToken(user._id);

    // secure cookie
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ================= CURRENT USER ================= */
exports.getCurrentUser = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= BROWSE MENTORS ================= */
exports.getBrowseMentors = async (req, res, next) => {
  try {
    let page = Number(req.query.page);
    let limit = Number(req.query.limit);

    page = Number.isInteger(page) && page > 0 ? page : 1;
    limit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const mentors = await userService.getMentors(page, limit);
    const total = await userService.getMentorCount();

    return res.status(200).json({
      success: true,
      count: mentors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: mentors,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= LOGOUT ================= */
exports.logoutUser = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;

    // fallback to Authorization header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (token) {
      await userService.logoutUser(token);
    }

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};
