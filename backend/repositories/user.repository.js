const { User } = require('../models/user.model');

const buildPublicMentorQuery = () => ({
  role: 'mentor',
  // Include approved, pending, and legacy mentors (missing status).
  // Only hide explicitly rejected mentors from student browse.
  $or: [
    { 'mentorProfile.approvalStatus': { $ne: 'rejected' } },
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

  async findPendingMentors(page = 1, limit = 20) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    return User.find({
      role: 'mentor',
      'mentorProfile.approvalStatus': 'pending',
    })
      .select('-password')
      .skip(skip)
      .limit(safeLimit)
      .lean();
  }

  async countPendingMentors() {
    return User.countDocuments({
      role: 'mentor',
      'mentorProfile.approvalStatus': 'pending',
    });
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

  async updateUserProfile(id, profileData) {
    const updateObj = {};
    if (profileData.name !== undefined) updateObj.name = profileData.name;
    if (profileData.profileImage !== undefined) updateObj.profileImage = profileData.profileImage;
    
    // Manage nested studentProfile fields
    if (profileData.studentProfile) {
      if (profileData.studentProfile.classLevel !== undefined) {
        updateObj['studentProfile.classLevel'] = profileData.studentProfile.classLevel;
      }
      if (profileData.studentProfile.interests !== undefined) {
        updateObj['studentProfile.interests'] = profileData.studentProfile.interests;
      }
    }

    // Manage nested mentorProfile fields
    if (profileData.mentorProfile) {
      const mentorFields = [
        'expertise', 'bio', 'experienceYears', 'pricePerSession',
        'sessionDuration', 'autoConfirm', 'sessionNotes'
      ];
      
      for (const field of mentorFields) {
        if (profileData.mentorProfile[field] !== undefined) {
          updateObj[`mentorProfile.${field}`] = profileData.mentorProfile[field];
        }
      }
    }

    return User.findByIdAndUpdate(id, { $set: updateObj }, { new: true })
      .select('-password')
      .lean();
  }
}

module.exports = new UserRepository();
