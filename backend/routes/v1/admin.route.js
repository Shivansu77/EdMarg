const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { cacheResponse } = require('../../middlewares/cache.middleware');
const {
  getAllUsers,
  getPendingMentors,
  getAssessmentSubmissions,
  approveMentor,
  rejectMentor,
  getPlatformStats,
  getUserDetail,
} = require('../../controllers/admin.controller');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', cacheResponse({ ttlSeconds: 20 }), getAllUsers);
router.get('/users/:id', cacheResponse({ ttlSeconds: 30 }), getUserDetail);
router.get('/mentors/pending', cacheResponse({ ttlSeconds: 20 }), getPendingMentors);
router.get('/assessments', cacheResponse({ ttlSeconds: 20 }), getAssessmentSubmissions);
router.put('/mentors/:id/approve', approveMentor);
router.put('/mentors/:id/reject', rejectMentor);
router.get('/stats', cacheResponse({ ttlSeconds: 30 }), getPlatformStats);

module.exports = router;
