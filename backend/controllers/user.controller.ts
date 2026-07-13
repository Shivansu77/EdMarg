// @ts-nocheck
const userService = require('../services/user.service');
const recommendationService = require('../services/recommendation.service');

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

/* ================= APPLY AS MENTOR ================= */
exports.applyAsMentor = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const mentorData = req.body;

    const updatedUser = await userService.applyAsMentor(userId, mentorData);

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Application submitted successfully. Your profile is now pending admin approval.',
    });
  } catch (err) {
    next(err);
  }
};

/* ================= WITHDRAW MENTOR APPLICATION ================= */
exports.withdrawMentorApplication = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updatedUser = await userService.withdrawMentorApplication(userId);

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Mentor application withdrawn successfully.',
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
      expertise, bio, experienceYears, pricePerSession, sessionDuration, autoConfirm, sessionNotes,
      languages, currentCompany, currentTitle, location, education,
      timezone, notificationPreferences, profileVisibility
    } = req.body;
    const normalizedRole = role === 'mentor' || role === 'student' ? role : userRole;

    const profileData = {
      name,
      profileImage,
      phoneNumber,
      role: normalizedRole,
      timezone,
      notificationPreferences,
      profileVisibility,
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
        languages,
        currentCompany,
        currentTitle,
        location,
        education,
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

/* ================= RECOMMENDED MENTORS ================= */
exports.getRecommendedMentors = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    let limit = Number(req.query.limit);
    limit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 20) : 8;

    const recommendations = await recommendationService.getRecommendedMentors(studentId, limit);

    return res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
};
