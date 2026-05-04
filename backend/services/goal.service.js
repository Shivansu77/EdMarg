const { Goal } = require('../models/goal.model');
const { ValidationError, NotFoundError } = require('../utils/errors');

class GoalService {
  /**
   * Create a new goal for a student.
   */
  async createGoal(studentId, data) {
    if (!data.title || !data.title.trim()) {
      throw new ValidationError('Goal title is required');
    }

    const activeGoals = await Goal.countDocuments({ student: studentId, status: 'active' });
    if (activeGoals >= 10) {
      throw new ValidationError('You can have at most 10 active goals. Complete or pause existing ones first.');
    }

    const goal = await Goal.create({
      student: studentId,
      title: data.title.trim(),
      description: (data.description || '').trim(),
      category: data.category || 'technical',
      targetDate: data.targetDate || null,
      milestones: (data.milestones || []).map(m => ({
        title: String(m.title || '').trim(),
        completed: false,
      })).filter(m => m.title),
    });

    return goal;
  }

  /**
   * Get all goals for a student.
   */
  async getStudentGoals(studentId, { status } = {}) {
    const query = { student: studentId };
    if (status) query.status = status;

    return Goal.find(query)
      .sort({ status: 1, updatedAt: -1 })
      .populate('linkedSessions', 'date startTime endTime status mentor mentorNotes sessionSummary actionItems')
      .lean();
  }

  /**
   * Update a goal.
   */
  async updateGoal(goalId, studentId, updates) {
    const goal = await Goal.findOne({ _id: goalId, student: studentId });
    if (!goal) throw new NotFoundError('Goal not found');

    const allowed = ['title', 'description', 'category', 'status', 'targetDate', 'progress'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        goal[key] = updates[key];
      }
    }

    // Handle milestone updates
    if (updates.milestones && Array.isArray(updates.milestones)) {
      goal.milestones = updates.milestones.map(m => ({
        _id: m._id || undefined,
        title: String(m.title || '').trim(),
        completed: Boolean(m.completed),
        completedAt: m.completed ? (m.completedAt || new Date()) : undefined,
      })).filter(m => m.title);

      // Auto-calculate progress from milestones if there are any
      if (goal.milestones.length > 0) {
        const completedCount = goal.milestones.filter(m => m.completed).length;
        goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
      }
    }

    // Auto-complete if progress reaches 100
    if (goal.progress >= 100 && goal.status === 'active') {
      goal.status = 'completed';
    }

    await goal.save();
    return goal.toObject();
  }

  /**
   * Delete a goal.
   */
  async deleteGoal(goalId, studentId) {
    const goal = await Goal.findOneAndDelete({ _id: goalId, student: studentId });
    if (!goal) throw new NotFoundError('Goal not found');
    return { deleted: true };
  }

  /**
   * Link a completed session to a goal.
   */
  async linkSession(goalId, studentId, bookingId) {
    const goal = await Goal.findOne({ _id: goalId, student: studentId });
    if (!goal) throw new NotFoundError('Goal not found');

    const alreadyLinked = goal.linkedSessions.some(id => String(id) === String(bookingId));
    if (!alreadyLinked) {
      goal.linkedSessions.push(bookingId);
      await goal.save();
    }

    return goal.toObject();
  }

  /**
   * Get aggregated progress stats for dashboard widget.
   */
  async getGoalProgress(studentId) {
    const goals = await Goal.find({ student: studentId }).lean();

    const active = goals.filter(g => g.status === 'active');
    const completed = goals.filter(g => g.status === 'completed');
    const paused = goals.filter(g => g.status === 'paused');

    const avgProgress = active.length > 0
      ? Math.round(active.reduce((sum, g) => sum + (g.progress || 0), 0) / active.length)
      : 0;

    // Find next upcoming milestone across all active goals
    let nextMilestone = null;
    for (const goal of active) {
      const pending = (goal.milestones || []).find(m => !m.completed);
      if (pending) {
        nextMilestone = { goalTitle: goal.title, milestone: pending.title };
        break;
      }
    }

    // Find nearest target date
    let nearestDeadline = null;
    for (const goal of active) {
      if (goal.targetDate) {
        const d = new Date(goal.targetDate);
        if (!nearestDeadline || d < nearestDeadline.date) {
          nearestDeadline = { goalTitle: goal.title, date: d };
        }
      }
    }

    return {
      totalGoals: goals.length,
      activeCount: active.length,
      completedCount: completed.length,
      pausedCount: paused.length,
      avgProgress,
      totalSessions: active.reduce((sum, g) => sum + (g.linkedSessions?.length || 0), 0),
      nextMilestone,
      nearestDeadline: nearestDeadline ? { goalTitle: nearestDeadline.goalTitle, date: nearestDeadline.date.toISOString() } : null,
    };
  }
}

module.exports = new GoalService();
