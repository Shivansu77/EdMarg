const userService = require('../services/user.service');
const googleAuthUtil = require('../utils/google-auth');

const parseGoogleState = (rawState) => {
  if (!rawState || typeof rawState !== 'string') {
    return {};
  }

  try {
    const parsedState = JSON.parse(rawState);
    if (parsedState && typeof parsedState === 'object') {
      return parsedState;
    }
  } catch {
    return {
      frontendOrigin: rawState,
    };
  }

  return {};
};

const buildAuthResponseData = (user, token) => {
  const safeUser = userService.sanitizeUser(user) || {};

  return {
    _id: safeUser._id,
    name: safeUser.name,
    email: safeUser.email,
    role: safeUser.role,
    profileImage: safeUser.profileImage,
    phoneNumber: safeUser.phoneNumber,
    studentProfile: safeUser.studentProfile,
    mentorProfile: safeUser.mentorProfile,
    token,
  };
};

const resolveFrontendBase = (req) => {
  const originHeader = req ? (req.headers.origin || req.headers.referer || '') : '';
  
  // EMERGENCY PRIORITY: If we see edmarg.com in the headers, always use it.
  if (originHeader.includes('edmarg.com')) {
    return originHeader.includes('www.edmarg.com') ? 'https://www.edmarg.com' : 'https://edmarg.com';
  }

  const candidates = [
    'https://www.edmarg.com',
    'https://edmarg.com',
    process.env.FRONTEND_ORIGIN,
    process.env.FRONTEND_ORIGINS,
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(','))
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  // 1. If we have a request origin/referer, see if it's one of our allowed candidates
  if (originHeader) {
    const matchingCandidate = candidates.find(c => originHeader.startsWith(c));
    if (matchingCandidate) return matchingCandidate;
  }

  // 2. Fallback to the first candidate (usually FRONTEND_ORIGIN) or localhost
  return candidates[0] || 'http://localhost:3000';
};

/* ================= GOOGLE AUTH ================= */
exports.googleAuth = (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const origin = `${protocol}://${host}`;

    const incomingState = typeof req.query.state === 'string' ? req.query.state : '';
    const parsedState = parseGoogleState(incomingState);
    const statePayload = incomingState
      ? incomingState
      : JSON.stringify({
          frontendOrigin: parsedState.frontendOrigin || resolveFrontendBase(req),
          redirectPath: parsedState.redirectPath,
          intendedRole: parsedState.intendedRole,
        });

    const url = googleAuthUtil.getGoogleAuthUrl(origin, statePayload);
    res.redirect(url);
  } catch (err) {
    console.error('Google Auth Init Error:', err);
    res.redirect(`${resolveFrontendBase(req)}/login?error=Google%20login%20is%20not%20configured`);
  }
};

exports.googleAuthCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    const parsedState = parseGoogleState(state);
    const frontendBase = parsedState.frontendOrigin || state || resolveFrontendBase(req);
    const redirectPath = parsedState.redirectPath;
    const intendedRole = parsedState.intendedRole;

    if (!code) {
      return res.redirect(`${frontendBase}/login?error=Google%20auth%20failed`);
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    const origin = `${protocol}://${host}`;

    const tokens = await googleAuthUtil.getTokensFromCode(code, origin);
    const googleUser = await googleAuthUtil.verifyGoogleIdToken(tokens.id_token, origin);
    
    const user = await userService.googleLogin(googleUser, { intendedRole });
    const token = await userService.generateToken(user._id);

    // Set cookie
    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    const query = new URLSearchParams({
      token,
      role: user.role,
    });

    if (redirectPath) {
      query.set('redirect', redirectPath);
    }

    res.redirect(`${frontendBase}/login?${query.toString()}`);
  } catch (err) {
    console.error('Google Auth Error:', err);
    const parsedState = parseGoogleState(req.query.state);
    const frontendBase = parsedState.frontendOrigin || req.query.state || resolveFrontendBase(req);
    res.redirect(`${frontendBase}/login?error=Google%20login%20failed`);
  }
};

/* ================= SIGNUP ================= */
exports.signupUser = async (req, res) => {
  const parseProfileField = (rawValue, fallbackValue) => {
    if (typeof rawValue !== 'string' || !rawValue.trim()) {
      return fallbackValue;
    }

    try {
      return JSON.parse(rawValue);
    } catch {
      throw new Error('Invalid profile payload');
    }
  };

  try {
    const { name, email, password, phoneNumber, role } = req.body;

    const studentProfileRaw = req.body.studentProfile;
    const mentorProfileRaw = req.body.mentorProfile;

    const studentProfile = parseProfileField(studentProfileRaw, studentProfileRaw || undefined);

    const mentorProfile = parseProfileField(mentorProfileRaw, mentorProfileRaw || {});

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required',
      });
    }

    if (role === 'mentor') {
      const linkedinUrl = String(
        req.body.linkedinUrl || mentorProfile.linkedinUrl || ''
      ).trim();
      if (!linkedinUrl) {
        return res.status(400).json({
          success: false,
          message: 'LinkedIn profile link is required for mentor accounts',
        });
      }
      mentorProfile.linkedinUrl = linkedinUrl;
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(201).json({
      success: true,
      data: {
        ...buildAuthResponseData(user, token),
      },
    });
  } catch (err) {
    if (err.message === 'Invalid profile payload') {
      return res.status(400).json({
        success: false,
        message: 'Invalid profile payload',
      });
    }
    if (String(err.message || '').includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: err.message,
      });
    }
    if (err.statusCode && Number.isInteger(err.statusCode)) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message || 'Unable to create account',
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(200).json({
      success: true,
      data: {
        ...buildAuthResponseData(user, token),
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

/* ================= UPDATE PROFILE ================= */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const { 
      name, profileImage, phoneNumber, role, linkedinUrl,
      classLevel, interests,
      expertise, bio, experienceYears, pricePerSession, sessionDuration, autoConfirm, sessionNotes
    } = req.body;
    const normalizedRole = role === 'mentor' || role === 'student' ? role : userRole;

    const profileData = {
      name,
      profileImage,
      phoneNumber,
      role: normalizedRole,
    };

    if (
      normalizedRole === 'student' &&
      (classLevel !== undefined || interests !== undefined)
    ) {
      profileData.studentProfile = {
        classLevel,
        interests,
      };
    }

    if (normalizedRole === 'mentor') {
      const resolvedLinkedinUrl = String(
        linkedinUrl !== undefined ? linkedinUrl : req.user.mentorProfile?.linkedinUrl || ''
      ).trim();

      if (!resolvedLinkedinUrl) {
        return res.status(400).json({
          success: false,
          message: 'LinkedIn profile link is required for mentor accounts',
        });
      }

      profileData.mentorProfile = {
        linkedinUrl: resolvedLinkedinUrl,
        expertise,
        bio,
        experienceYears,
        pricePerSession,
        sessionDuration,
        autoConfirm,
        sessionNotes,
      };
    }

    const updatedUser = await userService.updateUserProfile(userId, profileData);

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

/* ================= SUBMIT ASSESSMENT ================= */
exports.submitAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { answers } = req.body;

    const submission = await userService.submitAssessment(userId, answers);

    return res.status(200).json({
      success: true,
      data: submission,
      message: 'Assessment submitted successfully',
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET MY ASSESSMENT ================= */
exports.getMyAssessment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const submission = await userService.getAssessmentSubmission(userId);

    return res.status(200).json({
      success: true,
      data: submission,
      message: submission ? 'Assessment fetched successfully' : 'No assessment submitted yet',
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

/* ================= GET MENTOR BY ID ================= */
exports.getMentorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await userService.getMentorById(id);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: mentor,
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
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
