const adminService = require('../services/admin.service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const role = req.query.role || null;

    const result = await adminService.getAllUsers(page, limit, role);

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
