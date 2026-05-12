const express = require('express');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  getMentorAvailability,
  setAvailability,
} = require('../../controllers/availability.controller');

const router = express.Router();

// Public — get mentor's availability schedule
router.get('/:mentorId', getMentorAvailability);

// Protected — mentor sets their own availability
router.put('/', protect, authorize('mentor'), setAvailability);

module.exports = router;
