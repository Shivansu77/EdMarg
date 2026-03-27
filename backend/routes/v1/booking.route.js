const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAvailableSlots,
} = require('../../controllers/booking.controller');

const router = express.Router();

// Public — get available slots for a mentor on a date
router.get('/mentor/:mentorId/slots', getAvailableSlots);

// Protected — student creates a booking
router.post('/', protect, authorize('student'), createBooking);

// Protected — get my bookings (student)
router.get('/my-bookings', protect, getMyBookings);

// Protected — cancel a booking
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
