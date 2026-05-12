const userRepository = require('../repositories/user.repository');
const { Booking } = require('../models/booking.model');

// Weight configuration for scoring
const WEIGHTS = {
  INTEREST_OVERLAP: 0.40,
  MENTOR_QUALITY: 0.30,
  BOOKING_AFFINITY: 0.20,
  FRESHNESS: 0.10,
};

class RecommendationService {
  /**
   * Get recommended mentors for a student, scored and ranked.
   * @param {string} studentId
   * @param {number} limit  – max mentors to return
   * @returns {Promise<Array>}
   */
  async getRecommendedMentors(studentId, limit = 8) {
    // 1. Fetch the student's profile
    const student = await userRepository.findById(studentId);
    if (!student) return [];

    const studentInterests = (student.studentProfile?.interests || []).map(i =>
      i.toLowerCase().trim()
    );

    // 2. Fetch student's past bookings to calculate affinity
    const pastBookings = await Booking.find({
      student: studentId,
      status: { $in: ['completed', 'confirmed', 'in-progress'] },
    })
      .select('mentor')
      .lean();

    const bookedMentorCounts = {};
    for (const b of pastBookings) {
      const mid = String(b.mentor);
      bookedMentorCounts[mid] = (bookedMentorCounts[mid] || 0) + 1;
    }

    // 3. Fetch all approved mentors
    const allMentors = await userRepository.findMentors(0, 200);

    // 4. Score each mentor
    const now = Date.now();
    const scored = allMentors.map(mentor => {
      const mp = mentor.mentorProfile || {};
      const mentorExpertise = (mp.expertise || []).map(e => e.toLowerCase().trim());

      // --- Interest Overlap Score (0-100) ---
      let interestScore = 0;
      if (studentInterests.length > 0 && mentorExpertise.length > 0) {
        const overlapCount = studentInterests.filter(i =>
          mentorExpertise.some(e => e.includes(i) || i.includes(e))
        ).length;
        interestScore = (overlapCount / Math.max(studentInterests.length, 1)) * 100;
      }

      // --- Quality Score (0-100) ---
      const rating = mp.rating || 0;
      const sessions = mp.totalSessions || 0;
      const ratingNorm = Math.min(rating / 5, 1) * 60;        // 60% from rating
      const sessionNorm = Math.min(sessions / 100, 1) * 40;   // 40% from sessions
      const qualityScore = ratingNorm + sessionNorm;

      // --- Booking Affinity (0-100) ---
      const mentorId = String(mentor._id);
      const bookCount = bookedMentorCounts[mentorId] || 0;
      const affinityScore = Math.min(bookCount * 33, 100);

      // --- Freshness (0-100) ---
      const createdAt = mentor.createdAt ? new Date(mentor.createdAt).getTime() : now;
      const ageInDays = Math.max(1, (now - createdAt) / (1000 * 60 * 60 * 24));
      const freshnessScore = Math.max(0, 100 - ageInDays * 0.5); // decays slowly

      // --- Final weighted score ---
      const totalScore =
        interestScore * WEIGHTS.INTEREST_OVERLAP +
        qualityScore * WEIGHTS.MENTOR_QUALITY +
        affinityScore * WEIGHTS.BOOKING_AFFINITY +
        freshnessScore * WEIGHTS.FRESHNESS;

      return {
        _id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        profileImage: mentor.profileImage,
        createdAt: mentor.createdAt,
        mentorProfile: mp,
        matchScore: Math.round(Math.min(totalScore, 100)),
        matchBreakdown: {
          interest: Math.round(interestScore),
          quality: Math.round(qualityScore),
          affinity: Math.round(affinityScore),
          freshness: Math.round(freshnessScore),
        },
      };
    });

    // 5. Sort by score descending and return top N
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  }
}

module.exports = new RecommendationService();
