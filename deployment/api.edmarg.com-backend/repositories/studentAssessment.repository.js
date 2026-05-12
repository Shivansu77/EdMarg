const { StudentAssessment } = require('../models/studentAssessment.model');

class StudentAssessmentRepository {
  
  async upsertAssessment(studentId, answers, result) {
    const updatePayload = { answers };

    if (result !== undefined) {
      updatePayload.result = result;
    }

    return StudentAssessment.findOneAndUpdate(
      { student: studentId },
      updatePayload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
  }

  async findByStudent(studentId) {
    return StudentAssessment.findOne({ student: studentId }).lean();
  }

  async findRecent({ page = 1, limit = 20 } = {}) {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    return StudentAssessment.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate('student', 'name email role')
      .lean();
  }

  async countAll() {
    return StudentAssessment.countDocuments({});
  }
}

module.exports = new StudentAssessmentRepository();