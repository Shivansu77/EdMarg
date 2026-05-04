const goalService = require('../services/goal.service');

exports.createGoal = async (req, res, next) => {
  try {
    const goal = await goalService.createGoal(req.user._id, req.body);
    return res.status(201).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

exports.getGoals = async (req, res, next) => {
  try {
    const goals = await goalService.getStudentGoals(req.user._id, {
      status: req.query.status || undefined,
    });
    return res.status(200).json({ success: true, data: goals });
  } catch (err) {
    next(err);
  }
};

exports.updateGoal = async (req, res, next) => {
  try {
    const goal = await goalService.updateGoal(req.params.id, req.user._id, req.body);
    return res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

exports.deleteGoal = async (req, res, next) => {
  try {
    const result = await goalService.deleteGoal(req.params.id, req.user._id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.linkSession = async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }
    const goal = await goalService.linkSession(req.params.id, req.user._id, bookingId);
    return res.status(200).json({ success: true, data: goal });
  } catch (err) {
    next(err);
  }
};

exports.getProgress = async (req, res, next) => {
  try {
    const progress = await goalService.getGoalProgress(req.user._id);
    return res.status(200).json({ success: true, data: progress });
  } catch (err) {
    next(err);
  }
};
