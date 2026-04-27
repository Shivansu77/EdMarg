const { Review } = require('../models/review.model');

class ReviewRepository {
  async create(reviewData) {
    return Review.create(reviewData);
  }

  async findByMentor(mentorId, skip = 0, limit = 10) {
    return Review.find({ mentor: mentorId })
      .populate('student', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByMentor(mentorId) {
    return Review.countDocuments({ mentor: mentorId });
  }

  async getAverageRating(mentorId) {
    const result = await Review.aggregate([
      { $match: { mentor: mentorId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
  }

  async getRatingDistribution(mentorId) {
    const result = await Review.aggregate([
      { $match: { mentor: mentorId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    result.forEach((item) => {
      distribution[item._id] = item.count;
    });

    return distribution;
  }

  async findByBooking(bookingId) {
    return Review.findOne({ booking: bookingId }).lean();
  }

  async findByBookings(bookingIds = []) {
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return [];
    }

    return Review.find({ booking: { $in: bookingIds } })
      .select('booking rating comment createdAt updatedAt')
      .lean();
  }
}

module.exports = new ReviewRepository();
