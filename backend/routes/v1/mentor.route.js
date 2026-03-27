const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
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

/* ---------- Profile & Settings ---------- */
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/settings', getSettings);

/* ---------- Availability ---------- */
router.get('/availability', getMyAvailability);
router.put('/availability', setAvailability);

/* ---------- Bookings ---------- */
router.get('/bookings', getBookings);
router.get('/bookings/upcoming', getUpcomingBookings);
router.get('/bookings/stats', getBookingStats);

/* ---------- Booking Actions ---------- */
router.put('/bookings/:id/accept', acceptBooking);
router.put('/bookings/:id/reject', rejectBooking);
router.put('/bookings/:id/cancel', cancelBooking);

/* ---------- Session Lifecycle ---------- */
router.put('/bookings/:id/start', startSession);
router.put('/bookings/:id/complete', completeSession);

module.exports = router;
