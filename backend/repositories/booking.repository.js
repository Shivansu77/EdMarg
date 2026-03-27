const { Booking } = require('../models/booking.model');

class BookingRepository {
  async create(data) {
    return Booking.create(data);
  }

  async findById(id) {
    return Booking.findById(id)
      .populate('student', 'name email profileImage')
      .populate('mentor', 'name email profileImage mentorProfile')
      .lean();
  }

  async findByStudent(studentId, { skip = 0, limit = 20, status } = {}) {
    const query = { student: studentId };
    if (status) query.status = status;

    return Booking.find(query)
      .populate('mentor', 'name email profileImage mentorProfile')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByStudent(studentId, { status } = {}) {
    const query = { student: studentId };
    if (status) query.status = status;
    return Booking.countDocuments(query);
  }

  async findByMentor(mentorId, { skip = 0, limit = 20, status } = {}) {
    const query = { mentor: mentorId };
    if (status) query.status = status;

    return Booking.find(query)
      .populate('student', 'name email profileImage')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async findConflict(mentorId, date, startTime) {
    return Booking.findOne({
      mentor: mentorId,
      date,
      startTime,
      status: { $ne: 'cancelled' },
    }).lean();
  }

  async findBookedSlots(mentorId, date) {
    return Booking.find({
      mentor: mentorId,
      date,
      status: { $ne: 'cancelled' },
    })
      .select('startTime endTime')
      .lean();
  }

  async updateStatus(id, status, metadata = {}) {
    return Booking.findByIdAndUpdate(
      id,
      { status, ...metadata },
      { new: true }
    )
      .populate('student', 'name email profileImage')
      .populate('mentor', 'name email profileImage mentorProfile');
  }

  async countByMentor(mentorId, { status } = {}) {
    const query = { mentor: mentorId };
    if (status) query.status = status;
    return Booking.countDocuments(query);
  }

  async findUpcomingByMentor(mentorId, limit = 10) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return Booking.find({
      mentor: mentorId,
      date: { $gte: now },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('student', 'name email profileImage')
      .sort({ date: 1, startTime: 1 })
      .limit(limit)
      .lean();
  }
}

module.exports = new BookingRepository();
