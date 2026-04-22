const express = require('express');
const { protect, authorize, requireApprovedMentor } = require('../../middlewares/auth.middleware');
const { cacheResponse } = require('../../middlewares/cache.middleware');
const {
  getProfile,
  updateProfile,
  getSettings,
  setAvailability,
  getMyAvailability,
  getBookings,
  getUpcomingBookings,
  getBookingStats,
  acceptBooking,
  rejectBooking,
  startSession,
  completeSession,
  cancelBooking,
} = require('../../controllers/mentor.controller');

const router = express.Router();

// All mentor routes require authentication + mentor role
router.use(protect, authorize('mentor'));

/* ---------- Profile (always accessible to mentors, even pending/rejected) ---------- */
router.get('/profile', cacheResponse({ ttlSeconds: 30 }), getProfile);
router.put('/profile', updateProfile);

/* ---------- Everything below requires admin approval ---------- */
router.use(requireApprovedMentor);

/* ---------- Settings ---------- */
router.get('/settings', cacheResponse({ ttlSeconds: 60 }), getSettings);

/* ---------- Availability ---------- */
router.get('/availability', cacheResponse({ ttlSeconds: 30 }), getMyAvailability);
router.put('/availability', setAvailability);

/* ---------- Bookings ---------- */
router.get('/bookings', cacheResponse({ ttlSeconds: 20 }), getBookings);
router.get('/bookings/upcoming', cacheResponse({ ttlSeconds: 20 }), getUpcomingBookings);
router.get('/bookings/stats', cacheResponse({ ttlSeconds: 20 }), getBookingStats);

/* ---------- Booking Actions ---------- */
router.put('/bookings/:id/accept', acceptBooking);
router.put('/bookings/:id/reject', rejectBooking);
router.put('/bookings/:id/cancel', cancelBooking);

/* ---------- Session Lifecycle ---------- */
router.put('/bookings/:id/start', startSession);
router.put('/bookings/:id/complete', completeSession);

module.exports = router;
