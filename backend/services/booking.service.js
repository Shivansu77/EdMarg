const bookingRepository = require('../repositories/booking.repository');
const availabilityRepository = require('../repositories/availability.repository');
const userRepository = require('../repositories/user.repository');
const { ValidationError, NotFoundError } = require('../utils/errors');

class BookingService {
  /**
   * Create a new booking for a student with a mentor.
   * Respects mentor's sessionDuration and autoConfirm settings.
   */
  async createBooking({ studentId, mentorId, date, startTime, sessionType, notes }) {
    // Validate mentor exists and is approved
    const mentor = await userRepository.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      throw new NotFoundError('Mentor not found');
    }

    // Prevent self-booking
    if (String(studentId) === String(mentorId)) {
      throw new ValidationError('You cannot book a session with yourself');
    }

    // Parse date and validate it's in the future
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      throw new ValidationError('Cannot book a session in the past');
    }

    // Check if the slot is in mentor's availability
    const dayOfWeek = bookingDate.getDay();
    const availability = await availabilityRepository.findByMentorAndDay(mentorId, dayOfWeek);

    if (!availability || !availability.slots || availability.slots.length === 0) {
      throw new ValidationError('Mentor is not available on this day');
    }

    const slotExists = availability.slots.some((s) => s.startTime === startTime);
    if (!slotExists) {
      throw new ValidationError('Selected time slot is not in mentor\'s schedule');
    }

    // Check for conflicts (double-booking)
    const conflict = await bookingRepository.findConflict(mentorId, bookingDate, startTime);
    if (conflict) {
      throw new ValidationError('This time slot is already booked');
    }

    // Use mentor's session duration (default 45 min)
    const sessionDuration = mentor.mentorProfile?.sessionDuration || 45;
    const endTime = this._calculateEndTime(startTime, sessionDuration);

    // Capture price at booking time
    const price = mentor.mentorProfile?.pricePerSession || 0;

    // Auto-confirm if mentor has autoConfirm enabled
    const autoConfirm = mentor.mentorProfile?.autoConfirm !== false; // default true
    const status = autoConfirm ? 'confirmed' : 'pending';

    return bookingRepository.create({
      student: studentId,
      mentor: mentorId,
      date: bookingDate,
      startTime,
      endTime,
      sessionDuration,
      sessionType: sessionType || 'video',
      status,
      notes: notes || '',
      price,
    });
  }

  /**
   * Get bookings for a student.
   */
  async getStudentBookings(studentId, { page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      bookingRepository.findByStudent(studentId, { skip, limit, status }),
      bookingRepository.countByStudent(studentId, { status }),
    ]);

    return { bookings, total, page, pages: Math.ceil(total / limit) };
  }

  /**
   * Get bookings for a mentor with pagination and counts.
   */
  async getMentorBookings(mentorId, { page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      bookingRepository.findByMentor(mentorId, { skip, limit, status }),
      bookingRepository.countByMentor(mentorId, { status }),
    ]);

    return { bookings, total, page, pages: Math.ceil(total / limit) };
  }

  /**
   * Get upcoming bookings for a mentor.
   */
  async getUpcomingMentorBookings(mentorId, limit = 10) {
    return bookingRepository.findUpcomingByMentor(mentorId, limit);
  }

  /**
   * Get mentor's booking dashboard stats.
   */
  async getMentorBookingStats(mentorId) {
    const [pending, confirmed, completed, cancelled, total] = await Promise.all([
      bookingRepository.countByMentor(mentorId, { status: 'pending' }),
      bookingRepository.countByMentor(mentorId, { status: 'confirmed' }),
      bookingRepository.countByMentor(mentorId, { status: 'completed' }),
      bookingRepository.countByMentor(mentorId, { status: 'cancelled' }),
      bookingRepository.countByMentor(mentorId),
    ]);

    return { pending, confirmed, completed, cancelled, total };
  }

  /**
   * Mentor accepts a pending booking.
   */
  async acceptBooking(bookingId, mentorId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (String(booking.mentor._id) !== String(mentorId)) {
      throw new ValidationError('You are not authorized to manage this booking');
    }

    if (booking.status !== 'pending') {
      throw new ValidationError(`Cannot accept a booking with status "${booking.status}"`);
    }

    return bookingRepository.updateStatus(bookingId, 'confirmed');
  }

  /**
   * Mentor rejects a pending booking.
   */
  async rejectBooking(bookingId, mentorId, reason) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (String(booking.mentor._id) !== String(mentorId)) {
      throw new ValidationError('You are not authorized to manage this booking');
    }

    if (booking.status !== 'pending') {
      throw new ValidationError(`Cannot reject a booking with status "${booking.status}"`);
    }

    return bookingRepository.updateStatus(bookingId, 'rejected', {
      cancellationReason: reason || 'Rejected by mentor',
    });
  }

  /**
   * Mentor starts a session (marks booking as in-progress).
   */
  async startSession(bookingId, mentorId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (String(booking.mentor._id) !== String(mentorId)) {
      throw new ValidationError('You are not authorized to conduct this session');
    }

    if (booking.status !== 'confirmed') {
      throw new ValidationError(`Cannot start a session with status "${booking.status}"`);
    }

    return bookingRepository.updateStatus(bookingId, 'in-progress', {
      conductedAt: new Date(),
    });
  }

  /**
   * Mentor completes a session.
   */
  async completeSession(bookingId, mentorId, mentorNotes) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (String(booking.mentor._id) !== String(mentorId)) {
      throw new ValidationError('You are not authorized to complete this session');
    }

    if (!['confirmed', 'in-progress'].includes(booking.status)) {
      throw new ValidationError(`Cannot complete a session with status "${booking.status}"`);
    }

    // Increment mentor's total sessions count
    await userRepository.incrementMentorSessions(mentorId);

    return bookingRepository.updateStatus(bookingId, 'completed', {
      completedAt: new Date(),
      mentorNotes: mentorNotes || '',
      ...(booking.status !== 'in-progress' ? { conductedAt: new Date() } : {}),
    });
  }

  /**
   * Cancel a booking.
   */
  async cancelBooking(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Only the student or mentor involved can cancel
    const isStudent = String(booking.student._id) === String(userId);
    const isMentor = String(booking.mentor._id) === String(userId);

    if (!isStudent && !isMentor) {
      throw new ValidationError('You are not authorized to cancel this booking');
    }

    if (['cancelled', 'rejected'].includes(booking.status)) {
      throw new ValidationError('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new ValidationError('Cannot cancel a completed booking');
    }

    return bookingRepository.updateStatus(bookingId, 'cancelled', {
      cancellationReason: isStudent ? 'Cancelled by student' : 'Cancelled by mentor',
    });
  }

  /**
   * Get available slots for a mentor on a specific date.
   */
  async getAvailableSlots(mentorId, dateStr) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const dayOfWeek = date.getDay();

    // Get mentor's schedule for this day
    const availability = await availabilityRepository.findByMentorAndDay(mentorId, dayOfWeek);

    if (!availability || !availability.slots || availability.slots.length === 0) {
      return [];
    }

    // Get already booked slots for this date
    const bookedSlots = await bookingRepository.findBookedSlots(mentorId, date);
    const bookedStartTimes = new Set(bookedSlots.map((b) => b.startTime));

    // Return slots with availability status
    return availability.slots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      available: !bookedStartTimes.has(slot.startTime),
    }));
  }

  /**
   * Calculate end time given a start time and duration in minutes.
   */
  _calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }
}

module.exports = new BookingService();
