const mentorService = require('../services/mentor.service');
const bookingService = require('../services/booking.service');
const availabilityService = require('../services/availability.service');

/* ================= GET MENTOR PROFILE ================= */
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await mentorService.getProfile(req.user._id);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= UPDATE PROFILE SETTINGS ================= */
exports.updateProfile = async (req, res, next) => {
  try {
    const updated = await mentorService.updateProfile(req.user._id, req.body);

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET SESSION SETTINGS ================= */
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await mentorService.getSettings(req.user._id);

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= SET AVAILABILITY ================= */
exports.setAvailability = async (req, res, next) => {
  try {
    const { schedules } = req.body;

    if (!schedules || !Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: 'schedules array is required',
      });
    }

    await mentorService.setAvailabilityWithDuration(req.user._id, schedules);
    const availability = await availabilityService.getMentorAvailability(req.user._id);

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET MY AVAILABILITY ================= */
exports.getMyAvailability = async (req, res, next) => {
  try {
    const availability = await availabilityService.getMentorAvailability(req.user._id);

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET MENTOR BOOKINGS ================= */
exports.getBookings = async (req, res, next) => {
  try {
    let page = Number(req.query.page);
    let limit = Number(req.query.limit);
    const status = req.query.status || undefined;

    page = Number.isInteger(page) && page > 0 ? page : 1;
    limit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const result = await bookingService.getMentorBookings(req.user._id, {
      page,
      limit,
      status,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET UPCOMING BOOKINGS ================= */
exports.getUpcomingBookings = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const bookings = await bookingService.getUpcomingMentorBookings(req.user._id, limit);

    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET BOOKING STATS ================= */
exports.getBookingStats = async (req, res, next) => {
  try {
    const stats = await bookingService.getMentorBookingStats(req.user._id);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= ACCEPT BOOKING ================= */
exports.acceptBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.acceptBooking(id, req.user._id);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= REJECT BOOKING ================= */
exports.rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await bookingService.rejectBooking(id, req.user._id, reason);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= START SESSION ================= */
exports.startSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.startSession(id, req.user._id);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= COMPLETE SESSION ================= */
exports.completeSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mentorNotes } = req.body;

    const booking = await bookingService.completeSession(id, req.user._id, mentorNotes);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= CANCEL BOOKING ================= */
exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.cancelBooking(id, req.user._id);

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};
