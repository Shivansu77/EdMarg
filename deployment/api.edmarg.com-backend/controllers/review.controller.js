const reviewService = require('../services/review.service');

/* ================= CREATE REVIEW ================= */
exports.createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'bookingId, rating, and comment are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const review = await reviewService.createReview(req.user._id, bookingId, rating, comment);

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET MENTOR REVIEWS ================= */
exports.getMentorReviews = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    page = Math.max(1, page);
    limit = Math.min(50, Math.max(1, limit));

    const result = await reviewService.getMentorReviews(mentorId, page, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/* ================= GET MENTOR STATS ================= */
exports.getMentorStats = async (req, res, next) => {
  try {
    const { mentorId } = req.params;
    const stats = await reviewService.getMentorStats(mentorId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};
