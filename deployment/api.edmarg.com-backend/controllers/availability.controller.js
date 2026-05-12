const availabilityService = require('../services/availability.service');

/* ================= GET MENTOR AVAILABILITY ================= */
exports.getMentorAvailability = async (req, res, next) => {
  try {
    const { mentorId } = req.params;

    const availability = await availabilityService.getMentorAvailability(mentorId);

    return res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= SET AVAILABILITY (MENTOR ONLY) ================= */
exports.setAvailability = async (req, res, next) => {
  try {
    const { schedules } = req.body;

    if (!schedules) {
      return res.status(400).json({
        success: false,
        message: 'schedules array is required',
      });
    }

    await availabilityService.setAvailability(req.user._id, schedules);

    const updated = await availabilityService.getMentorAvailability(req.user._id);

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};
