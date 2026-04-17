const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { cacheResponse } = require('../../middlewares/cache.middleware');
const {
  signupUser,
  loginUser,
  getBrowseMentors,
  getMentorById,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  submitAssessment,
  getMyAssessment,
  googleAuth,
  googleAuthCallback,
} = require('../../controllers/user.controller');

const router = express.Router();

router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleAuthCallback);
router.post('/', signupUser);
router.post('/login', loginUser);
router.get('/me', protect, cacheResponse({ ttlSeconds: 30 }), getCurrentUser);
router.get('/browsementor', cacheResponse({ ttlSeconds: 120 }), getBrowseMentors);
router.get('/mentor/:id', cacheResponse({ ttlSeconds: 120 }), getMentorById);
router.post('/logout', logoutUser);
router.put('/profile', protect, updateUserProfile);
router.get('/assessment', protect, authorize('student'), getMyAssessment);
router.post('/assessment', protect, authorize('student'), submitAssessment);

module.exports = router;
