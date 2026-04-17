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
  deleteUser,
  getAllBookings,
  cancelBooking,
  getBookingStats,
} = require('../../controllers/admin.controller');

const router = express.Router();

router.use(protect, authorize('admin'));

// Users
router.get('/users', cacheResponse({ ttlSeconds: 20 }), getAllUsers);
router.get('/users/:id', cacheResponse({ ttlSeconds: 30 }), getUserDetail);
router.delete('/users/:id', deleteUser);

// Mentors
router.get('/mentors/pending', cacheResponse({ ttlSeconds: 20 }), getPendingMentors);
router.put('/mentors/:id/approve', approveMentor);
router.put('/mentors/:id/reject', rejectMentor);

// Stats
router.get('/stats', cacheResponse({ ttlSeconds: 30 }), getPlatformStats);

// Assessments
router.get('/assessments', cacheResponse({ ttlSeconds: 20 }), getAssessmentSubmissions);

// Bookings — static routes MUST come before :id param routes
router.get('/bookings', cacheResponse({ ttlSeconds: 15 }), getAllBookings);
router.get('/bookings/stats', cacheResponse({ ttlSeconds: 30 }), getBookingStats);
router.put('/bookings/:id/cancel', cancelBooking);


module.exports = router;

