const reviewRepository = require('../repositories/review.repository');
const { Booking } = require('../models/booking.model');
const { User } = require('../models/user.model');

class ReviewService {
  async createReview(studentId, bookingId, rating, comment) {
    // Verify booking exists and belongs to student
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.student.toString() !== studentId.toString()) {
      throw new Error('Unauthorized to review this booking');
    }

    if (booking.status !== 'completed') {
      throw new Error('Can only review completed sessions');
    }

    // Check if review already exists
    const existingReview = await reviewRepository.findByBooking(bookingId);
    if (existingReview) {
      throw new Error('Review already submitted for this booking');
    }

    // Create review
    const review = await reviewRepository.create({
      mentor: booking.mentor,
      student: studentId,
      booking: bookingId,
      rating,
      comment,
    });

    // Update mentor's average rating
    await this.updateMentorRating(booking.mentor);

    return review;
  }

  async getMentorReviews(mentorId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const reviews = await reviewRepository.findByMentor(mentorId, skip, limit);
    const total = await reviewRepository.countByMentor(mentorId);

    return {
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getMentorStats(mentorId) {
    const { averageRating, totalReviews } = await reviewRepository.getAverageRating(mentorId);
    const distribution = await reviewRepository.getRatingDistribution(mentorId);

    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    const percentages = {};
    
    for (let star = 5; star >= 1; star--) {
      percentages[star] = total > 0 ? Math.round((distribution[star] / total) * 100) : 0;
    }

    return {
      averageRating: averageRating ? parseFloat(averageRating.toFixed(1)) : 0,
      totalReviews,
      distribution,
      percentages,
    };
  }

  async updateMentorRating(mentorId) {
    const { averageRating, totalReviews } = await reviewRepository.getAverageRating(mentorId);
    
    await User.findByIdAndUpdate(mentorId, {
      'mentorProfile.rating': averageRating ? parseFloat(averageRating.toFixed(1)) : 0,
      'mentorProfile.totalSessions': totalReviews,
    });
  }
}

module.exports = new ReviewService();
