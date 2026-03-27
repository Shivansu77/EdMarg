const { User } = require('../models/user.model');

const buildPublicMentorQuery = () => ({
  role: 'mentor',
  $or: [
    { 'mentorProfile.approvalStatus': 'approved' },
    { 'mentorProfile.approvalStatus': { $exists: false } },
  ],
});

class UserRepository {
  async findByEmail(email) {
    const normalizedEmail = String(email || '').trim();

    return User.findOne({
      email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
  }

  async findById(id) {
    return User.findById(id);
  }

  async create(userData) {
    return User.create(userData);
  }

  async updatePassword(id, password) {
    return User.findByIdAndUpdate(id, { password }, { new: true });
  }

  async findMentors(skip, limit) {
    return User.find(buildPublicMentorQuery())
      .select(
        '-password -mentorProfile.approvalStatus -mentorProfile.approvedAt -mentorProfile.approvedBy -mentorProfile.rejectionReason'
      )
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countMentors() {
    return User.countDocuments(buildPublicMentorQuery());
  }

  async findByRole(role, skip, limit) {
    return User.find({ role })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByRole(role) {
    return User.countDocuments({ role });
  }

  async findPendingMentors(limit) {
    return User.find({
      role: 'mentor',
      'mentorProfile.approvalStatus': 'pending',
    })
      .select('-password')
      .limit(limit)
      .lean();
  }

  async updateMentorStatus(id, status, metadata = {}) {
    return User.findByIdAndUpdate(
      id,
      {
        'mentorProfile.approvalStatus': status,
        ...Object.keys(metadata).reduce((acc, key) => {
          acc[`mentorProfile.${key}`] = metadata[key];
          return acc;
        }, {}),
      },
      { new: true }
    ).select('-password');
  }

  async countByQuery(query) {
    return User.countDocuments(query);
  }

  async findByQuery(query, skip, limit) {
    return User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async updateMentorProfile(id, profileData) {
    const updateObj = {};
    for (const [key, value] of Object.entries(profileData)) {
      updateObj[`mentorProfile.${key}`] = value;
    }

    return User.findByIdAndUpdate(id, updateObj, { new: true })
      .select('-password')
      .lean();
  }

  async incrementMentorSessions(id) {
    return User.findByIdAndUpdate(
      id,
      { $inc: { 'mentorProfile.totalSessions': 1 } },
      { new: true }
    ).select('-password');
  }
}

module.exports = new UserRepository();
