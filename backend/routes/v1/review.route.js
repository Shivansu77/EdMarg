const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  createReview,
  getMentorReviews,
  getMentorStats,
} = require('../../controllers/review.controller');

const router = express.Router();

// Public - get mentor reviews and stats
router.get('/mentor/:mentorId', getMentorReviews);
router.get('/mentor/:mentorId/stats', getMentorStats);

// Protected - student creates a review
router.post('/', protect, authorize('student'), createReview);

module.exports = router;
