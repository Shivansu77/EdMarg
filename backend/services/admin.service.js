const userRepository = require('../repositories/user.repository');

class AdminService {
  async getAllUsers(page = 1, limit = 20, role = null) {
    const skip = (page - 1) * limit;
    const query = role ? { role } : {};

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

  async getPendingMentors(limit = 10) {
    return userRepository.findPendingMentors(limit);
  }
}

module.exports = new AdminService();
