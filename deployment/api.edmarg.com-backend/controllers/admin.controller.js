const adminService = require('../services/admin.service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const role = req.query.role || null;
    const search = req.query.search || '';

    const result = await adminService.getAllUsers(page, limit, role, search);

    res.status(200).json({
      success: true,
      count: result.users.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.users,
    });
  } catch (err) {
    next(err);
  }
};


exports.getPendingMentors = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const result = await adminService.getPendingMentors(page, limit);

    res.status(200).json({
      success: true,
      count: result.mentors.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.mentors,
    });
  } catch (err) {
    next(err);
  }
};

exports.approveMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await adminService.approveMentor(id, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Mentor approved successfully',
      data: mentor,
    });
  } catch (err) {
    next(err);
  }
};

exports.rejectMentor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const mentor = await adminService.rejectMentor(id, reason);

    res.status(200).json({
      success: true,
      message: 'Mentor rejected successfully',
      data: mentor,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPlatformStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPlatformStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAssessmentSubmissions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);

    const result = await adminService.getAssessmentSubmissions(page, limit);

    res.status(200).json({
      success: true,
      count: result.assessments.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.assessments,
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteUser(id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const status = req.query.status || 'all';
    const search = req.query.search || '';

    const result = await adminService.getAllBookings(page, limit, { status, search });

    res.status(200).json({
      success: true,
      count: result.bookings.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.bookings,
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reason = req.body.reason || 'Cancelled by admin';
    const booking = await adminService.cancelBooking(id, reason);
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

exports.getBookingStats = async (req, res, next) => {
  try {
    const breakdown = await adminService.getBookingStatusBreakdown();
    res.status(200).json({ success: true, data: breakdown });
  } catch (err) {
    next(err);
  }
};

exports.getAllRecordings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const status = req.query.status || 'all';
    const search = req.query.search || '';
    const type = req.query.type || 'all';
    const sortField = req.query.sortField || 'date';
    const sortAsc = req.query.sortAsc === 'true';

    const result = await adminService.getAllRecordings(page, limit, { status, search, type, sortField, sortAsc });

    res.status(200).json({
      success: true,
      count: result.recordings.length,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.recordings,
    });
  } catch (err) {
    next(err);
  }
};
