const bookingService = require('../services/booking.service');

/* ================= CREATE BOOKING ================= */
exports.createBooking = async (req, res, next) => {
  try {
    const { mentorId, date, startTime, sessionType, notes } = req.body;

    if (!mentorId || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: 'mentorId, date, and startTime are required',
      });
    }

    const booking = await bookingService.createBooking({
      studentId: req.user._id,
      mentorId,
      date,
      startTime,
      sessionType,
      notes,
    });

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET STUDENT BOOKINGS ================= */
exports.getMyBookings = async (req, res, next) => {
  try {
    let page = Number(req.query.page);
    let limit = Number(req.query.limit);
    const status = req.query.status || undefined;

    page = Number.isInteger(page) && page > 0 ? page : 1;
    limit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const result = await bookingService.getStudentBookings(req.user._id, {
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

/* ================= GET AVAILABLE SLOTS ================= */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date query parameter is required (YYYY-MM-DD)',
      });
    }

    const slots = await bookingService.getAvailableSlots(mentorId, date);

    return res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (err) {
    next(err);
  }
};
