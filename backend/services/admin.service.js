const userRepository = require('../repositories/user.repository');
const studentAssessmentRepository = require('../repositories/studentAssessment.repository');
const bookingRepository = require('../repositories/booking.repository');
const { User } = require('../models/user.model');

class AdminService {
  async getAllUsers(page = 1, limit = 20, role = null, search = '') {
    const skip = (page - 1) * limit;
    const query = role ? { role } : {};

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const [users, total] = await Promise.all([
      userRepository.findByQuery(query, skip, limit),
      userRepository.countByQuery(query),
    ]);

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async approveMentor(mentorId, adminId) {
    const mentor = await userRepository.updateMentorStatus(mentorId, 'approved', {
      approvedAt: new Date(),
      approvedBy: adminId,
    });

    if (!mentor) throw new Error('Mentor not found');
    return mentor;
  }

  async rejectMentor(mentorId, reason = 'No reason provided') {
    const mentor = await userRepository.updateMentorStatus(mentorId, 'rejected', {
      rejectionReason: reason,
    });

    if (!mentor) throw new Error('Mentor not found');
    return mentor;
  }

  async getPlatformStats() {
    const [totalStudents, totalMentors, approvedMentors, pendingMentors] = await Promise.all([
      userRepository.countByRole('student'),
      userRepository.countByRole('mentor'),
      userRepository.countByQuery({
        role: 'mentor',
        'mentorProfile.approvalStatus': 'approved',
      }),
      userRepository.countByQuery({
        role: 'mentor',
        'mentorProfile.approvalStatus': 'pending',
      }),
    ]);

    return {
      totalStudents,
      totalMentors,
      approvedMentors,
      pendingMentors,
      totalUsers: totalStudents + totalMentors,
    };
  }

  async getPendingMentors(page = 1, limit = 20) {
    const [mentors, total] = await Promise.all([
      userRepository.findPendingMentors(page, limit),
      userRepository.countPendingMentors(),
    ]);

    return {
      mentors,
      total,
      page,
      pages: Math.ceil(total / Math.max(1, limit)),
    };
  }

  async getAssessmentSubmissions(page = 1, limit = 20) {
    const [assessments, total] = await Promise.all([
      studentAssessmentRepository.findRecent({ page, limit }),
      studentAssessmentRepository.countAll(),
    ]);

    return {
      assessments,
      total,
      page: Math.max(1, Number(page) || 1),
      pages: Math.ceil(total / Math.max(1, limit)),
    };
  }

  async getUserById(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    if (user.role === 'admin') throw new Error('Cannot delete admin accounts');
    await User.findByIdAndDelete(userId);
    return { deleted: true, id: userId };
  }

  async getAllBookings(page = 1, limit = 20, { status, search } = {}) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      bookingRepository.findAll({ skip, limit, status, search }),
      bookingRepository.countAll({ status, search }),
    ]);
    return {
      bookings,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async cancelBooking(bookingId, reason) {
    const booking = await bookingRepository.cancelById(bookingId, reason);
    if (!booking) throw new Error('Booking not found');
    return booking;
  }

  async getBookingStatusBreakdown() {
    const groups = await bookingRepository.countByStatus();
    const breakdown = {};
    for (const g of groups) {
      breakdown[g._id] = g.count;
    }
    return breakdown;
  }
}

module.exports = new AdminService();
