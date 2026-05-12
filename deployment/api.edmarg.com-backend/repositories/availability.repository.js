const { Availability } = require('../models/availability.model');

class AvailabilityRepository {
  async findByMentor(mentorId) {
    return Availability.find({ mentor: mentorId })
      .sort({ dayOfWeek: 1 })
      .lean();
  }

  async findByMentorAndDay(mentorId, dayOfWeek) {
    return Availability.findOne({ mentor: mentorId, dayOfWeek }).lean();
  }

  async upsert(mentorId, dayOfWeek, slots) {
    return Availability.findOneAndUpdate(
      { mentor: mentorId, dayOfWeek },
      { mentor: mentorId, dayOfWeek, slots },
      { upsert: true, new: true }
    );
  }

  async bulkUpsert(mentorId, schedules) {
    const ops = schedules.map(({ dayOfWeek, slots }) => ({
      updateOne: {
        filter: { mentor: mentorId, dayOfWeek },
        update: { mentor: mentorId, dayOfWeek, slots },
        upsert: true,
      },
    }));

    return Availability.bulkWrite(ops);
  }

  async deleteByMentor(mentorId) {
    return Availability.deleteMany({ mentor: mentorId });
  }
}

module.exports = new AvailabilityRepository();
