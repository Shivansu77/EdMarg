// @ts-nocheck
const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { cacheResponse } = require('../../middlewares/cache.middleware');
const {
  getBrowseMentors,
  getMentorById,
  getCurrentUser,
  updateUserProfile,
  submitAssessment,
  getMyAssessment,
  getRecommendedMentors,
  applyAsMentor,
  withdrawMentorApplication,
} = require('../../controllers/user.controller');

const router = express.Router();

router.get('/me', protect, cacheResponse({ ttlSeconds: 30 }), getCurrentUser);
router.get('/browsementor', cacheResponse({ ttlSeconds: 120 }), getBrowseMentors);
router.get('/mentor/:id', cacheResponse({ ttlSeconds: 120 }), getMentorById);
router.put('/profile', protect, updateUserProfile);
router.put('/apply-mentor', protect, authorize('student'), applyAsMentor);
router.delete('/withdraw-mentor', protect, authorize('student'), withdrawMentorApplication);
router.get('/assessment', protect, authorize('student'), getMyAssessment);
router.post('/assessment', protect, authorize('student'), submitAssessment);
router.get('/recommended-mentors', protect, authorize('student'), cacheResponse({ ttlSeconds: 60 }), getRecommendedMentors);

module.exports = router;
