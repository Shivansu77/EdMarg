const { User } = require('../models/user.model');

class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findById(id) {
    return User.findById(id);
  }

  async create(userData) {
    return User.create(userData);
  }

  async findMentors(skip, limit) {
    return User.find({
      role: 'mentor',
      'mentorProfile.approvalStatus': 'approved',
    })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countMentors() {
    return User.countDocuments({
      role: 'mentor',
      'mentorProfile.approvalStatus': 'approved',
    });
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
}

module.exports = new UserRepository();
