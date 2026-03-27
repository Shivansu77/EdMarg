const availabilityRepository = require('../repositories/availability.repository');
const { ValidationError } = require('../utils/errors');

class AvailabilityService {
  /**
   * Get a mentor's weekly availability schedule.
   */
  async getMentorAvailability(mentorId) {
    return availabilityRepository.findByMentor(mentorId);
  }

  /**
   * Set or update a mentor's availability for specific days.
   * @param {string} mentorId
   * @param {Array<{ dayOfWeek: number, slots: Array<{ startTime: string, endTime: string }> }>} schedules
   */
  async setAvailability(mentorId, schedules) {
    if (!Array.isArray(schedules) || schedules.length === 0) {
      throw new ValidationError('Schedules must be a non-empty array');
    }

    for (const schedule of schedules) {
      if (typeof schedule.dayOfWeek !== 'number' || schedule.dayOfWeek < 0 || schedule.dayOfWeek > 6) {
        throw new ValidationError('dayOfWeek must be a number between 0 (Sunday) and 6 (Saturday)');
      }

      if (!Array.isArray(schedule.slots)) {
        throw new ValidationError('slots must be an array');
      }

      for (const slot of schedule.slots) {
        if (!slot.startTime || !slot.endTime) {
          throw new ValidationError('Each slot must have startTime and endTime');
        }
      }
    }

    return availabilityRepository.bulkUpsert(mentorId, schedules);
  }
}

module.exports = new AvailabilityService();
