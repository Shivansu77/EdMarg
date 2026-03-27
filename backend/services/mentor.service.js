const userRepository = require('../repositories/user.repository');
const availabilityService = require('./availability.service');
const { ValidationError, NotFoundError } = require('../utils/errors');

/**
 * Allowed fields for mentor profile updates.
 * Prevents overwriting sensitive fields like approvalStatus.
 */
const ALLOWED_PROFILE_FIELDS = [
  'bio',
  'expertise',
  'experienceYears',
  'pricePerSession',
  'sessionDuration',
  'autoConfirm',
  'sessionNotes',
];

class MentorService {
  /**
   * Get the mentor's own profile.
   */
  async getProfile(mentorId) {
    const user = await userRepository.findById(mentorId);
    if (!user || user.role !== 'mentor') {
      throw new NotFoundError('Mentor not found');
    }

    const { password, ...profile } = user.toObject ? user.toObject() : user;
    return profile;
  }

  /**
   * Update mentor profile settings (price, duration, bio, autoConfirm, etc).
   */
  async updateProfile(mentorId, updates) {
    const user = await userRepository.findById(mentorId);
    if (!user || user.role !== 'mentor') {
      throw new NotFoundError('Mentor not found');
    }

    // Filter to only allowed fields
    const safeUpdates = {};
    for (const key of ALLOWED_PROFILE_FIELDS) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    // Validate specific fields
    if (safeUpdates.pricePerSession !== undefined) {
      const price = Number(safeUpdates.pricePerSession);
      if (isNaN(price) || price < 0) {
        throw new ValidationError('Price must be a non-negative number');
      }
      safeUpdates.pricePerSession = price;
    }

    if (safeUpdates.sessionDuration !== undefined) {
      const duration = Number(safeUpdates.sessionDuration);
      if (isNaN(duration) || duration < 15 || duration > 180) {
        throw new ValidationError('Session duration must be between 15 and 180 minutes');
      }
      safeUpdates.sessionDuration = duration;
    }

    if (safeUpdates.experienceYears !== undefined) {
      const years = Number(safeUpdates.experienceYears);
      if (isNaN(years) || years < 0) {
        throw new ValidationError('Experience years must be a non-negative number');
      }
      safeUpdates.experienceYears = years;
    }

    if (safeUpdates.expertise !== undefined) {
      if (!Array.isArray(safeUpdates.expertise)) {
        throw new ValidationError('Expertise must be an array of strings');
      }
    }

    return userRepository.updateMentorProfile(mentorId, safeUpdates);
  }

  /**
   * Get mentor's session settings summary.
   */
  async getSettings(mentorId) {
    const user = await userRepository.findById(mentorId);
    if (!user || user.role !== 'mentor') {
      throw new NotFoundError('Mentor not found');
    }

    const mp = user.mentorProfile || {};

    return {
      pricePerSession: mp.pricePerSession || 0,
      sessionDuration: mp.sessionDuration || 45,
      autoConfirm: mp.autoConfirm !== false, // default true
      sessionNotes: mp.sessionNotes || '',
      totalSessions: mp.totalSessions || 0,
      rating: mp.rating || 0,
    };
  }

  /**
   * Set mentor's availability and optionally regenerate slots from duration.
   * Accepts { dayOfWeek, startHour, endHour } and auto-generates slots.
   */
  async setAvailabilityWithDuration(mentorId, schedules) {
    const user = await userRepository.findById(mentorId);
    if (!user || user.role !== 'mentor') {
      throw new NotFoundError('Mentor not found');
    }

    const duration = user.mentorProfile?.sessionDuration || 45;
    const GAP = 15; // 15-min gap between sessions

    // Generate slots from startHour/endHour ranges
    const processedSchedules = schedules.map((schedule) => {
      // If slots are provided directly, use them
      if (schedule.slots && schedule.slots.length > 0) {
        return schedule;
      }

      // Otherwise generate from startHour/endHour
      const startHour = schedule.startHour ?? 9;
      const endHour = schedule.endHour ?? 17;

      const slots = [];
      let currentMinutes = startHour * 60;
      const endMinutes = endHour * 60;

      while (currentMinutes + duration <= endMinutes) {
        const sH = Math.floor(currentMinutes / 60);
        const sM = currentMinutes % 60;
        const eTotal = currentMinutes + duration;
        const eH = Math.floor(eTotal / 60);
        const eM = eTotal % 60;

        slots.push({
          startTime: `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`,
          endTime: `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`,
        });

        currentMinutes = eTotal + GAP;
      }

      return { dayOfWeek: schedule.dayOfWeek, slots };
    });

    return availabilityService.setAvailability(mentorId, processedSchedules);
  }
}

module.exports = new MentorService();
