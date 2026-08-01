// @ts-nocheck
const { User } = require('../models/user.model');

const buildPublicMentorQuery = () => ({
  role: 'mentor',
  // Students should only see mentors explicitly approved by admins.
  'mentorProfile.approvalStatus': 'approved',
});

class UserRepository {
  async findByEmail(email) {
    const normalizedEmail = String(email || '').trim();

    return User.findOne({
      email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    });
  }

  async findByClerkId(clerkId) {
    return User.findOne({ clerkId: String(clerkId || '').trim() });
  }

  async findById(id) {
    return User.findById(id);
  }

  async create(userData) {
    return User.create(userData);
  }

  async upsertByClerkId(clerkId, userData) {
    const cleanClerkId = String(clerkId || '').trim();
    
    if (userData.email) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser && existingUser.clerkId !== cleanClerkId) {
        // Link new clerkId to existing email account
        return User.findOneAndUpdate(
          { email: userData.email },
          { $set: { ...userData, clerkId: cleanClerkId } },
          { new: true }
        ).select('-password');
      }
    }

    return User.findOneAndUpdate(
      { clerkId: cleanClerkId },
      { $set: userData },
      { new: true, upsert: true }
    ).select('-password');
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
      'mentorProfile.approvalStatus': 'pending',
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean();
  }

  async countPendingMentors() {
    return User.countDocuments({
      'mentorProfile.approvalStatus': 'pending',
    });
  }

  async updateMentorStatus(id, status, metadata = {}) {
    const updateObj = {
      'mentorProfile.approvalStatus': status,
      ...Object.keys(metadata).reduce((acc, key) => {
        acc[`mentorProfile.${key}`] = metadata[key];
        return acc;
      }, {}),
    };
    if (status === 'approved') {
      updateObj.role = 'mentor';
    } else if (status === 'rejected') {
      updateObj.role = 'student';
    }
    return User.findByIdAndUpdate(
      id,
      { $set: updateObj },
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

  async incrementMentorSessions(id, options = {}) {
    return User.findByIdAndUpdate(
      id,
      { $inc: { 'mentorProfile.totalSessions': 1 } },
      { new: true, ...options }
    ).select('-password');
  }

  async applyAsMentor(id, profileData) {
    const updateObj = {
      'mentorProfile.approvalStatus': 'pending',
    };
    
    const mentorFields = [
      'expertise', 'bio', 'experienceYears', 'pricePerSession',
      'sessionDuration', 'autoConfirm', 'sessionNotes',
      'linkedinUrl', 'languages', 'currentCompany', 'currentTitle',
      'location', 'education'
    ];
    
    for (const field of mentorFields) {
      if (profileData[field] !== undefined) {
        updateObj[`mentorProfile.${field}`] = profileData[field];
      }
    }

    return User.findByIdAndUpdate(id, { $set: updateObj }, { new: true })
      .select('-password')
      .lean();
  }

  async updateUserProfile(id, profileData) {
    const updateObj = {};
    if (profileData.name !== undefined) updateObj.name = profileData.name;
    if (profileData.email !== undefined) updateObj.email = profileData.email;
    if (profileData.clerkId !== undefined) updateObj.clerkId = profileData.clerkId;
    if (profileData.profileImage !== undefined) updateObj.profileImage = profileData.profileImage;
    if (profileData.phoneNumber !== undefined) updateObj.phoneNumber = profileData.phoneNumber;
    if (profileData.role !== undefined) updateObj.role = profileData.role;
    if (profileData.timezone !== undefined) updateObj.timezone = profileData.timezone;
    if (profileData.profileVisibility !== undefined) updateObj.profileVisibility = profileData.profileVisibility;
    if (profileData.emailVerification !== undefined) updateObj.emailVerification = profileData.emailVerification;
    
    if (profileData.notificationPreferences) {
      if (profileData.notificationPreferences.email !== undefined) updateObj['notificationPreferences.email'] = profileData.notificationPreferences.email;
      if (profileData.notificationPreferences.sms !== undefined) updateObj['notificationPreferences.sms'] = profileData.notificationPreferences.sms;
      if (profileData.notificationPreferences.marketing !== undefined) updateObj['notificationPreferences.marketing'] = profileData.notificationPreferences.marketing;
    }
    
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
        'sessionDuration', 'autoConfirm', 'sessionNotes',
        'linkedinUrl', 'languages', 'currentCompany', 'currentTitle',
        'location', 'education'
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
